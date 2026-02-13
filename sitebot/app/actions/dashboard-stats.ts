'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'
import { subDays, format } from 'date-fns'
import { getSubscriptionWithPlan } from '@/app/actions/subscription'

// Helper to get user's chatbot IDs
async function getUserChatbotIds(userId: string) {
    const supabase = createAdminClient()
    const { data: bots } = await supabase
        .from('chatbots')
        .select('id')
        .eq('user_id', userId)

    return bots?.map(b => b.id) || []
}

// Get total messages used this month (across all chatbots for the current user)
export async function getMonthlyUsage() {
    noStore()
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { used: 0, limit: 0, percentage: 0 }

    // 2. Get Plan Limits
    const { plan } = await getSubscriptionWithPlan()
    const limit = plan ? plan.messagesPerMonth : 0

    // 3. Get User's Chatbots
    const botIds = await getUserChatbotIds(user.id)

    if (botIds.length === 0) {
        return { used: 0, limit, percentage: 0 }
    }

    const adminClient = createAdminClient()

    // Get start of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count all messages this month for user's chatbots
    const { count: totalMessages } = await adminClient
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('chatbot_id', botIds)
        .gte('created_at', startOfMonth.toISOString())

    const used = totalMessages || 0
    let percentage = 0
    
    if (limit > 0) {
        percentage = Math.round((used / limit) * 10000) / 100
    } else if (limit === 0 && used > 0) {
        percentage = 100 // Over limit
    }

    return {
        used,
        limit,
        percentage
    }
}

// Get total training characters used (estimate based on chunks)
export async function getTrainingUsage() {
    noStore()
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { used: 0, limit: 0, percentage: 0 }

    // 2. Get Plan Limits
    const { plan } = await getSubscriptionWithPlan()
    // Convert MB to approx characters (1MB ~= 1,000,000 chars)
    const limit = plan ? (plan.maxTrainingSizeMB * 1000000) : 0

    // 3. Get User's Chatbots
    const botIds = await getUserChatbotIds(user.id)

    if (botIds.length === 0) {
        return { used: 0, limit, percentage: 0 }
    }

    const adminClient = createAdminClient()

    // Get training sources and sum chunks
    const { data: sources } = await adminClient
        .from('training_sources')
        .select('chunks_count')
        .in('chatbot_id', botIds)

    // Estimate ~500 chars per chunk on average
    let totalChunks = 0
    if (sources) {
        sources.forEach(source => {
            totalChunks += (source.chunks_count || 0)
        })
    }

    const totalChars = totalChunks * 500
    
    let percentage = 0
    if (limit > 0) {
        percentage = Math.round((totalChars / limit) * 10000) / 100
    } else if (limit === 0 && totalChars > 0) {
        percentage = 100
    }

    return {
        used: totalChars,
        limit,
        percentage
    }
}

// Get daily sessions for the last 7 days (across all chatbots)
export async function getDailySessions() {
    noStore()
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    // Return empty graph if no user
    const days = 7
    const initialData = []
    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        initialData.push({
            date: format(date, 'yyyy-MM-dd'),
            label: format(date, 'EEE'),
            sessions: 0
        })
    }

    if (!user) return initialData

    // 2. Get User's Chatbots
    const botIds = await getUserChatbotIds(user.id)

    if (botIds.length === 0) {
        return initialData
    }

    const adminClient = createAdminClient()
    const startDateStr = subDays(new Date(), days).toISOString()

    // Fetch all sessions in range
    const { data: sessions } = await adminClient
        .from('chat_sessions')
        .select('started_at')
        .in('chatbot_id', botIds)
        .gte('started_at', startDateStr)

    // Aggregate by day
    if (sessions) {
        sessions.forEach(s => {
            const d = format(new Date(s.started_at), 'yyyy-MM-dd')
            const entry = initialData.find(item => item.date === d)
            if (entry) entry.sessions++
        })
    }

    return initialData
}

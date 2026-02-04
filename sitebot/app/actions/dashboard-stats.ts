'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'
import { subDays, format } from 'date-fns'

// Get total messages used this month (across all chatbots for the current user)
export async function getMonthlyUsage() {
    noStore()
    const supabase = createAdminClient()

    // Get start of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count all messages this month
    const { count: totalMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

    const limit = 10000 // Free plan limit
    const used = totalMessages || 0
    const percentage = Math.round((used / limit) * 10000) / 100 // Two decimal places

    return {
        used,
        limit,
        percentage
    }
}

// Get total training characters used (estimate based on chunks)
export async function getTrainingUsage() {
    noStore()
    const supabase = createAdminClient()

    // Get training sources and sum chunks
    const { data: sources } = await supabase
        .from('training_sources')
        .select('chunks_count, source_name')

    // Estimate ~500 chars per chunk on average (typical chunk size)
    let totalChunks = 0
    if (sources) {
        sources.forEach(source => {
            totalChunks += (source.chunks_count || 0)
        })
    }

    // Approximate character count (avg 500 chars per chunk)
    const totalChars = totalChunks * 500

    const limit = 400000 // Free plan limit
    const percentage = Math.round((totalChars / limit) * 10000) / 100

    return {
        used: totalChars,
        limit,
        percentage
    }
}

// Get daily sessions for the last 7 days (across all chatbots)
export async function getDailySessions() {
    noStore()
    const supabase = createAdminClient()

    const days = 7
    const startDateStr = subDays(new Date(), days).toISOString()

    // Generate empty data for last 7 days
    const data: { date: string; label: string; sessions: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        data.push({
            date: format(date, 'yyyy-MM-dd'),
            label: format(date, 'EEE'), // Mon, Tue, etc.
            sessions: 0
        })
    }

    // Fetch all sessions in range
    const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('started_at')
        .gte('started_at', startDateStr)

    // Aggregate by day
    if (sessions) {
        sessions.forEach(s => {
            const d = format(new Date(s.started_at), 'yyyy-MM-dd')
            const entry = data.find(item => item.date === d)
            if (entry) entry.sessions++
        })
    }

    return data
}

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'
import { startOfDay, subDays, format } from 'date-fns'

export async function getAnalyticsStats(chatbotId: string, range: string = '7d') {
    noStore()
    const supabase = createAdminClient()

    let startDate = new Date()
    if (range === '24h') startDate = subDays(new Date(), 1)
    else if (range === '30d') startDate = subDays(new Date(), 30)
    else startDate = subDays(new Date(), 7) // default 7d

    const startDateStr = startDate.toISOString()

    // 1. Total Sessions in Range
    const { count: totalSessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('chatbot_id', chatbotId)
        .gte('started_at', startDateStr) // Using started_at for sessions

    // 2. Total Messages in Range
    // Note: We need to join or filter by session's chatbot_id. 
    // Since RLS might be bypassed by admin, we can query chat_messages directly if we join, 
    // but typically we need to filter by sessions.
    // For performance, we'll fetch sessions IDs first or use a join if supported by PostgREST simple count.
    // Actually, Supabase straightforward count with inner join:
    const { count: totalMessages, error: msgError } = await supabase
        .from('chat_messages')
        .select('session_id, chat_sessions!inner(chatbot_id)', { count: 'exact', head: true })
        .eq('chat_sessions.chatbot_id', chatbotId)
        .gte('created_at', startDateStr)

    // 3. Total Leads
    const { count: totalLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('chatbot_id', chatbotId)
        .gte('created_at', startDateStr)

    // 4. Avg Messages per Session (Heuristic)
    const avgMessages = totalSessions && totalSessions > 0
        ? Math.round(((totalMessages || 0) / totalSessions) * 10) / 10
        : 0

    if (sessionError || msgError || leadsError) {
        console.error('Analytics Error:', sessionError, msgError, leadsError)
    }

    return {
        totalSessions: totalSessions || 0,
        totalMessages: totalMessages || 0,
        totalLeads: totalLeads || 0,
        avgMessages
    }
}

export async function getChartData(chatbotId: string, range: string = '7d') {
    noStore()
    const supabase = createAdminClient()

    let days = 7
    if (range === '30d') days = 30

    // Generate dates
    const data: { date: string; fullDate: string; sessions: number; messages: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        data.push({
            date: format(date, 'MMM dd'),
            fullDate: format(date, 'yyyy-MM-dd'),
            sessions: 0,
            messages: 0
        })
    }

    const startDateStr = subDays(new Date(), days).toISOString()

    // Fetch Sessions grouped by day (Client-side aggregation for MVP as SQL group by is complex via JS SDK)
    const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('started_at')
        .eq('chatbot_id', chatbotId)
        .gte('started_at', startDateStr)

    // Fetch Messages grouped by day
    const { data: messages } = await supabase
        .from('chat_messages')
        .select('created_at, chat_sessions!inner(chatbot_id)')
        .eq('chat_sessions.chatbot_id', chatbotId)
        .gte('created_at', startDateStr)

    // Aggregate
    if (sessions) {
        sessions.forEach(s => {
            const d = format(new Date(s.started_at), 'MMM dd')
            const entry = data.find(item => item.date === d)
            if (entry) entry.sessions++
        })
    }

    if (messages) {
        messages.forEach(m => {
            const d = format(new Date(m.created_at), 'MMM dd')
            const entry = data.find(item => item.date === d)
            if (entry) entry.messages++
        })
    }

    return data
}

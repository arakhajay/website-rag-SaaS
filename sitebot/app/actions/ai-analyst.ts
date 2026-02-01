'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { getAnalyticsStats } from './analytics'
import { logChatMessage, getOrCreateChatSession } from './chat-logs'

export async function generateAIAnalysis(chatbotId: string) {
    const supabase = createAdminClient()

    // 1. Fetch Context Data
    const stats = await getAnalyticsStats(chatbotId, '30d')

    // Fetch a sample of "I don't know" or recent user queries to find gaps
    // For MVP, we'll just sample last 20 user messages
    const { data: recentMessages } = await supabase
        .from('chat_messages')
        .select('content')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(20)

    // Join messages for context
    const userQueries = recentMessages?.map(m => `"${m.content}"`).join(', ') || "No recent queries."

    // 2. Generate Prompt
    const prompt = `
    Act as a Data Analyst for a Chatbot.
    
    DATA:
    - Total Sessions (30d): ${stats.totalSessions}
    - Total Messages (30d): ${stats.totalMessages}
    - Total Leads (30d): ${stats.totalLeads}
    - Avg Messages/Session: ${stats.avgMessages}
    - Recent User Queries: [${userQueries}]
    
    TASK:
    Analyze this data and provide:
    1. A short summary (2 sentences).
    2. Three specific trends (e.g., "High engagement but low leads").
    3. Three actionable recommendations to improve the chatbot (e.g., "Add pricing to knowledge base").
    
    FORMAT JSON:
    {
        "summary": "...",
        "trends": ["...", "...", "..."],
        "recommendations": [
            { "title": "...", "action": "...", "priority": "High/Medium/Low" }
        ]
    }
    `

    try {
        const { text } = await generateText({
            model: openai('gpt-4o'),
            system: "You are a helpful data analyst. Output valid JSON only.",
            prompt: prompt,
        })

        let analysis;
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
            analysis = JSON.parse(cleanText)
        } catch (e) {
            console.error('JSON Parse Error:', e)
            return { error: 'Failed to parse analysis' }
        }

        // 3. LOG USAGE (Billing)
        // We create a special "analytics_usage" session specifically for tracking this cost.
        const trackingSessionId = `analytics_usage_${chatbotId}`
        await getOrCreateChatSession(chatbotId, trackingSessionId, 'dashboard')

        // We need to get the DB ID for this session
        const { data: dbSession } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('session_id', trackingSessionId)
            .single()

        if (dbSession) {
            await logChatMessage(dbSession.id, 'assistant', `Generated Analytics Report. Cost: 1 AI Credit.`)
        }

        return { success: true, data: analysis }

    } catch (error) {
        console.error('AI Analyst Error:', error)
        return { error: 'Failed to generate analysis' }
    }
}

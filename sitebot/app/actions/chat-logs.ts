'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'

// Get or create a chat session
export async function getOrCreateChatSession(
    chatbotId: string,
    sessionId: string,
    source: 'widget' | 'dashboard' = 'widget'
) {
    const supabase = createAdminClient()

    // Check if session exists
    const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('chatbot_id', chatbotId)
        .eq('session_id', sessionId)
        .single()

    if (existingSession) {
        // Update the updated_at timestamp
        await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingSession.id)
        return existingSession.id
    }

    // Create new session
    const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({
            chatbot_id: chatbotId,
            session_id: sessionId,
            source,
        })
        .select('id')
        .single()

    if (error) {
        console.error('[ChatLogs] Error creating session:', error)
        return null
    }

    return newSession.id
}

// Log a chat message
export async function logChatMessage(
    dbSessionId: string,
    role: 'user' | 'assistant',
    content: string
) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('chat_messages')
        .insert({
            session_id: dbSessionId,
            role,
            content,
        })

    if (error) {
        console.error('[ChatLogs] Error logging message:', error)
    }
}

// Get chat sessions for a chatbot
export async function getChatSessions(chatbotId: string) {
    noStore()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
            id,
            session_id,
            source,
            started_at,
            updated_at,
            chat_messages(count)
        `)
        .eq('chatbot_id', chatbotId)
        .order('updated_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('[ChatLogs] Error fetching sessions:', error)
        return []
    }

    return data || []
}

// Get messages for a session
export async function getChatMessages(dbSessionId: string) {
    noStore()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', dbSessionId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('[ChatLogs] Error fetching messages:', error)
        return []
    }

    return data || []
}

// Clear all chat logs for a chatbot
export async function clearChatLogs(chatbotId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('chatbot_id', chatbotId)

    if (error) {
        console.error('[ChatLogs] Error clearing logs:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createChatbot(name: string, baseUrl: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
        // Try using admin client to create for demo purposes
        // In production, you'd want to enforce login
        const adminClient = createAdminClient()

        // Get or create a demo user
        const { data: existingUsers } = await adminClient
            .from('profiles')
            .select('id')
            .limit(1)

        if (existingUsers && existingUsers.length > 0) {
            const userId = existingUsers[0].id

            const { data: newBot, error } = await adminClient
                .from('chatbots')
                .insert({
                    name,
                    base_url: baseUrl,
                    user_id: userId
                })
                .select()
                .single()

            if (error) {
                console.error('Admin insert error:', error)
                return { success: false, error: error.message }
            }

            return { success: true, chatbot: newBot }
        }

        return { success: false, error: 'No users found. Please sign up first.' }
    }

    // User is authenticated - use normal client
    const { data: newBot, error } = await supabase
        .from('chatbots')
        .insert({
            name,
            base_url: baseUrl,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Insert error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, chatbot: newBot }
}

export async function deleteChatbot(chatbotId: string) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Delete chatbot
    const { error } = await adminClient
        .from('chatbots')
        .delete()
        .eq('id', chatbotId)

    if (error) {
        return { success: false, error: error.message }
    }

    // TODO: Also delete vectors from Pinecone

    return { success: true }
}

export async function getChatbots() {
    const adminClient = createAdminClient()

    const { data: chatbots, error } = await adminClient
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message, chatbots: [] }
    }

    return { success: true, chatbots: chatbots || [] }
}

export async function getChatbot(chatbotId: string) {
    const adminClient = createAdminClient()

    const { data: chatbot, error } = await adminClient
        .from('chatbots')
        .select('*')
        .eq('id', chatbotId)
        .single()

    if (error) {
        return { success: false, error: error.message, chatbot: null }
    }

    return { success: true, chatbot }
}

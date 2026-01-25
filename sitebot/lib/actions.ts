'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ingestSource } from './ingest'

export type ActionState = {
    error?: string
    success?: boolean
    data?: any
}

export async function createChatbot(formData: FormData): Promise<ActionState> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check profile
    const { data: profile } = await supabase.from('profiles').select('id, plan').eq('id', user.id).single()
    if (!profile) {
        // Create profile if missing (fallback, though trigger handles it)
        await supabase.from('profiles').insert({ id: user.id, email: user.email })
    }

    const name = formData.get('name') as string
    const baseUrl = formData.get('baseUrl') as string

    if (!name || !baseUrl) {
        return { error: 'Name and Base URL are required' }
    }

    // Insert Chatbot
    const { data: chatbot, error } = await supabase
        .from('chatbots')
        .insert({
            user_id: user.id,
            name,
            base_url: baseUrl
        })
        .select()
        .single()

    if (error) {
        console.error('Create Chatbot Error:', error)
        return { error: error.message }
    }

    // Trigger Ingestion for Base URL
    // We treat the base URL as the first training source
    try {
        await addTrainingSource(chatbot.id, 'website', baseUrl)
    } catch (e) {
        console.error('Initial Ingestion Trigger Failed:', e)
        // We don't fail the creation, just the ingestion
    }

    revalidatePath('/dashboard')
    redirect(`/dashboard/chatbot/${chatbot.id}`)
}

export async function addTrainingSource(chatbotId: string, type: 'website' | 'text' | 'file' | 'csv', content: string): Promise<ActionState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify ownership
    const { data: chatbot } = await supabase.from('chatbots').select('id').eq('id', chatbotId).eq('user_id', user.id).single()
    if (!chatbot) return { error: 'Chatbot not found or unauthorized' }

    // Insert Training Source
    const { data: source, error } = await supabase
        .from('training_sources')
        .insert({
            chatbot_id: chatbotId,
            source_type: type,
            source_name: content.slice(0, 200), // simplistic name
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // Trigger Async Ingestion
    // In Vercel, this should ideally be a background job.
    // For "Clone", we will await it or fire-and-forget (which Vercel might kill).
    // We'll await it for MVP reliability.
    await ingestSource(source.id, type, content)

    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
    return { success: true }
}

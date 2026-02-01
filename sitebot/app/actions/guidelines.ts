'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Guideline = {
    id: string
    chatbot_id: string
    title: string
    content: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export async function getGuidelines(chatbotId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('guidelines')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Guideline[]
}

export async function createGuideline(chatbotId: string, data: { title: string; content: string }) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('guidelines').insert({
        chatbot_id: chatbotId,
        title: data.title,
        content: data.content,
    })

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
}

export async function updateGuideline(id: string, chatbotId: string, data: Partial<Guideline>) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('guidelines')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
}

export async function deleteGuideline(id: string, chatbotId: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('guidelines').delete().eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
}

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Workflow = {
    id: string
    chatbot_id: string
    title: string
    trigger_condition: string
    training_phrases: string[]
    instructions: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export async function getWorkflows(chatbotId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Workflow[]
}

export async function createWorkflow(chatbotId: string, data: {
    title: string
    trigger_condition: string
    training_phrases: string[]
    instructions: string
}) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('workflows').insert({
        chatbot_id: chatbotId,
        title: data.title,
        trigger_condition: data.trigger_condition,
        training_phrases: data.training_phrases,
        instructions: data.instructions,
    })

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
}

export async function updateWorkflow(id: string, chatbotId: string, data: Partial<Workflow>) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('workflows')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
}

export async function deleteWorkflow(id: string, chatbotId: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('workflows').delete().eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/chatbot/${chatbotId}/training`)
}

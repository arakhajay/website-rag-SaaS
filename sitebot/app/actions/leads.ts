'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Lead {
    id: string
    name?: string
    email: string
    phone?: string
    message?: string
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    remark?: string
    source: string
    created_at: string
    chatbot_id: string
    custom_data?: any
}

export async function getLeads(chatbotId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching leads:', error)
        return []
    }
    return data as Lead[]
}

export async function updateLeadStatus(leadId: string, status: string) {
    return updateLead(leadId, { status: status as Lead['status'] })
}

export async function updateLead(leadId: string, updates: Partial<Lead>) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', leadId)

        if (error) throw error

        revalidatePath('/dashboard/chatbot/[id]/leads')
        return { success: true }
    } catch (error) {
        console.error('Error updating lead:', error)
        return { success: false, error: 'Failed to update lead' }
    }
}

export async function deleteLead(leadId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', leadId)

        if (error) throw error

        revalidatePath('/dashboard/chatbot/[id]/leads')
        return { success: true }
    } catch (error) {
        console.error('Error deleting lead:', error)
        return { success: false, error: 'Failed to delete lead' }
    }
}

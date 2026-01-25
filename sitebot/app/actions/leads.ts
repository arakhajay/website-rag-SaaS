'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface Lead {
    id: string
    chatbot_id: string
    email: string
    phone: string | null
    message: string | null
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    remark: string | null
    source: string
    last_contact_at: string | null
    created_at: string
    updated_at: string
}

// Get leads for a chatbot
export async function getLeads(chatbotId: string): Promise<Lead[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[Leads] Fetch error:', error)
        return []
    }

    return data as Lead[]
}

// Update lead status/remark
export async function updateLead(
    leadId: string,
    updates: {
        status?: Lead['status']
        remark?: string
        last_contact_at?: string
    }
) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('leads')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)

    if (error) {
        console.error('[Leads] Update error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Delete a lead
export async function deleteLead(leadId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

    if (error) {
        console.error('[Leads] Delete error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

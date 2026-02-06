'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/verify-admin'
import { logAdminAction } from './admin-analytics'
import { revalidatePath } from 'next/cache'

// ============================================
// ANNOUNCEMENTS
// ============================================

export interface Announcement {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'maintenance'
    link_url: string | null
    link_text: string | null
    is_active: boolean
    is_dismissible: boolean
    target_plans: string[]
    starts_at: string
    ends_at: string | null
    created_at: string
}

export async function getAnnouncements(): Promise<Announcement[]> {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching announcements:', error)
        return []
    }

    return data as Announcement[]
}

export async function createAnnouncement(data: {
    title: string
    message: string
    type?: 'info' | 'warning' | 'success' | 'maintenance'
    link_url?: string
    link_text?: string
    is_dismissible?: boolean
    target_plans?: string[]
    starts_at?: string
    ends_at?: string
}) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { data: { user } } = await (await import('@/lib/supabase/server')).createClient().then(c => c.auth.getUser())

    const { data: announcement, error } = await supabase
        .from('announcements')
        .insert({
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            link_url: data.link_url || null,
            link_text: data.link_text || null,
            is_dismissible: data.is_dismissible ?? true,
            target_plans: data.target_plans || [],
            starts_at: data.starts_at || new Date().toISOString(),
            ends_at: data.ends_at || null,
            created_by: user?.id
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('create_announcement', 'announcement', announcement.id, undefined, { title: data.title })
    revalidatePath('/admin')

    return { success: true, announcement }
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('announcements')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('update_announcement', 'announcement', id, undefined, data)
    revalidatePath('/admin')

    return { success: true }
}

export async function deleteAnnouncement(id: string) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('delete_announcement', 'announcement', id)
    revalidatePath('/admin')

    return { success: true }
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('announcements')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('update_announcement', 'announcement', id, undefined, { is_active: isActive })
    revalidatePath('/admin')

    return { success: true }
}

// ============================================
// FEATURE FLAGS
// ============================================

export interface FeatureFlag {
    id: string
    name: string
    description: string | null
    is_enabled: boolean
    enabled_plans: string[]
    enabled_users: string[]
    percentage: number
    created_at: string
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching feature flags:', error)
        return []
    }

    return data as FeatureFlag[]
}

export async function createFeatureFlag(data: {
    name: string
    description?: string
    is_enabled?: boolean
    enabled_plans?: string[]
    percentage?: number
}) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { data: { user } } = await (await import('@/lib/supabase/server')).createClient().then(c => c.auth.getUser())

    const { data: flag, error } = await supabase
        .from('feature_flags')
        .insert({
            name: data.name,
            description: data.description || null,
            is_enabled: data.is_enabled ?? false,
            enabled_plans: data.enabled_plans || [],
            percentage: data.percentage ?? 100,
            created_by: user?.id
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('toggle_feature_flag', 'feature_flag', flag.id, undefined, { name: data.name, action: 'create' })
    revalidatePath('/admin')

    return { success: true, flag }
}

export async function toggleFeatureFlag(id: string, isEnabled: boolean) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { data: flag } = await supabase
        .from('feature_flags')
        .select('name')
        .eq('id', id)
        .single()

    const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('toggle_feature_flag', 'feature_flag', id, undefined, {
        name: flag?.name,
        is_enabled: isEnabled
    })
    revalidatePath('/admin')

    return { success: true }
}

export async function updateFeatureFlag(id: string, data: Partial<FeatureFlag>) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('feature_flags')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('toggle_feature_flag', 'feature_flag', id, undefined, data)
    revalidatePath('/admin')

    return { success: true }
}

export async function deleteFeatureFlag(id: string) {
    await verifyAdmin()
    const supabase = createAdminClient()

    const { data: flag } = await supabase
        .from('feature_flags')
        .select('name')
        .eq('id', id)
        .single()

    const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    await logAdminAction('toggle_feature_flag', 'feature_flag', id, undefined, {
        name: flag?.name,
        action: 'delete'
    })
    revalidatePath('/admin')

    return { success: true }
}

import { createClient } from '@/lib/supabase/server'

/**
 * Verifies that the current user is a super_admin.
 * Throws an error if not authenticated or not an admin.
 * Use this at the start of all admin server actions for double-layer security.
 */
export async function verifyAdminOrThrow(): Promise<{ userId: string; email: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized: Not authenticated')
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        throw new Error('Unauthorized: Profile not found')
    }

    if (profile.role !== 'super_admin') {
        throw new Error('Forbidden: Admin access required')
    }

    return { userId: user.id, email: profile.email || user.email || '' }
}

/**
 * Checks if the current user is a super_admin without throwing.
 * Returns false if not authenticated or not an admin.
 */
export async function isAdmin(): Promise<boolean> {
    try {
        await verifyAdminOrThrow()
        return true
    } catch {
        return false
    }
}

'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Look up a user's email by their username.
 * Uses the service-role client to bypass RLS.
 */
export async function lookupEmailByUsername(username: string): Promise<{ email: string | null; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .ilike('username', username)
            .single()

        if (error || !data?.email) {
            return { email: null, error: 'No account found with that username' }
        }

        return { email: data.email }
    } catch {
        return { email: null, error: 'Failed to look up username' }
    }
}

/**
 * Save username to the user's profile after sign-up.
 * Uses the service-role client to bypass RLS.
 * Includes retry logic to handle race condition with DB trigger.
 */
export async function saveUsernameToProfile(userId: string, username: string, email: string): Promise<{ error?: string }> {
    try {
        const supabase = createAdminClient()

        // Check if username is already taken by another user
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', username)
            .maybeSingle()

        if (existing && existing.id !== userId) {
            return { error: 'Username is already taken' }
        }

        // Retry updating with delay — handles race condition with DB trigger
        for (let attempt = 0; attempt < 3; attempt++) {
            // Try to update existing profile
            const { data: updated, error: updateError } = await supabase
                .from('profiles')
                .update({ username, email })
                .eq('id', userId)
                .select('id')
                .maybeSingle()

            if (updated) {
                return {} // Success
            }

            if (updateError) {
                console.error(`Profile update attempt ${attempt + 1} error:`, updateError)
            }

            // Try to insert if profile doesn't exist yet
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ id: userId, email, username })

            if (!insertError) {
                return {} // Success
            }

            // If insert failed (likely duplicate key from trigger), wait and retry update
            console.log(`Profile save attempt ${attempt + 1} failed, retrying in 1s...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return { error: 'Failed to save username after retries' }
    } catch {
        return { error: 'Failed to save username' }
    }
}

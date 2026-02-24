'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import type { Integration, IntegrationPlatform } from '@/lib/integrations'

function generateApiKey(): string {
    return `zivox_${crypto.randomBytes(32).toString('hex')}`
}

// Get all integrations for a chatbot
export async function getIntegrations(chatbotId: string): Promise<{ integrations: Integration[], error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { integrations: [], error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (error) return { integrations: [], error: error.message }
    return { integrations: data as Integration[], error: null }
}

// Get all integrations for current user (across all chatbots)
export async function getAllUserIntegrations(): Promise<{ integrations: Integration[], error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { integrations: [], error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (error) return { integrations: [], error: error.message }
    return { integrations: data as Integration[], error: null }
}

// Create or update an integration
export async function upsertIntegration(
    chatbotId: string,
    platform: IntegrationPlatform,
    config: Record<string, any>,
    enabled: boolean = true,
): Promise<{ integration: Integration | null, error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { integration: null, error: 'Not authenticated' }

    // Verify chatbot ownership
    const { data: chatbot } = await supabase
        .from('chatbots')
        .select('id')
        .eq('id', chatbotId)
        .eq('user_id', user.id)
        .single()

    if (!chatbot) return { integration: null, error: 'Chatbot not found' }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const webhookUrl = `${appUrl}/api/integrations/${platform}?chatbot_id=${chatbotId}`

    // Check if integration already exists
    const { data: existing } = await supabase
        .from('integrations')
        .select('id, api_key')
        .eq('chatbot_id', chatbotId)
        .eq('platform', platform)
        .single()

    const integrationData = {
        chatbot_id: chatbotId,
        user_id: user.id,
        platform,
        enabled,
        config,
        webhook_url: webhookUrl,
        api_key: existing?.api_key || generateApiKey(),
        status: enabled ? 'connected' as const : 'disconnected' as const,
    }

    let result
    if (existing) {
        result = await supabase
            .from('integrations')
            .update(integrationData)
            .eq('id', existing.id)
            .select()
            .single()
    } else {
        result = await supabase
            .from('integrations')
            .insert(integrationData)
            .select()
            .single()
    }

    if (result.error) return { integration: null, error: result.error.message }
    return { integration: result.data as Integration, error: null }
}

// Toggle an integration on/off
export async function toggleIntegration(
    integrationId: string,
    enabled: boolean
): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('integrations')
        .update({
            enabled,
            status: enabled ? 'connected' : 'disconnected',
        })
        .eq('id', integrationId)
        .eq('user_id', user.id)

    return { error: error?.message || null }
}

// Delete an integration
export async function deleteIntegration(
    integrationId: string
): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId)
        .eq('user_id', user.id)

    return { error: error?.message || null }
}

// Regenerate API key for a Zapier/API integration
export async function regenerateApiKey(
    integrationId: string
): Promise<{ apiKey: string | null, error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { apiKey: null, error: 'Not authenticated' }

    const newKey = generateApiKey()

    const { error } = await supabase
        .from('integrations')
        .update({ api_key: newKey })
        .eq('id', integrationId)
        .eq('user_id', user.id)

    if (error) return { apiKey: null, error: error.message }
    return { apiKey: newKey, error: null }
}

// Lookup integration by platform webhook (used by webhook routes)
export async function getIntegrationByWebhook(
    platform: IntegrationPlatform,
    chatbotId: string
): Promise<{ integration: Integration | null, error: string | null }> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('integrations')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .eq('platform', platform)
        .eq('enabled', true)
        .single()

    if (error) return { integration: null, error: error.message }
    return { integration: data as Integration, error: null }
}

// Validate API key (for Zapier and API-based integrations)
export async function validateApiKey(
    apiKey: string,
    platform: IntegrationPlatform
): Promise<{ integration: Integration | null, error: string | null }> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('integrations')
        .select('*')
        .eq('api_key', apiKey)
        .eq('platform', platform)
        .eq('enabled', true)
        .single()

    if (error) return { integration: null, error: 'Invalid API key' }
    return { integration: data as Integration, error: null }
}

// Increment message count (called by webhook handlers)
export async function incrementIntegrationMessageCount(
    integrationId: string
): Promise<void> {
    const admin = createAdminClient()

    try {
        await admin.rpc('increment_integration_messages', { integration_id: integrationId })
    } catch {
        // Fallback: manual update if RPC doesn't exist
        await admin
            .from('integrations')
            .update({
                last_message_at: new Date().toISOString(),
            })
            .eq('id', integrationId)
    }
}

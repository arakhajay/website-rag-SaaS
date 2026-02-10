'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSubscriptionWithPlan } from '@/app/actions/subscription'


export async function createChatbot(name: string, baseUrl: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Authentication and active subscription required.' }
    }

    // User is authenticated - use normal client
    
    // 1. Check Subscription Limits
    const { plan } = await getSubscriptionWithPlan()
    const currentPlan = plan // If null, means something is wrong or Free plan handling needs fallback. 
                             // getSubscriptionWithPlan handles "No Plan" by returning null plan? 
                             // Wait, I updated dodo.ts to include 'free'. 
                             // If subscription is null (no record), getSubscriptionWithPlan returns plan: null?
                             // Let's assume safely.

    if (!currentPlan) {
         // Should not happen if 'free' is default. But if no record, effectively free.
         // If no record, we should probably block or allow default?
         // User said "unless user buy".
         // If "No Plan", limit is 0.
         return { success: false, error: 'You must have an active subscription to create a chatbot.' }
    }

    // Check count
    const { count, error: countError } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (countError) {
        return { success: false, error: 'Failed to check usage limits.' }
    }

    if ((count || 0) >= currentPlan.maxChatbots) {
        return { 
            success: false, 
            error: `Plan limit reached. Your ${currentPlan.name} allows ${currentPlan.maxChatbots} chatbot(s). Please upgrade.` 
        }
    }

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

    // Trigger initial ingestion
    try {
        // We use 'await' here for simplicity in this clone, but in production 
        // this should be a background job (e.g. Inngest, Trigger.dev)
        const { ingestWebsite } = await import('./ingest')
        await ingestWebsite(newBot.id, baseUrl)
    } catch (ingestError) {
        console.error('Ingestion trigger failed:', ingestError)
        // We don't fail the creation, just log the error
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
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated', chatbots: [] }
    }

    // Use authenticated client - RLS will filter to user's chatbots only
    const { data: chatbots, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message, chatbots: [] }
    }

    return { success: true, chatbots: chatbots || [] }
}

export async function getChatbot(chatbotId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated', chatbot: null }
    }

    // Use authenticated client - RLS will ensure user owns this chatbot
    const { data: chatbot, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', chatbotId)
        .eq('user_id', user.id)
        .single()

    if (error) {
        return { success: false, error: error.message, chatbot: null }
    }

    return { success: true, chatbot }
}

export async function getTrainingSources(chatbotId: string) {
    const adminClient = createAdminClient()

    const { data: sources, error } = await adminClient
        .from('training_sources')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message, sources: [] }
    }

    return { success: true, sources: sources || [] }
}

export async function deleteTrainingSource(sourceId: string) {
    const adminClient = createAdminClient()

    // 1. Get source details to delete vectors (Phase 2 requirement)
    // For now, we just delete the DB record. 
    // TODO: Implement Pinecone vector deletion by metadata filter.

    const { error } = await adminClient
        .from('training_sources')
        .delete()
        .eq('id', sourceId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Update signature to allow FormData or string content
export async function addTrainingSource(chatbotId: string, type: 'website' | 'text' | 'file' | 'csv', content: string | FormData) {
    const adminClient = createAdminClient()
    const supabase = await createClient() // For auth check

    // 0. Verify Auth & Plan Limits
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { plan } = await getSubscriptionWithPlan()
    if (!plan) return { success: false, error: "Active subscription required." }

    // Check ownership of chatbot (since we use adminClient for insert)
    const { data: botCheck } = await supabase
        .from('chatbots')
        .select('id')
        .eq('id', chatbotId)
        .eq('user_id', user.id)
        .single()
    
    if (!botCheck) return { success: false, error: "Chatbot not found or access denied." }

    // Check Sources Count Limit
    const { count } = await adminClient
        .from('training_sources')
        .select('*', { count: 'exact', head: true })
        .eq('chatbot_id', chatbotId)
    
    if ((count || 0) >= plan.maxTrainingSources) {
         return { success: false, error: `Training source limit reached (${plan.maxTrainingSources}). Upgrade to add more.` }
    }

    let sourceName = ''
    let fileBuffer: Buffer | null = null
    let fileType = '' // 'pdf' or 'csv' etc

    // 1. Prepare Content & Check Size Limit
    let contentSizeMB = 0
    if (content instanceof FormData) {
        const file = content.get('file') as File
        if (!file) return { success: false, error: "No file provided" }
        sourceName = file.name
        const arrayBuffer = await file.arrayBuffer()
        fileBuffer = Buffer.from(arrayBuffer)
        fileType = file.name.split('.').pop()?.toLowerCase() || ''
        contentSizeMB = file.size / (1024 * 1024)
    } else {
        sourceName = String(content).slice(0, 50) + (String(content).length > 50 ? '...' : '')
        contentSizeMB = Buffer.byteLength(String(content)) / (1024 * 1024)
    }

    if (contentSizeMB > plan.maxTrainingSizeMB) {
        return { success: false, error: `File too large. Limit is ${plan.maxTrainingSizeMB}MB.` }
    }

    // 2. Create Initial DB Record
    const { data: source, error } = await adminClient
        .from('training_sources')
        .insert({
            chatbot_id: chatbotId,
            source_type: type,
            source_name: sourceName,
            chunks_count: 0 // Indicates "Indexing..." in UI
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    // 3. Trigger Ingestion
    try {
        const { ingestWebsite, ingestText, ingestFile, ingestCSV } = await import('./ingest')
        let result: { success: boolean; error?: string; [key: string]: any } = { success: false, error: 'Unknown type' }

        if (type === 'website') {
            result = await ingestWebsite(chatbotId, String(content), source.id)
        } else if (type === 'text') {
            result = await ingestText(chatbotId, String(content), source.id != null ? sourceName : 'direct-text', source.id)
        } else if (type === 'file' && fileBuffer) {
            result = await ingestFile(chatbotId, sourceName, fileBuffer, source.id)
        } else if (type === 'csv' && fileBuffer) {
            const text = fileBuffer.toString('utf-8')
            result = await ingestCSV(chatbotId, sourceName, text, source.id)
        }

        if (!result.success) {
            // Error handling is done inside ingest functions (they record update/delete)
            // But we can throw here to return false to UI
            throw new Error(result.error as string)
        }

        return { success: true, source }

    } catch (e: any) {
        console.error('Ingest trigger failed:', e)
        // Cleanup if ingest function didn't already
        // But since we passed source.id, ingest function SHOULD have cleaned up.
        // We double check or just return failure.
        return { success: false, error: e.message }
    }
}

export async function updateChatbot(chatbotId: string, data: { name?: string, base_url?: string }) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('chatbots')
        .update(data)
        .eq('id', chatbotId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

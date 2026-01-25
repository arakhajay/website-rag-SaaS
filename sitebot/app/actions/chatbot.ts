'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createChatbot(name: string, baseUrl: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
        // Try using admin client to create for demo purposes
        // In production, you'd want to enforce login
        const adminClient = createAdminClient()

        // Get or create a demo user
        const { data: existingUsers } = await adminClient
            .from('profiles')
            .select('id')
            .limit(1)

        if (existingUsers && existingUsers.length > 0) {
            const userId = existingUsers[0].id

            const { data: newBot, error } = await adminClient
                .from('chatbots')
                .insert({
                    name,
                    base_url: baseUrl,
                    user_id: userId
                })
                .select()
                .single()

            if (error) {
                console.error('Admin insert error:', error)
                return { success: false, error: error.message }
            }

            return { success: true, chatbot: newBot }
        }

        return { success: false, error: 'No users found. Please sign up first.' }
    }

    // User is authenticated - use normal client
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
    const adminClient = createAdminClient()

    const { data: chatbots, error } = await adminClient
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message, chatbots: [] }
    }

    return { success: true, chatbots: chatbots || [] }
}

export async function getChatbot(chatbotId: string) {
    const adminClient = createAdminClient()

    const { data: chatbot, error } = await adminClient
        .from('chatbots')
        .select('*')
        .eq('id', chatbotId)
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

    let sourceName = ''
    let fileBuffer: Buffer | null = null
    let fileType = '' // 'pdf' or 'csv' etc

    // 1. Prepare Content
    if (content instanceof FormData) {
        const file = content.get('file') as File
        if (!file) return { success: false, error: "No file provided" }
        sourceName = file.name
        const arrayBuffer = await file.arrayBuffer()
        fileBuffer = Buffer.from(arrayBuffer)
        fileType = file.name.split('.').pop()?.toLowerCase() || ''
    } else {
        sourceName = String(content).slice(0, 50) + (String(content).length > 50 ? '...' : '')
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
        let result = { success: false, error: 'Unknown type' }

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

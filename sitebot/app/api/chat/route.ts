import { streamText } from 'ai'
import { generateAndRunSQL } from '@/lib/sql-agent'
import { logInfo, logError } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/dodo'
import { getChatModel, getEmbeddingsModel } from '@/lib/ai-models'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// CORS headers for widget cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders })
}

// Helper: Get or create chat session (inline, not server action)
async function getOrCreateChatSessionDirect(
    chatbotId: string,
    sessionId: string,
    source: string = 'widget'
) {
    try {
        const supabase = createAdminClient()

        // Check if session exists
        const { data: existingSession } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('chatbot_id', chatbotId)
            .eq('session_id', sessionId)
            .single()

        if (existingSession) {
            await supabase
                .from('chat_sessions')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', existingSession.id)
            return existingSession.id
        }

        // Create new session
        const { data: newSession, error } = await supabase
            .from('chat_sessions')
            .insert({
                chatbot_id: chatbotId,
                session_id: sessionId,
                source,
            })
            .select('id')
            .single()

        if (error) {
            console.error('[ChatLogs] Error creating session:', error)
            return null
        }

        return newSession.id
    } catch (e) {
        console.error('[ChatLogs] Session error:', e)
        return null
    }
}

// Helper: Log chat message (inline)
async function logChatMessageDirect(
    dbSessionId: string,
    role: 'user' | 'assistant',
    content: string
) {
    try {
        const supabase = createAdminClient()
        await supabase
            .from('chat_messages')
            .insert({
                session_id: dbSessionId,
                role,
                content,
            })
    } catch (e) {
        console.error('[ChatLogs] Message log error:', e)
    }
}

export async function POST(req: Request) {
    try {
        console.log('[ChatRoute] Received Request')
        const body = await req.json()
        const { messages, chatbotId, sessionId = `session_${Date.now()}`, source = 'widget' } = body
        console.log(`[ChatRoute] ChatbotId: ${chatbotId}, UserQuery: ${messages?.[messages.length - 1]?.content}`)

        if (!chatbotId) {
            console.error('[ChatRoute] Missing Chatbot ID')
            return new Response('Chatbot ID required', { status: 400, headers: corsHeaders })
        }

        const lastMessage = messages[messages.length - 1]
        const userQuery = lastMessage.content

        // --- Subscription Usage Check ---
        const adminClient = createAdminClient()
        
        // 1. Get Chatbot Owner
        const { data: chatbotData, error: botError } = await adminClient
            .from('chatbots')
            .select('user_id')
            .eq('id', chatbotId)
            .single()

        if (botError || !chatbotData) {
            return new Response('Chatbot not found', { status: 404 })
        }

        // 2. Get Subscription
        const { data: subscription } = await adminClient
            .from('subscriptions')
            .select('id, plan_name, usage_messages, status')
            .eq('user_id', chatbotData.user_id)
            .in('status', ['active', 'on_hold', 'pending']) // Pending counts as active for usage
            .maybeSingle()
        
        // 3. Determine Limits
        const planSlug = subscription?.plan_name || 'free'
        const planConfig = PLANS[planSlug] || PLANS.free
        const usage = subscription?.usage_messages || 0

        // 4. Enforce Limit
        // If status is 'pending' (just bought), we allow usage.
        // If status is undefined (no record), uses free plan (0 messages).
        if (usage >= planConfig.messagesPerMonth) {
            console.warn(`[ChatRoute] Usage limit reached for bot ${chatbotId} (Plan: ${planSlug}, Usage: ${usage}/${planConfig.messagesPerMonth})`)
            return new Response(
                JSON.stringify({ error: `Message limit reached. Your ${planConfig.name} allows ${planConfig.messagesPerMonth} messages/month. Please upgrade.` }), 
                { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 5. Increment Usage (Async - don't block response)
        // We do this BEFORE the AI response to count the user query?
        // Or AFTER to count successful generation?
        // Usually counted on request received.
        if (subscription) {
            // Fire and forget increment - Use .then() to trigger execution without awaiting
            adminClient.rpc('increment_usage_messages', { row_id: subscription.id })
                .then(({ error }) => {
                    if (error) console.error('[ChatRoute] Failed to increment usage:', error)
                })
        }

        // --- Fetch Chatbot Settings for Model Preferences ---
        const { data: botSettings } = await adminClient
            .from('chatbot_settings')
            .select('messaging')
            .eq('chatbot_id', chatbotId)
            .maybeSingle()

        const selectedChatModel = (botSettings?.messaging as any)?.model || 'gemini-2.0-flash'
        console.log(`[ChatRoute] Using chat model: ${selectedChatModel}`)

        // --- Parallel Execution: Vector Search + SQL Search ---

        // 1. Vector Search (Supabase pgvector)
        const vectorPromise = (async () => {
            try {
                console.log('[Chat] Starting Vector Search:', userQuery)
                const embeddings = getEmbeddingsModel('text-embedding-3-small')
                const vector = await embeddings.embedQuery(userQuery)

                const { data: results, error } = await adminClient.rpc('match_documents', {
                    query_embedding: JSON.stringify(vector),
                    match_chatbot_id: chatbotId,
                    match_count: 5,
                    match_threshold: 0.2
                })

                if (error) {
                    console.error('[Chat] Vector search RPC error:', error)
                    return ''
                }

                console.log('[Chat] Vector results found:', results?.length || 0)
                return results?.map((r: any) => r.content).join('\n\n') || ''
            } catch (e) {
                console.error('[Chat] Vector search error:', e)
                return ''
            }
        })()

        // 2. SQL Agent Search
        const sqlPromise = (async () => {
            try {
                console.log('[Chat] Starting SQL Search:', userQuery)
                const sqlResult = await generateAndRunSQL(chatbotId, userQuery)
                console.log('[Chat] SQL result:', sqlResult ? 'found' : 'none')
                return sqlResult || ''
            } catch (e) {
                console.error('[Chat] SQL search error:', e)
                return ''
            }
        })()

        // 3. Chat logging (don't await - fire and forget)
        const loggingPromise = (async () => {
            try {
                const dbSessionId = await getOrCreateChatSessionDirect(chatbotId, sessionId, source)
                if (dbSessionId) {
                    await logChatMessageDirect(dbSessionId, 'user', userQuery)
                }
                return dbSessionId
            } catch (e) {
                console.error('[Chat] Logging error:', e)
                return null
            }
        })()

        // 4. Fetch Guidelines & Workflows (Parallel)
        const rulesPromise = (async () => {
            try {
                const supabase = createAdminClient()
                const { data: guidelines } = await supabase
                    .from('guidelines')
                    .select('title, content')
                    .eq('chatbot_id', chatbotId)
                    .eq('is_active', true)

                const { data: workflows } = await supabase
                    .from('workflows')
                    .select('title, trigger_condition, instructions, training_phrases')
                    .eq('chatbot_id', chatbotId)
                    .eq('is_active', true)

                return {
                    guidelines: guidelines || [],
                    workflows: workflows || []
                }
            } catch (e) {
                console.error('[Chat] Rules fetch error:', e)
                return { guidelines: [], workflows: [] }
            }
        })()

        // Wait for search results
        const [vectorContext, sqlContext, rules] = await Promise.all([vectorPromise, sqlPromise, rulesPromise])

        // Combine context
        let combinedContext = ''
        if (vectorContext) {
            combinedContext += `**From Documents:**\n${vectorContext}\n\n`
        }
        if (sqlContext) {
            combinedContext += `**From Structured Data:**\n${sqlContext}`
        }

        if (!combinedContext) {
            combinedContext = 'No relevant information found in the knowledge base.'
        }

        // Build System Prompt
        let guidelinesText = ''
        if (rules.guidelines.length > 0) {
            guidelinesText = '\n**BEHAVIORAL GUIDELINES:**\n' + rules.guidelines.map(g => `- ${g.title}: ${g.content}`).join('\n')
        }

        let workflowsText = ''
        if (rules.workflows.length > 0) {
            workflowsText = '\n**SPECIALIZED WORKFLOWS:**\nCheck if the user input matches any of these triggers. If so, follow the instructions PRECISELY.\n' +
                rules.workflows.map((w, i) => {
                    const phrases = w.training_phrases && w.training_phrases.length > 0 ? `\n   Examples: ${w.training_phrases.join(', ')}` : ''
                    return `${i + 1}. [${w.title}]\n   Trigger: "${w.trigger_condition}"${phrases}\n   Instructions: ${w.instructions}`
                }).join('\n\n')
        }

        const systemPrompt = `You are a helpful AI assistant. Answer questions based on the following context and adhere strictly to the guidelines and workflows.

**CONTEXT:**
${combinedContext}
${guidelinesText}
${workflowsText}

**RESPONSE GUIDELINES:**
- Answer based on the provided context only
- If data comes from SQL/structured sources, present it in a clean table format
- If listing items, use bullet points
- If you don't have enough information, say so politely and offer to help differently
- Be conversational but professional`

        logInfo('ChatRoute', `Generating response for: ${userQuery}`)

        // Get session ID for logging
        const dbSessionId = await loggingPromise

        const result = await streamText({
            model: getChatModel(selectedChatModel),
            system: systemPrompt,
            messages,
            onFinish: async ({ text }) => {
                // Log AI response after streaming completes
                if (dbSessionId && text) {
                    await logChatMessageDirect(dbSessionId, 'assistant', text)
                }
            }
        })
        const response = result.toTextStreamResponse()
        // Add CORS headers to streaming response
        const corsResponse = new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                ...corsHeaders,
            },
        })
        return corsResponse

    } catch (e: any) {
        console.error('[ChatRoute] Critical Error:', e)
        logError('ChatRoute-Critical', e)
        return new Response(`AI Error: ${e.message}`, { status: 500, headers: corsHeaders })
    }
}

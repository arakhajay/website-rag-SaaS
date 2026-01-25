import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { generateAndRunSQL } from '@/lib/sql-agent'
import { logInfo, logError } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

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

        // --- Parallel Execution: Vector Search + SQL Search ---

        // 1. Vector Search
        const vectorPromise = (async () => {
            try {
                console.log('[Chat] Starting Vector Search:', userQuery)
                const embeddings = new OpenAIEmbeddings({
                    model: 'text-embedding-3-small',
                })
                const vector = await embeddings.embedQuery(userQuery)
                const pinecone = new Pinecone()
                const index = pinecone.index(process.env.PINECONE_INDEX!)

                const results = await index.query({
                    vector,
                    topK: 3,
                    includeMetadata: true,
                    filter: { chatbotId },
                })
                console.log('[Chat] Vector results found:', results.matches?.length || 0)
                // Fix: ingest.ts stores in 'content', verify fallback to 'text'
                return results.matches?.map(match => match.metadata?.content || match.metadata?.text || '').join('\n\n') || ''
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

        // Wait for search results
        const [vectorContext, sqlContext] = await Promise.all([vectorPromise, sqlPromise])

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

        const systemPrompt = `You are a helpful AI assistant. Answer questions based ONLY on the following context.

**CONTEXT:**
${combinedContext}

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
            model: openai('gpt-4o'),
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

import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { generateAndRunSQL } from '@/lib/sql-agent'
import { logInfo, logError } from '@/lib/logger'
import { getOrCreateChatSession, logChatMessage } from '@/app/actions/chat-logs'

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

export async function POST(req: Request) {
    try {
        console.log('[ChatRoute] Received Request')
        const body = await req.json()
        const { messages, chatbotId, sessionId = `session_${Date.now()}`, source = 'widget' } = body
        console.log(`[ChatRoute] ChatbotId: ${chatbotId}, UserQuery: ${messages?.[messages.length - 1]?.content}`)

        if (!chatbotId) {
            console.error('[ChatRoute] Missing Chatbot ID')
            return new Response('Chatbot ID required', { status: 400 })
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

                const queryResponse = await index.query({
                    vector,
                    topK: 4,
                    filter: { chatbotId },
                    includeMetadata: true,
                })
                console.log('[Chat] Vector Matches:', queryResponse.matches.length)

                return queryResponse.matches
                    .map((match) => match.metadata?.content)
                    .join('\n\n')
            } catch (e: any) {
                console.error('[Chat] Vector Search Error:', e.message)
                logError('ChatRoute-Vector', e)
                return '' // Fail gracefully
            }
        })()

        // 2. SQL Search (Hybrid)
        const sqlPromise = (async () => {
            try {
                console.log('[Chat] Starting SQL Search')
                return await generateAndRunSQL(chatbotId, userQuery)
            } catch (e: any) {
                console.error('[Chat] SQL Search Error:', e.message)
                // logError('ChatRoute-SQL', e) // Less critical if just "function missing"
                return null // Fail gracefully
            }
        })()

        const [vectorContext, sqlResult] = await Promise.all([vectorPromise, sqlPromise])

        // 3. Construct Final Context
        let combinedContext = `VECTOR CONTEXT (Unstructured):\n${vectorContext}`

        if (sqlResult) {
            combinedContext += `\n\nSQL CONTEXT (Structured Data Results):\n${sqlResult}`
        }

        // 4. Generate Response
        const systemPrompt = `You are a helpful AI assistant for a website. You have access to knowledge from multiple sources.

**FORMATTING RULES (IMPORTANT):**
- Use **bold** for emphasis and key terms
- Use bullet points or numbered lists for multiple items
- Use tables when presenting structured data with multiple fields
- Use clear headings (## or ###) to organize longer responses
- Keep responses concise and well-organized
- Use line breaks between sections for readability

**CONTEXT:**
${combinedContext}

**RESPONSE GUIDELINES:**
- Answer based on the provided context only
- If data comes from SQL/structured sources, present it in a clean table format
- If listing items, use bullet points
- If you don't have enough information, say so politely and offer to help differently
- Be conversational but professional`

        logInfo('ChatRoute', `Generating response for: ${userQuery}`)

        // Log conversation (async, don't block response)
        const dbSessionId = await getOrCreateChatSession(chatbotId, sessionId, source)
        if (dbSessionId) {
            await logChatMessage(dbSessionId, 'user', userQuery)
        }

        const result = await streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            messages,
            onFinish: async ({ text }) => {
                // Log AI response after streaming completes
                if (dbSessionId && text) {
                    await logChatMessage(dbSessionId, 'assistant', text)
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

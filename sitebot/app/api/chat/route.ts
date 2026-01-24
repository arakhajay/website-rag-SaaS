import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
        return new Response('Chatbot ID required', { status: 400 })
    }

    // 1. Embed the last user message
    const lastMessage = messages[messages.length - 1]
    const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
    })
    const vector = await embeddings.embedQuery(lastMessage.content)

    // 2. Query Pinecone for context
    const pinecone = new Pinecone()
    const index = pinecone.index(process.env.PINECONE_INDEX!)

    const queryResponse = await index.query({
        vector,
        topK: 4,
        filter: { chatbotId }, // CRITICAL: Ensure we only get chunks for THIS bot
        includeMetadata: true,
    })

    // 3. Construct Context String
    const context = queryResponse.matches
        .map((match) => match.metadata?.content)
        .join('\n\n')

    // 4. Generate Response with Context
    const systemPrompt = `
    You are a helpful AI assistant for a website.
    Use the following context to answer the user's question.
    If the answer is not in the context, say you don't know and offer to connect them to support.
    
    CONTEXT:
    ${context}
  `

    const result = await streamText({
        model: openai('gpt-4o'),
        system: systemPrompt,
        messages, // Pass directly
    })

    return result.toTextStreamResponse()
}

import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function debugRetrieval() {
    const chatbotId = process.argv[2]
    const query = process.argv[3] || 'Tell me about yourself'

    if (!chatbotId) {
        console.error('Please provide a chatbot ID as the first argument.')
        process.exit(1)
    }

    console.log(`Debugging retrieval for Chatbot: ${chatbotId}`)
    console.log(`Query: "${query}"`)

    try {
        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small',
            openAIApiKey: process.env.OPENAI_API_KEY
        })

        console.log('Generating embedding...')
        const vector = await embeddings.embedQuery(query)

        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!
        })
        const index = pinecone.index(process.env.PINECONE_INDEX!)

        console.log('Querying Pinecone...')
        const results = await index.query({
            vector,
            topK: 5,
            includeMetadata: true,
            filter: { chatbotId }
        })

        console.log(`\nFound ${results.matches.length} matches:`)
        results.matches.forEach((match, i) => {
            console.log(`\n--- Match ${i + 1} (Score: ${match.score}) ---`)
            console.log(`ID: ${match.id}`)
            console.log(`Metadata:`, match.metadata)
            console.log(`Content Preview: ${(match.metadata?.text || match.metadata?.content || '').slice(0, 200)}...`)
        })

    } catch (error) {
        console.error('Retrieval failed:', error)
    }
}

debugRetrieval()

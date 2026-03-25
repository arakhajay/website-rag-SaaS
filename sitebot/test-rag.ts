import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getEmbeddingsModel } from './lib/ai-models'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(supabaseUrl, supabaseKey)

async function testRAG(chatbotId: string, userQuery: string) {
    console.log(`Testing query: "${userQuery}"`)
    
    // 1. Vector Search
    const embeddings = getEmbeddingsModel('text-embedding-3-small')
    const vector = await embeddings.embedQuery(userQuery)
    
    const { data: results, error: rpcError } = await adminClient.rpc('match_documents', {
        query_embedding: JSON.stringify(vector), 
        match_chatbot_id: chatbotId,
        match_count: 5,
        match_threshold: 0.2
    })

    if (rpcError) {
        console.error('RPC Error:', rpcError)
        return
    }

    const vectorContext = results?.map((r: any) => r.content).join('\n\n') || ''
    
    console.log('--- VECTOR CONTEXT START ---')
    console.log(vectorContext)
    console.log('--- VECTOR CONTEXT END ---')
    console.log(`Vector context length: ${vectorContext.length}`)
}

testRAG('91670030-b568-43b9-b74d-adf53a6aebc8', 'Where did Ajay go to college?')

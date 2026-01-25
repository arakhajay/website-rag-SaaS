import { OpenAIEmbeddings } from '@langchain/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Mock process.env loading
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

async function test() {
    console.log("Testing OpenAI...")
    try {
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'text-embedding-3-small',
        })
        const vec = await embeddings.embedQuery("Hello world")
        console.log("OpenAI Embedding Success. Vector len:", vec.length)
    } catch (e) {
        console.error("OpenAI Failed:", e)
    }

    console.log("Testing Pinecone...")
    try {
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
        const index = pinecone.index(process.env.PINECONE_INDEX!)
        const stats = await index.describeIndexStats()
        console.log("Pinecone Success. Stats:", stats)
    } catch (e) {
        console.error("Pinecone Failed:", e)
    }

    console.log("Testing Supabase Admin...")
    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
        const { data, error } = await supabase.from('chatbots').select('count', { count: 'exact', head: true })
        if (error) throw error
        console.log("Supabase Admin Success. Chatbot count:", data) // data is null for head:true count but error check is what matters or count
        // Actually count is returned in count property
        // But simple select is fine
    } catch (e) {
        console.error("Supabase Failed:", e)
    }
}

test()

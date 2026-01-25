
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import FirecrawlApp from 'firecrawl'
import { createClient } from '@supabase/supabase-js'

// Load Env manually to ensure it works in standalone script
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) process.env[key.trim()] = value.trim()
    })
} else {
    console.warn("No .env.local found!")
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const CHATBOT_ID = 'test-debug-bot'

async function testWebCrawl() {
    console.log('\n--- TESTING WEB CRAWL ---')
    try {
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
        console.log("Firecrawl instance keys:", Object.keys(firecrawl))
        // console.log("Firecrawl prototype:", Object.getPrototypeOf(firecrawl))

        const url = 'https://example.com'
        let response: any;

        // Inspect methods
        if (typeof (firecrawl as any).crawlUrl === 'function') {
            console.log("Calling crawlUrl...")
            response = await (firecrawl as any).crawlUrl(url, { limit: 1 })
        } else if (typeof (firecrawl as any).crawl === 'function') {
            console.log("Calling crawl...")
            response = await (firecrawl as any).crawl(url, { limit: 1 })
        } else if (typeof (firecrawl as any).scrapeUrl === 'function') {
            console.log("Calling scrapeUrl (fallback)...")
            response = await (firecrawl as any).scrapeUrl(url)
        } else {
            console.error("Method Check Failed. Available:", Object.getOwnPropertyNames(Object.getPrototypeOf(firecrawl)))
            throw new Error("No crawl/scrape method found")
        }

        console.log("Result Success:", response?.success)
        if (!response?.success) console.error("Error:", response?.error)

    } catch (e: any) {
        console.error("WEB CRAWL FAILED:", e.message)
    }
}

async function testSupabaseInsert(rows: any[]) {
    console.log('\n--- TESTING SUPABASE INSERT (CSV_DATA) ---')
    try {
        const { data: bots } = await adminClient.from('chatbots').select('id').limit(1)
        if (!bots || bots.length === 0) {
            console.warn("Skipping SQL Insert: No chatbots found.")
            return
        }
        const botId = bots[0].id
        console.log(`Using Chatbot ID: ${botId}`)

        const payload = {
            chatbot_id: botId,
            file_name: 'debug_test.csv',
            table_name: 'debug_test_csv', // Fix applied to match schema
            headers: ['id', 'name'],
            row_count: rows.length,
            data: rows
        }

        const { data, error } = await adminClient.from('csv_data').insert(payload).select()
        if (error) {
            console.error("SQL INSERT ERROR:", error)
        } else {
            console.log("SQL INSERT SUCCESS. ID:", data[0]?.id)
            await adminClient.from('csv_data').delete().eq('id', data[0]?.id)
            console.log("Cleanup: Deleted test record.")
        }

    } catch (e: any) {
        console.error("SUPABASE TEST FAILED:", e)
    }
}

async function testCSV() {
    console.log('\n--- TESTING CSV ---')
    const rows = [{ id: '1', name: 'Test' }]
    await testSupabaseInsert(rows)
}

async function run() {
    await testWebCrawl()
    await testCSV()
}

run()

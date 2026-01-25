
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import FirecrawlApp from 'firecrawl'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAI } from 'openai'

// 1. Env Setup
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) process.env[key.trim()] = value.trim()
    })
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const SAMPLES_DIR = path.resolve(process.cwd(), '../project docs/ingestion_sample_files')

// ---------------------------------------------------------
// REPLICATED LOGIC
// ---------------------------------------------------------

async function ingestWeb(chatbotId: string, url: string) {
    console.log(`\n[Web] Crawling ${url}...`)
    try {
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
        console.log("Firecrawl Methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(firecrawl)))

        // Use 'crawl' as verified
        const crawlResponse = await (firecrawl as any).crawl(url, {
            limit: 5,
            scrapeOptions: { formats: ['markdown'] }
        })

        // Handle response shape
        const jobId = crawlResponse.id || (crawlResponse as any).jobId
        if (!jobId) throw new Error(`Crawl failed: ${JSON.stringify(crawlResponse)}`)

        console.log(`[Web] Job ID: ${jobId}`)

        // Poll
        let isDone = false
        let pages = []
        const start = Date.now()
        while (!isDone) {
            if (Date.now() - start > 60000) throw new Error("Timeout")
            await new Promise(r => setTimeout(r, 2000))

            // Debugging checks
            let status: any;
            if (typeof (firecrawl as any).checkCrawlStatus === 'function') {
                status = await (firecrawl as any).checkCrawlStatus(jobId)
            } else if (typeof (firecrawl as any).asyncCrawlStatus === 'function') {
                console.log("Using asyncCrawlStatus fallback")
                status = await (firecrawl as any).asyncCrawlStatus(jobId)
            } else {
                console.error("No status check method found!")
                throw new Error("SDK Method Missing")
            }

            if (status.status === 'completed') {
                isDone = true
                pages = status.data
            } else if (status.status === 'failed') throw new Error("Job Failed")
        }

        console.log(`[Web] Got ${pages.length} pages`)
        const text = pages.map((p: any) => p.markdown).join('\n\n')
        await vectorIngest(chatbotId, text, 'website')

    } catch (e: any) {
        console.error(`[Web] Error: ${e.message}`)
    }
}

async function ingestCSV(chatbotId: string, filePath: string) {
    console.log(`\n[CSV] Processing ${path.basename(filePath)}...`)
    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'))

        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim())
            const row: any = {}
            headers.forEach((h, i) => row[h] = values[i])
            return row
        })

        const fileName = path.basename(filePath)
        const tableName = fileName.replace(/[^a-z0-9_]/gi, '_').toLowerCase()

        const { error } = await supabase.from('csv_data').insert({
            chatbot_id: chatbotId,
            file_name: fileName,
            table_name: tableName,
            headers,
            row_count: rows.length,
            data: rows
        })

        if (error) throw error
        console.log(`[CSV] SQL Insert Success (${rows.length} rows)`)

        const textCtx = rows.map(r => headers.map(h => `${h}: ${r[h]}`).join(', ')).join('\n')
        await vectorIngest(chatbotId, textCtx, 'csv')

    } catch (e: any) {
        console.error(`[CSV] Error: ${e.message}`, e)
    }
}

async function ingestFile(chatbotId: string, filePath: string) {
    console.log(`\n[File] Processing ${path.basename(filePath)}...`)
    try {
        let text = ''
        if (filePath.endsWith('.pdf')) {
            console.log("[File] Parsing PDF...")
            const pdf = require('pdf-parse')
            const buffer = fs.readFileSync(filePath)
            // Mock DOMMatrix if needed?
            // if (!global.DOMMatrix) (global as any).DOMMatrix = class {} 
            const data = await pdf(buffer)
            text = data.text
            console.log("[File] PDF Parsed.")
        } else {
            text = fs.readFileSync(filePath, 'utf-8')
        }
        console.log(`[File] Extracted ${text.length} chars`)
        await vectorIngest(chatbotId, text, 'file')
    } catch (e: any) {
        console.error(`[File] Error: ${e.message}`, e.stack?.split('\n')[0])
    }
}

async function vectorIngest(chatbotId: string, text: string, type: string) {
    console.log(`[Vector] Chunking ${type}...`)
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 100 })
    const chunks = await splitter.createDocuments([text])

    if (chunks.length === 0) return

    const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' })
    const vectors = await Promise.all(chunks.map(async (c, i) => {
        const vec = await embeddings.embedQuery(c.pageContent)
        return {
            id: `${chatbotId}_${type}_${Date.now()}_${i}`,
            values: vec,
            metadata: { chatbotId, content: c.pageContent, source: type }
        }
    }))

    const pinecone = new Pinecone()
    const index = pinecone.index(process.env.PINECONE_INDEX!)
    const BATCH = 50
    for (let i = 0; i < vectors.length; i += BATCH) {
        await index.upsert(vectors.slice(i, i + BATCH))
    }
    console.log(`[Vector] Upserted ${vectors.length} chunks`)
}

async function testChat(chatbotId: string, query: string) {
    console.log(`\n[Chat] Testing Query: "${query}"`)
    const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' })
    const queryVec = await embeddings.embedQuery(query)

    const pinecone = new Pinecone()
    const index = pinecone.index(process.env.PINECONE_INDEX!)

    const results = await index.query({
        vector: queryVec,
        topK: 3,
        includeMetadata: true,
        filter: { chatbotId }
    })

    const context = results.matches.map(m => m.metadata?.content).join('\n\n')
    console.log(`[Chat] Retrieved Context (${results.matches.length} matches)`)

    const openai = new OpenAI()
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: `Answer based on:\n${context}` },
            { role: 'user', content: query }
        ]
    })

    console.log(`[Chat] Response: ${completion.choices[0].message.content}`)
}

async function run() {
    // 1. Find Bot
    const { data: bots } = await supabase.from('chatbots').select('*').limit(1)
    if (!bots?.length) {
        console.error("No bots found.")
        return
    }
    const bot = bots[0]
    console.log(`Target Bot: ${bot.name} (${bot.id})`)

    // 2. Ingest
    const files = fs.readdirSync(SAMPLES_DIR)

    for (const f of files) {
        console.log(`Processing ${f}...`)
        const fullPath = path.join(SAMPLES_DIR, f)

        if (f.endsWith('.md')) {
            const url = fs.readFileSync(fullPath, 'utf-8').trim()
            if (url.startsWith('http')) await ingestWeb(bot.id, url)
        } else if (f.endsWith('.csv')) {
            await ingestCSV(bot.id, fullPath)
        } else if (f.endsWith('.pdf')) {
            await ingestFile(bot.id, fullPath)
        } else if (f.endsWith('.txt')) {
            await ingestFile(bot.id, fullPath)
        }
    }

    // 3. Test Chat
    await testChat(bot.id, "What technology is used in the personal website?")
    await testChat(bot.id, "What is machine learning?")
}

run()

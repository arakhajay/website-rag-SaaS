'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import FirecrawlApp from 'firecrawl'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Pinecone } from '@pinecone-database/pinecone'

// Ingest website content
export async function ingestWebsite(chatbotId: string, url: string) {
    const adminClient = createAdminClient()

    try {
        // 1. Scrape with Firecrawl
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
        console.log(`Scraping ${url}...`)

        const scrapeResult = await firecrawl.scrape(url, {
            formats: ['markdown'],
        })

        if (!scrapeResult || !scrapeResult.markdown) {
            throw new Error(`Failed to scrape ${url}`)
        }

        const content = scrapeResult.markdown
        console.log(`Scraped ${content.length} characters`)

        // 2. Chunk Text
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })
        const chunks = await splitter.createDocuments([content])
        console.log(`Generated ${chunks.length} chunks`)

        // 3. Generate Embeddings
        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small',
        })

        const vectors = await Promise.all(
            chunks.map(async (chunk, i) => {
                const vector = await embeddings.embedQuery(chunk.pageContent)
                return {
                    id: `${chatbotId}_web_${Date.now()}_${i}`,
                    values: vector,
                    metadata: {
                        chatbotId,
                        source: 'website',
                        url,
                        content: chunk.pageContent,
                        chunkIndex: i,
                    },
                }
            })
        )

        // 4. Upsert to Pinecone
        const pinecone = new Pinecone()
        const index = pinecone.index(process.env.PINECONE_INDEX!)

        const BATCH_SIZE = 100
        for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
            const batch = vectors.slice(i, i + BATCH_SIZE)
            await index.upsert(batch)
        }

        // 5. Record training source in database
        await adminClient.from('training_sources').insert({
            chatbot_id: chatbotId,
            source_type: 'website',
            source_name: url,
            chunks_count: chunks.length
        }).select()

        console.log('Website ingestion complete!')
        return {
            success: true,
            chunks: chunks.length,
            url,
            contentLength: content.length
        }

    } catch (error: any) {
        console.error('Website ingestion failed:', error)
        return { success: false, error: error.message }
    }
}

// Ingest raw text content
export async function ingestText(chatbotId: string, textContent: string, sourceLabel: string = 'direct-text') {
    const adminClient = createAdminClient()

    try {
        console.log(`Ingesting text for ${chatbotId}...`)

        // 1. Chunk Text
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })
        const chunks = await splitter.createDocuments([textContent])
        console.log(`Generated ${chunks.length} chunks from text`)

        // 2. Generate Embeddings
        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small',
        })

        const vectors = await Promise.all(
            chunks.map(async (chunk, i) => {
                const vector = await embeddings.embedQuery(chunk.pageContent)
                return {
                    id: `${chatbotId}_text_${Date.now()}_${i}`,
                    values: vector,
                    metadata: {
                        chatbotId,
                        source: 'text',
                        sourceLabel,
                        content: chunk.pageContent,
                        chunkIndex: i,
                    },
                }
            })
        )

        // 3. Upsert to Pinecone
        const pinecone = new Pinecone()
        const index = pinecone.index(process.env.PINECONE_INDEX!)

        const BATCH_SIZE = 100
        for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
            const batch = vectors.slice(i, i + BATCH_SIZE)
            await index.upsert(batch)
        }

        // 4. Record training source
        await adminClient.from('training_sources').insert({
            chatbot_id: chatbotId,
            source_type: 'text',
            source_name: sourceLabel,
            chunks_count: chunks.length
        }).select()

        console.log('Text ingestion complete!')
        return { success: true, chunks: chunks.length }

    } catch (error: any) {
        console.error('Text ingestion failed:', error)
        return { success: false, error: error.message }
    }
}

// Ingest file content (PDF, TXT, MD)
export async function ingestFile(chatbotId: string, fileName: string, fileContent: string) {
    // Convert file content to text and ingest
    return await ingestText(chatbotId, fileContent, `file:${fileName}`)
}

// Ingest CSV to SQL database
export async function ingestCSV(chatbotId: string, fileName: string, csvContent: string) {
    const adminClient = createAdminClient()

    try {
        // Parse CSV
        const lines = csvContent.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase().replace(/\s+/g, '_'))

        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
            const row: Record<string, string> = {}
            headers.forEach((header, i) => {
                row[header] = values[i] || ''
            })
            return row
        })

        // Create dynamic table name
        const tableName = `csv_${chatbotId.replace(/-/g, '_').substring(0, 20)}_${Date.now()}`

        // Store CSV metadata and content as JSON in a table
        const { error } = await adminClient.from('csv_data').insert({
            chatbot_id: chatbotId,
            table_name: tableName,
            file_name: fileName,
            headers: headers,
            row_count: rows.length,
            data: rows
        })

        if (error) throw error

        // Also create vector embeddings for RAG search
        const textRepresentation = rows.map(row =>
            headers.map(h => `${h}: ${row[h]}`).join(', ')
        ).join('\n')

        await ingestText(chatbotId, textRepresentation, `csv:${fileName}`)

        console.log('CSV ingestion complete!')
        return {
            success: true,
            tableName,
            rowCount: rows.length,
            headers
        }

    } catch (error: any) {
        console.error('CSV ingestion failed:', error)
        return { success: false, error: error.message }
    }
}

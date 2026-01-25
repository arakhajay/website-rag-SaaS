'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import FirecrawlApp from 'firecrawl'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { logInfo, logError } from '@/lib/logger'

// Placeholder logging lines removed to fix conflict


// Ingest website content (Crawl entire site)
export async function ingestWebsite(chatbotId: string, url: string, sourceId?: string) {
    logInfo('IngestWebsite', `Starting crawl for ${url} (SourceID: ${sourceId})`)
    const adminClient = createAdminClient()

    try {
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

        // 1. Submit Crawl Job
        logInfo('IngestWebsite', 'Submitting crawl job...')
        // Fix: Use 'startCrawl' for async job submission (v2 SDK). 'crawl' is a blocking waiter.
        const crawlResponse = await (firecrawl as any).startCrawl(url, {
            limit: 10,
            scrapeOptions: { formats: ['markdown'] }
        })

        // SDK v2 typically returns { success: true, id: '...' } or just { id: '...' } depending on error
        if (!crawlResponse.id) {
            logError('IngestWebsite', `Response dump: ${JSON.stringify(crawlResponse)}`)
            throw new Error(`Failed to start crawl: ${crawlResponse.error || 'Unknown error'}`)
        }

        const jobId = crawlResponse.id
        logInfo('IngestWebsite', `Job started: ${jobId}. Polling...`)

        // 2. Poll for Completion (Max 60s)
        let isCompleting = false
        let crawlResult: any = null
        const startTime = Date.now()
        const MAX_WAIT = 60000

        while (!isCompleting) {
            if (Date.now() - startTime > MAX_WAIT) throw new Error('Crawl timed out (60s limit)')

            await new Promise(r => setTimeout(r, 2000))
            // Fix: Use 'getCrawlStatus' (v2 SDK)
            const statusFn = await (firecrawl as any).getCrawlStatus(jobId)

            if (statusFn.status === 'completed') {
                isCompleting = true
                crawlResult = statusFn
                logInfo('IngestWebsite', `Crawl completed. Pages: ${crawlResult.data?.length}`)
            } else if (statusFn.status === 'failed') {
                throw new Error('Crawl job failed status')
            }
        }

        // 3. Process Pages
        const pages = crawlResult.data || []
        let totalChunks = 0

        for (const page of pages) {
            if (!page.markdown) continue
            // ... (chunking logic same) ...
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
            const chunks = await splitter.createDocuments([page.markdown])
            if (chunks.length === 0) continue

            const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' })
            const vectors = await Promise.all(chunks.map(async (chunk, i) => {
                const vector = await embeddings.embedQuery(chunk.pageContent)
                return {
                    id: `${chatbotId}_web_${Date.now()}_${totalChunks + i}`,
                    values: vector,
                    metadata: { chatbotId, source: 'website', url: page.metadata?.sourceURL || url, content: chunk.pageContent }
                }
            }))

            const pinecone = new Pinecone()
            const index = pinecone.index(process.env.PINECONE_INDEX!)
            const BATCH_SIZE = 50
            for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
                await index.upsert(vectors.slice(i, i + BATCH_SIZE))
            }
            totalChunks += chunks.length
        }
        logInfo('IngestWebsite', `Total Chunks Processed: ${totalChunks}`)

        // 4. Record/Update Source
        if (sourceId) {
            await adminClient.from('training_sources').update({ chunks_count: totalChunks }).eq('id', sourceId)
        } else {
            await adminClient.from('training_sources').insert({
                chatbot_id: chatbotId,
                source_type: 'website',
                source_name: url,
                chunks_count: totalChunks
            })
        }

        return { success: true, pages: pages.length, chunks: totalChunks }

    } catch (error: any) {
        logError('IngestWebsite', error)
        if (sourceId) {
            await adminClient.from('training_sources').delete().eq('id', sourceId)
            logInfo('IngestWebsite', `Cleanup: Deleted source ${sourceId}`)
        }
        return { success: false, error: error.message }
    }
}

// Ingest raw text content
export async function ingestText(chatbotId: string, textContent: string, sourceLabel: string = 'direct-text', sourceId?: string) {
    const adminClient = createAdminClient()

    try {
        console.log(`Ingesting text for ${chatbotId}...`)

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })
        const chunks = await splitter.createDocuments([textContent])
        console.log(`Generated ${chunks.length} chunks from text`)

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

        const pinecone = new Pinecone()
        const index = pinecone.index(process.env.PINECONE_INDEX!)

        const BATCH_SIZE = 100
        for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
            const batch = vectors.slice(i, i + BATCH_SIZE)
            await index.upsert(batch)
        }

        if (sourceId) {
            await adminClient
                .from('training_sources')
                .update({ chunks_count: chunks.length })
                .eq('id', sourceId)
        } else {
            await adminClient.from('training_sources').insert({
                chatbot_id: chatbotId,
                source_type: 'text',
                source_name: sourceLabel,
                chunks_count: chunks.length
            })
        }

        console.log('Text ingestion complete!')
        return { success: true, chunks: chunks.length }

    } catch (error: any) {
        console.error('Text ingestion failed:', error)
        if (sourceId) {
            await adminClient.from('training_sources').delete().eq('id', sourceId)
        }
        return { success: false, error: error.message }
    }
}

// Ingest file content (PDF, TXT, MD)
export async function ingestFile(chatbotId: string, fileName: string, fileBuffer: Buffer, sourceId?: string) {
    console.log(`Ingesting file: ${fileName}`)
    const fileType = fileName.split('.').pop()?.toLowerCase()

    let textContent = ''

    if (fileType === 'pdf') {
        try {
            // v1 Stable Implementation (downgraded to 1.1.1)
            const pdf = require('pdf-parse')
            const data = await pdf(fileBuffer)
            textContent = data.text
            logInfo('IngestFile', `PDF Parsed: ${textContent.length} chars`)
        } catch (e: any) {
            logError('IngestFile', e)
            if (sourceId) {
                const adminClient = createAdminClient()
                await adminClient.from('training_sources').delete().eq('id', sourceId)
            }
            throw new Error('Failed to parse PDF')
        }
    } else {
        textContent = fileBuffer.toString('utf-8')
    }

    return await ingestText(chatbotId, textContent, `file:${fileName}`, sourceId)
}

// Ingest CSV to SQL database
export async function ingestCSV(chatbotId: string, fileName: string, csvContent: string, sourceId?: string) {
    console.log(`Ingesting CSV: ${fileName}, Length: ${csvContent.length}`)
    const adminClient = createAdminClient()

    try {
        const lines = csvContent.trim().split('\n')
        if (lines.length < 2) throw new Error('CSV must have headers and at least one row')

        const headers = lines[0].split(',').map(h =>
            h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_')
        )

        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
            const row: Record<string, any> = {}
            headers.forEach((header, i) => {
                row[header] = values[i] || null
            })
            return row
        })

        const { error } = await adminClient.from('csv_data').insert({
            chatbot_id: chatbotId,
            file_name: fileName,
            table_name: fileName.replace(/[^a-z0-9_]/gi, '_').toLowerCase(), // Satisfy existing schema constraint
            headers: headers,
            row_count: rows.length,
            data: rows
        })

        if (error) {
            console.error('SQL Insert Error Detail:', error)
            throw new Error(`Failed to store CSV data: ${error.message} (${error.code})`)
        }

        const textRepresentation = rows.map(row =>
            headers.map(h => `${h}: ${row[h]}`).join(', ')
        ).join('\n')

        await ingestText(chatbotId, textRepresentation, `csv:${fileName}`, sourceId)

        console.log('CSV ingestion complete!')
        return {
            success: true,
            rowCount: rows.length,
            headers
        }

    } catch (error: any) {
        console.error('CSV ingestion failed:', error)
        if (sourceId) {
            await adminClient.from('training_sources').delete().eq('id', sourceId)
        }
        return { success: false, error: error.message }
    }
}

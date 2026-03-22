'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import FirecrawlApp from 'firecrawl'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { logInfo, logError } from '@/lib/logger'
import mammoth from 'mammoth'
import { getEmbeddingsModel } from '@/lib/ai-models'

// Ingest website content (Crawl entire site)
export async function ingestWebsite(chatbotId: string, url: string, sourceId?: string) {
    logInfo('IngestWebsite', `Starting crawl for ${url} (SourceID: ${sourceId})`)
    const adminClient = createAdminClient()

    try {
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

        // 1. Submit Crawl Job
        logInfo('IngestWebsite', 'Submitting crawl job...')
        const crawlResponse = await (firecrawl as any).startCrawl(url, {
            scrapeOptions: { formats: ['markdown'] }
        })

        if (!crawlResponse.id) {
            logError('IngestWebsite', `Response dump: ${JSON.stringify(crawlResponse)}`)
            throw new Error(`Failed to start crawl: ${crawlResponse.error || 'Unknown error'}`)
        }

        const jobId = crawlResponse.id
        logInfo('IngestWebsite', `Job started: ${jobId}. Polling...`)

        // 2. Poll for Completion (Max 300s)
        let isCompleting = false
        let crawlResult: any = null
        const startTime = Date.now()
        const MAX_WAIT = 300000 // 5 minutes

        while (!isCompleting) {
            if (Date.now() - startTime > MAX_WAIT) throw new Error('Crawl timed out (300s limit)')

            await new Promise(r => setTimeout(r, 5000)) // Poll every 5s
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

        // 3.0 Cleanup old website vectors for this source
        if (sourceId) {
            await adminClient
                .from('documents')
                .delete()
                .eq('chatbot_id', chatbotId)
                .eq('source_id', sourceId)
            logInfo('IngestWebsite', `Cleaned up old vectors for sourceId: ${sourceId}`)
        }

        for (const page of pages) {
            if (!page.markdown) continue

            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
            const chunks = await splitter.createDocuments([page.markdown])
            if (chunks.length === 0) continue

            const pageUrl = page.metadata?.sourceURL || url

            // 3.1 Per-page cleanup (by URL)
            try {
                await adminClient
                    .from('documents')
                    .delete()
                    .eq('chatbot_id', chatbotId)
                    .eq('source_url', pageUrl)
            } catch (cleanupErr) {
                console.warn(`Failed to cleanup vectors for ${pageUrl}:`, cleanupErr)
            }

            // 3.2 Generate embeddings and store
            const embeddings = getEmbeddingsModel('text-embedding-3-small')
            
            const BATCH_SIZE = 25
            for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
                const batch = chunks.slice(batchStart, batchStart + BATCH_SIZE)
                const batchTexts = batch.map(c => c.pageContent)
                const batchEmbeddings = await embeddings.embedDocuments(batchTexts)

                const rows = batch.map((chunk, i) => ({
                    chatbot_id: chatbotId,
                    content: chunk.pageContent,
                    embedding: JSON.stringify(batchEmbeddings[i]),
                    source_type: 'website',
                    source_id: sourceId || '',
                    source_url: pageUrl,
                    source_label: url,
                    chunk_index: batchStart + i,
                    metadata: { url: pageUrl }
                }))

                const { error } = await adminClient
                    .from('documents')
                    .insert(rows)

                if (error) {
                    console.error('[IngestWebsite] Supabase insert error:', error)
                    throw new Error(`Failed to store vectors: ${error.message}`)
                }
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

        // 1. Cleanup old vectors for this source
        if (sourceId) {
            await adminClient
                .from('documents')
                .delete()
                .eq('chatbot_id', chatbotId)
                .eq('source_id', sourceId)
        } else if (sourceLabel) {
            await adminClient
                .from('documents')
                .delete()
                .eq('chatbot_id', chatbotId)
                .eq('source_label', sourceLabel)
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })
        const chunks = await splitter.createDocuments([textContent])
        console.log(`Generated ${chunks.length} chunks from text`)

        const embeddings = getEmbeddingsModel('text-embedding-3-small')

        // 2. Batch embed and insert
        const BATCH_SIZE = 25
        for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
            const batch = chunks.slice(batchStart, batchStart + BATCH_SIZE)
            const batchTexts = batch.map(c => c.pageContent)
            const batchEmbeddings = await embeddings.embedDocuments(batchTexts)

            const rows = batch.map((chunk, i) => ({
                chatbot_id: chatbotId,
                content: chunk.pageContent,
                embedding: JSON.stringify(batchEmbeddings[i]),
                source_type: sourceLabel.startsWith('csv:') ? 'csv' : sourceLabel.startsWith('file:') ? 'file' : 'text',
                source_id: sourceId || '',
                source_label: sourceLabel,
                chunk_index: batchStart + i,
                metadata: { sourceLabel }
            }))

            const { error } = await adminClient
                .from('documents')
                .insert(rows)

            if (error) {
                console.error('[IngestText] Supabase insert error:', error)
                throw new Error(`Failed to store vectors: ${error.message}`)
            }
        }

        if (sourceId) {
            await adminClient.from('training_sources').update({ chunks_count: chunks.length }).eq('id', sourceId)
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

// Ingest file content (PDF, TXT, MD, DOCX)
export async function ingestFile(chatbotId: string, fileName: string, fileBuffer: Buffer, sourceId?: string) {
    console.log(`Ingesting file: ${fileName}`)
    const fileType = fileName.split('.').pop()?.toLowerCase()

    let textContent = ''

    if (fileType === 'pdf') {
        try {
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
    } else if (fileType === 'docx') {
        try {
            const result = await mammoth.extractRawText({ buffer: fileBuffer })
            textContent = result.value
            logInfo('IngestFile', `DOCX Parsed: ${textContent.length} chars`)
        } catch (e: any) {
            logError('IngestFile', e)
            if (sourceId) {
                const adminClient = createAdminClient()
                await adminClient.from('training_sources').delete().eq('id', sourceId)
            }
            throw new Error('Failed to parse DOCX')
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

        const tableName = fileName.replace(/[^a-z0-9_]/gi, '_').toLowerCase()

        const { error: deleteError } = await adminClient
            .from('csv_data')
            .delete()
            .eq('chatbot_id', chatbotId)
            .eq('file_name', fileName)

        if (deleteError) {
            console.warn('Failed to cleanup old CSV data:', deleteError)
        }

        const { error } = await adminClient.from('csv_data').insert({
            chatbot_id: chatbotId,
            file_name: fileName,
            table_name: tableName,
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

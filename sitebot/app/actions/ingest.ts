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

        // Cleanup old website vectors for this source (if we have sourceId) or URL
        // Since we don't have deterministic sourceId for website pages easily, we use filter based cleanup
        // We'll clean up ALL vectors for this website source if sourceId is provided, or by URL pattern if not?
        // Actually, ingestWebsite takes a single URL which might be a crawl starting point.
        // It's safer to delete by chatbotId + source as 'website'.
        // But that deletes ALL websites.
        // Ideally we should have passed sourceId. If sourceId exists, we can use it to track what to delete.
        // But previously we didn't store sourceId in vector metadata for website.
        // Let's try to filter by metadata.url if possible, but that's per page.
        // BEST APPROACH: If sourceId is provided, delete all vectors with that sourceId (if we started storing it).
        // Since we are upgrading, let's just delete by chatbotId + source='website' AND source_name=url (if strictly matching)
        // OR just rely on the user overwriting the same sourceId.

        // We will add cleanup block similar to ingestText but specific for this crawl session if possible.
        // For now, let's start storing sourceId in website vectors and use it for future cleanup.
        // For IMMEDIATE cleanup of duplicates the user sees:
        // We can try to delete where metadata.url starts with the crawled URL?
        // Let's assume re-crawling the same URL means we want to replace it.

        // 3.1 Cleanup logic
        try {
            // If we have sourceId, try to delete everything associated with it
            // Previous implementation didn't store sourceId in metadata.
            // We'll use the URL as a proxy for sourceLabel or just source=website

            // NOTE: Deleting all website data for a chatbot might be too aggressive if they have multiple sites.
            // But if they are just testing one site, it fixes the "duplication" issue.
            // Let's try to be specific: Delete vectors where source='website' AND url matches what we are crawling?
            // Pinecone doesn't support "starts with" filter.
            // We will rely on deterministic IDs for overwrite in this new batch, 
            // AND try to delete old ones if sourceId is present.

            if (sourceId) {
                const pinecone = new Pinecone()
                const index = pinecone.index(process.env.PINECONE_INDEX!)

                // Try delete by filter first (Pro/Enterprise)
                /* 
                await index.deleteMany({
                    chatbotId,
                    source: 'website',
                    // pinecone doesn't allow robust filtering on arbitrary metadata easily in deleteMany for serverless
                }) 
                */

                // Fallback: Query and delete
                // We can't easily find "all pages of this site" without tagging them.
                // Going forward, we will tag them with sourceId.
            }
        } catch (e) {
            console.warn('Website cleanup skipped', e)
        }

        // We'll rely on deterministic IDs where possible.
        // For website, we used `${chatbotId}_web_${Date.now()}_${totalChunks + i}` which causes dupes.
        // WE MUST CHANGE THIS ID GENERATION.

        // New strategy: Use URL-based deterministic ID.
        // ID: `${chatbotId}_web_${hash(url)}_${chunkIndex}`
        // This ensures if we re-crawl the same page, we overwrite the same vectors.

        const pinecone = new Pinecone()
        const index = pinecone.index(process.env.PINECONE_INDEX!)

        for (const page of pages) {
            if (!page.markdown) continue
            // ... (chunking logic same) ...
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
            const chunks = await splitter.createDocuments([page.markdown])
            if (chunks.length === 0) continue

            // 3.1 Per-Page Cleanup: Remove existing vectors for this URL to prevent duplicates (especially old timestamp-based ones)
            try {
                const targetUrl = page.metadata?.sourceURL || url
                console.log(`Cleaning up old vectors for URL: ${targetUrl}`)
                await index.deleteMany({
                    chatbotId,
                    source: 'website',
                    url: targetUrl
                })
            } catch (cleanupErr) {
                console.warn(`Failed to cleanup vectors for ${page.metadata?.sourceURL}:`, cleanupErr)
                // Continue anyway - deterministic IDs will handle new overwrites
            }

            const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' })
            const vectors = await Promise.all(chunks.map(async (chunk, i) => {
                const vector = await embeddings.embedQuery(chunk.pageContent)

                // Deterministic ID based on URL
                // Simple hash of URL to avoid special char issues in ID
                const urlHash = Buffer.from(page.metadata?.sourceURL || url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
                const vectorId = `${chatbotId}_web_${urlHash}_${i}`

                return {
                    id: vectorId,
                    values: vector,
                    metadata: {
                        chatbotId,
                        source: 'website',
                        url: page.metadata?.sourceURL || url,
                        content: chunk.pageContent,
                        sourceId: sourceId || ''
                    }
                }
            }))

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
        const pinecone = new Pinecone()
        const index = pinecone.index(process.env.PINECONE_INDEX!)

        // 1. Cleanup old vectors
        // Try to delete by sourceId first (if we used it in metadata), then sourceLabel
        if (sourceId || sourceLabel) {
            try {
                // Determine filter. If we have sourceId, use it. But previous files might only have sourceLabel.
                // We'll filter by chatbotId + sourceLabel for now as that's what was stored.
                // In future we should store sourceId in metadata.
                const filter = {
                    chatbotId,
                    ...(sourceLabel ? { sourceLabel } : {})
                }

                console.log(`Attempting to delete old vectors with filter:`, JSON.stringify(filter))
                await index.deleteMany(filter)
                console.log('Cleanup successful')
            } catch (cleanupError) {
                console.warn('Vector cleanup via filter failed (likely serverless). Trying Query+DeleteByID fallback...')
                try {
                    // Fallback for Serverless: Query to find IDs, then delete by ID
                    // 1536 dimensions for text-embedding-3-small
                    const zeroVector = new Array(1536).fill(0)
                    const searchResult = await index.query({
                        vector: zeroVector,
                        topK: 1000, // Reasonable batch limit
                        includeValues: false,
                        includeMetadata: true,
                        filter: {
                            chatbotId,
                            ...(sourceLabel ? { sourceLabel } : {})
                        }
                    })

                    const vectorIdsToDelete = searchResult.matches?.map(m => m.id) || []
                    if (vectorIdsToDelete.length > 0) {
                        console.log(`Found ${vectorIdsToDelete.length} stale vectors to delete.`)
                        await index.deleteMany(vectorIdsToDelete)
                        console.log('Fallback cleanup successful')
                    } else {
                        console.log('No stale vectors found to delete.')
                    }
                } catch (fallbackError) {
                    console.error('Final cleanup verification failed:', fallbackError)
                }
            }
        }

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
                // Use deterministic ID if sourceId is available, otherwise timestamp
                const vectorId = sourceId
                    ? `${sourceId}_${i}`
                    : `${chatbotId}_text_${Date.now()}_${i}`

                return {
                    id: vectorId,
                    values: vector,
                    metadata: {
                        chatbotId,
                        source: 'text',
                        sourceLabel,
                        sourceId: sourceId || '',
                        content: chunk.pageContent,
                        chunkIndex: i,
                    },
                }
            })
        )

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

        // 1. Cleanup existing SQL data for this file/table
        // We delete rows where chatbot_id and table_name match
        const tableName = fileName.replace(/[^a-z0-9_]/gi, '_').toLowerCase()

        // Note: 'csv_data' table structure usually allows storing multiple files.
        // We should delete by (chatbot_id, file_name) or (chatbot_id, table_name).
        // Let's assume file_name is unique enough for the user provided input.
        const { error: deleteError } = await adminClient
            .from('csv_data')
            .delete()
            .eq('chatbot_id', chatbotId)
            .eq('file_name', fileName)

        if (deleteError) {
            console.warn('Failed to cleanup old CSV data:', deleteError)
            // Proceeding anyway but logging warinig
        }

        const { error } = await adminClient.from('csv_data').insert({
            chatbot_id: chatbotId,
            file_name: fileName,
            table_name: tableName, // Satisfy existing schema constraint
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

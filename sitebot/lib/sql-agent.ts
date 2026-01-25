import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

/**
 * Hybrid SQL Agent for CSV Data
 * 
 * Since CSV data is stored as JSONB in the `csv_data` table (not real SQL tables),
 * we fetch the data and let the LLM analyze it directly.
 */
export async function generateAndRunSQL(chatbotId: string, userQuery: string): Promise<string | null> {
    const supabase = createAdminClient()

    try {
        // 1. Fetch all CSV data for this chatbot
        const { data: csvRecords, error } = await supabase
            .from('csv_data')
            .select('file_name, table_name, headers, data, row_count')
            .eq('chatbot_id', chatbotId)

        if (error) {
            console.error('[SQL Agent] Error fetching CSV data:', error.message)
            return null
        }

        if (!csvRecords || csvRecords.length === 0) {
            console.log('[SQL Agent] No CSV data found for chatbot:', chatbotId)
            return null // No structured data available
        }

        console.log(`[SQL Agent] Found ${csvRecords.length} CSV datasets`)

        // 2. Build context from CSV data (limit to prevent token overflow)
        const MAX_ROWS_PER_TABLE = 50
        let dataContext = ''

        for (const record of csvRecords) {
            const rows = record.data?.slice(0, MAX_ROWS_PER_TABLE) || []
            const headers = record.headers || []

            // Format as markdown table for better LLM understanding
            dataContext += `\n## Dataset: ${record.file_name}\n`
            dataContext += `Columns: ${headers.join(', ')}\n`
            dataContext += `Total Rows: ${record.row_count}\n\n`

            if (rows.length > 0) {
                // Add header row
                dataContext += `| ${headers.join(' | ')} |\n`
                dataContext += `| ${headers.map(() => '---').join(' | ')} |\n`

                // Add data rows
                for (const row of rows) {
                    const values = headers.map(h => String(row[h] || '').slice(0, 50)) // Truncate long values
                    dataContext += `| ${values.join(' | ')} |\n`
                }
            }

            if (record.row_count > MAX_ROWS_PER_TABLE) {
                dataContext += `\n... (showing first ${MAX_ROWS_PER_TABLE} of ${record.row_count} rows)\n`
            }
        }

        // 3. Generate analysis using LLM
        const prompt = `You are a data analyst. Analyze the following structured data to answer the user's question.

AVAILABLE DATA:
${dataContext}

USER QUESTION: ${userQuery}

INSTRUCTIONS:
- Analyze the data above to answer the question
- If the data contains the answer, provide it clearly with specific values
- If calculations are needed (counts, sums, averages), perform them
- If the data doesn't contain relevant information, say so clearly
- Be concise and factual

ANSWER:`

        console.log('[SQL Agent] Generating analysis...')

        const { text: analysis } = await generateText({
            model: openai('gpt-4o'),
            prompt,
        })

        console.log('[SQL Agent] Analysis complete')
        return analysis.trim()

    } catch (e: any) {
        console.error('[SQL Agent] Error:', e.message)
        return null // Return null to let vector search handle the response
    }
}

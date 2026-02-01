
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    console.log('Testing insert with custom_data...')

    // Try to insert a dummy lead with custom_data
    // We need a valid chatbot_id. I'll pick one if any exist, or fail.
    const { data: chatbots } = await supabase.from('chatbots').select('id').limit(1)

    if (!chatbots || chatbots.length === 0) {
        console.log('No chatbots found to test with.')
        return
    }

    const chatbotId = chatbots[0].id

    const { error } = await supabase
        .from('leads')
        .insert({
            chatbot_id: chatbotId,
            email: 'test_schema_check@example.com',
            name: 'Schema Check',
            custom_data: { test: true },
            source: 'schema_verification'
        })

    if (error) {
        console.error('Insert FAILED:', error.message)
        if (error.message.includes('column "name" of relation "leads" does not exist') ||
            error.message.includes('column "custom_data" of relation "leads" does not exist')) {
            console.log('DIAGNOSIS: Columns are missing. Migration was NOT run.')
        }
    } else {
        console.log('Insert SUCCESS. Schema is correct.')

        // Cleanup
        await supabase.from('leads').delete().eq('email', 'test_schema_check@example.com')
    }
}

run()

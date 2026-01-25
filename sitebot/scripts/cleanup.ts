
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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

async function run() {
    console.log("Cleaning up stuck 'Indexing...' sources...")

    // Delete sources where chunks_count is 0 (or -1 if we set that)
    const { error, count } = await supabase
        .from('training_sources')
        .delete({ count: 'exact' })
        .eq('chunks_count', 0)

    if (error) console.error("Error:", error.message)
    else console.log(`Deleted ${count} stuck sources.`)
}

run()

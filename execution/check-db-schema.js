const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const dotenv = require('dotenv')

// Load env
dotenv.config({ path: path.resolve(__dirname, '../sitebot/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use Service Key to bypass RLS for check

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable(tableName) {
    const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.log(`❌ Table '${tableName}' does NOT exist.`)
            return false
        }
        console.log(`⚠️  Error checking '${tableName}':`, error.message)
        return false // Assume missing or inaccessible
    }
    console.log(`✅ Table '${tableName}' exists.`)
    return true
}

async function main() {
    console.log('Checking Database Schema...')

    await checkTable('profiles')
    await checkTable('chatbots')
    await checkTable('training_sources')
    await checkTable('csv_data') // Checking for the static one in schema.sql for now

    console.log('Check complete.')
}

main()

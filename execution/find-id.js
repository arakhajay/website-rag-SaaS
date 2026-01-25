const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Manually load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) env[key.trim()] = value.trim()
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getValidUserId() {
    console.log('Fetching from chatbots...')
    const { data: bots, error: botError } = await supabase
        .from('chatbots')
        .select('user_id')
        .limit(1)

    if (bots && bots.length > 0) {
        console.log('FOUND_ID:' + bots[0].user_id)
        return
    }

    console.log('Fetching from profiles...')
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

    if (profiles && profiles.length > 0) {
        console.log('FOUND_ID:' + profiles[0].id)
        return
    }

    console.log('No ID found')
}

getValidUserId()

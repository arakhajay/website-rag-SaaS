const fs = require('fs')
const path = require('path')

// Load env
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

async function runSQL(sql) {
    // Use the Supabase Management API / pg_net or direct REST approach
    // Actually, we can use the PostgREST rpc endpoint if there's a function
    // Let's try adding the column via the Supabase SQL endpoint (management API)
    
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
    
    // Try the database query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
        }
    })
    console.log('RPC endpoint status:', response.status)
    
    // Alternative: use pg via the pooler endpoint with password from dashboard
    // Since we can't connect directly, let's just test if the column already exists
    // by trying to insert with username field
    
    console.log('Testing if username column works via Supabase client...')
    
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)
    
    // Try selecting username column
    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .limit(1)
    
    if (error) {
        console.log('❌ username column does not exist yet.')
        console.log('Error:', error.message)
        console.log('')
        console.log('╔══════════════════════════════════════════════════════╗')
        console.log('║  Please run this SQL in Supabase SQL Editor:        ║')
        console.log('╠══════════════════════════════════════════════════════╣')
        console.log('║                                                      ║')
        console.log('║  ALTER TABLE public.profiles                         ║')
        console.log('║  ADD COLUMN IF NOT EXISTS username TEXT;              ║')
        console.log('║                                                      ║')
        console.log('║  CREATE UNIQUE INDEX IF NOT EXISTS                    ║')
        console.log('║  profiles_username_unique                             ║')
        console.log('║  ON public.profiles (LOWER(username));               ║')
        console.log('║                                                      ║')
        console.log('╚══════════════════════════════════════════════════════╝')
        console.log('')
        console.log('URL:', `https://supabase.com/dashboard/project/${projectRef}/sql/new`)
    } else {
        console.log('✅ username column already exists!')
        console.log('Data:', data)
    }
}

runSQL()

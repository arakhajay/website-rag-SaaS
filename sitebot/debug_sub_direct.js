const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kuqalssqtivypjxwtluz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cWFsc3NxdGl2eXBqeHd0bHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA0NTMzOSwiZXhwIjoyMDg0NjIxMzM5fQ.38NwMPD3gbSNI8vnKLyP5ZcJghm5wgdN2VjsRDwljas'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Querying subscriptions directly...')
  
  // Just get the last 5 subscriptions to inspect structure and data
  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (subError) {
    console.error('Sub Error:', subError)
    return
  }

  console.log('Found recent subscriptions:', JSON.stringify(subs, null, 2))
}

main()

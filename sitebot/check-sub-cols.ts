import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function test() {
  const { data, error } = await supabase.from('subscriptions').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Row:', data[0])
    console.log('Keys:', data[0] ? Object.keys(data[0]) : 'No data')
  }
}

test()

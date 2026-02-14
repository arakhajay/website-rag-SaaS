const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kuqalssqtivypjxwtluz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cWFsc3NxdGl2eXBqeHd0bHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA0NTMzOSwiZXhwIjoyMDg0NjIxMzM5fQ.38NwMPD3gbSNI8vnKLyP5ZcJghm5wgdN2VjsRDwljas'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Searching for users...')
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name')
    .ilike('full_name', '%sumit%')

  if (userError) {
    console.error('User Error:', userError)
    return
  }

  console.log('Found users:', users)

  if (users.length === 0) {
      console.log('No users found.')
      return
  }

  const userIds = users.map(u => u.id)

  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .in('user_id', userIds)

  if (subError) {
    console.error('Sub Error:', subError)
    return
  }

  console.log('Found subscriptions:', JSON.stringify(subs, null, 2))
}

main()

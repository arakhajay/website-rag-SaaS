import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getUserId() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

    if (error) {
        console.error('Error fetching profiles:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Valid User ID found:', data[0].id)
    } else {
        console.log('No profiles found.')
    }
}

getUserId()

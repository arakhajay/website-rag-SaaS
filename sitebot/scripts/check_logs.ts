
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    console.log('Checking recent sessions...')
    const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Recent sessions:', sessions?.map(s => ({
        id: s.id,
        updated_at: s.updated_at,
        session_id: s.session_id,
        msg_count: '?'
    })))

    if (sessions && sessions.length > 0) {
        const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessions[0].id)
        console.log(`Message count for latest session (${sessions[0].id}):`, count)
    }
}

run()

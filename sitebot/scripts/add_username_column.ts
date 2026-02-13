import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrate() {
    console.log('Adding username column to profiles table...')

    const { error } = await supabase.rpc('exec_sql', {
        query: `
            ALTER TABLE public.profiles 
            ADD COLUMN IF NOT EXISTS username TEXT;

            CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
            ON public.profiles (LOWER(username));
        `
    })

    if (error) {
        // rpc might not exist, try raw REST
        console.log('rpc exec_sql not available, trying direct fetch...')
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    ALTER TABLE public.profiles 
                    ADD COLUMN IF NOT EXISTS username TEXT;
                    CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
                    ON public.profiles (LOWER(username));
                `
            })
        })

        if (!response.ok) {
            console.log('Direct REST also failed.')
            console.log('Status:', response.status)
            console.log('Please run this SQL manually in Supabase SQL Editor:')
            console.log(`
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
ON public.profiles (LOWER(username));
            `)
            return
        }
    }

    console.log('✅ Migration complete!')
}

migrate().catch(console.error)

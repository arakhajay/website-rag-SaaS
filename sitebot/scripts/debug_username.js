const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function backfillUsernames() {
    console.log('Backfilling usernames from auth user_metadata...')

    // List all auth users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Error listing users:', error.message)
        return
    }

    for (const user of users) {
        const username = user.user_metadata?.username
        if (username) {
            console.log(`Updating ${user.email} with username: ${username}`)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ username })
                .eq('id', user.id)

            if (updateError) {
                console.error(`  Error: ${updateError.message}`)
            } else {
                console.log(`  ✅ Updated`)
            }
        } else {
            console.log(`Skipping ${user.email} - no username in metadata`)
        }
    }

    // Verify
    const { data: profiles } = await supabase
        .from('profiles')
        .select('email, username')

    console.log('\nFinal profiles:', JSON.stringify(profiles, null, 2))
}

backfillUsernames()

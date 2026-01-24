const { Pinecone } = require('@pinecone-database/pinecone')
const { OpenAI } = require('openai')
const fs = require('fs')
const path = require('path')

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim()
})

async function checkConnections() {
    console.log('=== API Connection Check ===\n')

    // 1. Check OpenAI
    console.log('1. Checking OpenAI...')
    try {
        const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
        const response = await openai.models.list()
        console.log('   ✅ OpenAI: Connected! Found', response.data.length, 'models')
    } catch (error) {
        console.log('   ❌ OpenAI Error:', error.message)
    }

    // 2. Check Pinecone
    console.log('\n2. Checking Pinecone...')
    try {
        const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY })

        // List existing indexes
        const indexList = await pinecone.listIndexes()
        console.log('   Existing indexes:', indexList.indexes?.map(i => i.name) || 'None')

        const targetIndex = env.PINECONE_INDEX || 'sitebot-v1'
        const existingIndex = indexList.indexes?.find(i => i.name === targetIndex)

        if (existingIndex) {
            console.log(`   ✅ Pinecone: Index "${targetIndex}" exists!`)
        } else {
            console.log(`   ⚠️  Index "${targetIndex}" not found. Creating...`)

            await pinecone.createIndex({
                name: targetIndex,
                dimension: 1536, // text-embedding-3-small dimension
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            })
            console.log(`   ✅ Created index "${targetIndex}" successfully!`)
            console.log('   ⏳ Note: Index may take 1-2 minutes to become ready.')
        }
    } catch (error) {
        console.log('   ❌ Pinecone Error:', error.message)
    }

    // 3. Check Firecrawl
    console.log('\n3. Checking Firecrawl...')
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: 'https://example.com', formats: ['markdown'] })
        })

        if (response.ok) {
            console.log('   ✅ Firecrawl: Connected!')
        } else {
            const errorData = await response.json()
            console.log('   ❌ Firecrawl Error:', response.status, errorData.error || errorData.message)
        }
    } catch (error) {
        console.log('   ❌ Firecrawl Error:', error.message)
    }

    // 4. Check Supabase
    console.log('\n4. Checking Supabase...')
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
        })

        if (response.ok || response.status === 200) {
            console.log('   ✅ Supabase: Connected!')
        } else {
            console.log('   ❌ Supabase Error:', response.status, await response.text())
        }
    } catch (error) {
        console.log('   ❌ Supabase Error:', error.message)
    }

    console.log('\n=== Check Complete ===')
}

checkConnections()

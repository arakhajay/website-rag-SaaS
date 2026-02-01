
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Try loading .env.local
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local')
    dotenv.config({ path: envPath })
} else {
    console.log('No .env.local found, trying .env')
    dotenv.config({ path: path.resolve(__dirname, '../.env') })
}

const connectionString = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL // Sometimes needed for migrations if pooling is involved

if (!connectionString && !directUrl) {
    console.error('Missing DATABASE_URL')
    process.exit(1)
}

const client = new Client({
    connectionString: directUrl || connectionString,
})

async function run() {
    try {
        await client.connect()
        console.log('Connected to DB')

        await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;
    `)

        console.log('Migration successful!')
    } catch (e) {
        console.error('Migration failed:', e)
    } finally {
        await client.end()
    }
}

run()

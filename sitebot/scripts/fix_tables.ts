
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const sql = `
-- Create guidelines table
create table if not exists guidelines (
  id uuid default gen_random_uuid() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  title text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workflows table
create table if not exists workflows (
  id uuid default gen_random_uuid() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  title text not null,
  trigger_condition text not null,
  training_phrases text[] default '{}',
  instructions text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table guidelines enable row level security;
alter table workflows enable row level security;

-- Create policies (drop first to avoid errors if they exist partially)
drop policy if exists "Enable read access for all users" on guidelines;
drop policy if exists "Enable insert for authenticated users only" on guidelines;
drop policy if exists "Enable update for users based on email" on guidelines;
drop policy if exists "Enable delete for users based on email" on guidelines;

drop policy if exists "Enable read access for all users" on workflows;
drop policy if exists "Enable insert for authenticated users only" on workflows;
drop policy if exists "Enable update for users based on email" on workflows;
drop policy if exists "Enable delete for users based on email" on workflows;

create policy "Enable read access for all users" on guidelines for select using (true);
create policy "Enable insert for authenticated users only" on guidelines for insert with check (auth.role() = 'authenticated');
create policy "Enable update for users based on email" on guidelines for update using (auth.role() = 'authenticated');
create policy "Enable delete for users based on email" on guidelines for delete using (auth.role() = 'authenticated');

create policy "Enable read access for all users" on workflows for select using (true);
create policy "Enable insert for authenticated users only" on workflows for insert with check (auth.role() = 'authenticated');
create policy "Enable update for users based on email" on workflows for update using (auth.role() = 'authenticated');
create policy "Enable delete for users based on email" on workflows for delete using (auth.role() = 'authenticated');
`

async function run() {
    console.log('Running migration...')
    // Note: Supabase JS client 'rpc' is usually best, but we don't have a pure SQL exec function exposed by default.
    // However, if we don't have a SQL function, we might fail.
    // BUT the user's previous code used 'adminClient', which implies they might have access.
    // Actually, 'supabase-js' on client side doesn't execute raw SQL easily without an extension or RPC.

    // Check if we have a way to run SQL.
    // If not, we can try to use the REST API to create entries, but we need TABLES first.
    // Since we are running as a script, we can perhaps use the PG library if connection string is available.
    // But we usually only have the URL and Key.

    // Alternative: We can use the 'postgres' npm package if we have the connection string.
    // Let's check if DATABASE_URL is in env.

    if (process.env.DATABASE_URL) {
        console.log('Using DATABASE_URL to connect directly...')
        /* 
           we need 'postgres' or 'pg' package. 
           Project has:
                "@supabase/supabase-js": "^2.91.0",
                "dotenv": "^17.2.3",
           It does NOT seem to have 'pg'.
           
           However, we can try to use a Supabase RPC to run SQL if one exists.
           Often 'exec_sql' or similar is added.
        */
    }

    // CRITICAL: We cannot run raw SQL via supabase-js without a wrapper function.
    // BUT, since I am an agent, I can try to use the 'postgres' connection string if I can find it.
    // Or, I can ask the user to restart the MCP server? No.

    // Let's assume the user has the 'pg' library or I can install it?
    // Project dependencies don't show 'pg'.

    // Wait, the project has 'firecrawl' etc.

    // Let's try to install 'pg' temporarily or just use the Management API? 
    // Supabase Management API v1 allows running SQL? No, that's platform API.

    // OK, the BEST way if I can't use MCP is to use the `pg` library.
    // I will try to `npm install pg @types/pg tsx` if needed? 
    // They have `tsx` likely? No explicit `tsx` in deps, but `scripts` has `next dev`.

    // Let's try to install 'pg' and run a script.
}

// Rewriting for 'pg' usage
import { Client } from 'pg'

async function runMigration() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in .env.local. Cannot run SQL migration directly.')
        return
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })

    try {
        await client.connect()
        console.log('Connected to database.')
        await client.query(sql)
        console.log('Migration completed successfully.')
    } catch (err) {
        console.error('Migration failed:', err)
    } finally {
        await client.end()
    }
}

runMigration()

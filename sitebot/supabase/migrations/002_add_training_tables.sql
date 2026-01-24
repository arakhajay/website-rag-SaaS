-- Run this in your Supabase SQL Editor to add the new tables
-- Create a table for training sources
create table if not exists training_sources (
    id uuid default uuid_generate_v4() primary key,
    chatbot_id uuid references chatbots(id) on delete cascade not null,
    source_type text not null,
    -- 'website', 'text', 'file', 'csv'
    source_name text not null,
    chunks_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- RLS for training_sources
alter table training_sources enable row level security;
drop policy if exists "Users can view training sources for their chatbots." on training_sources;
create policy "Users can view training sources for their chatbots." on training_sources for
select using (
        chatbot_id in (
            select id
            from chatbots
            where user_id = auth.uid()
        )
    );
drop policy if exists "Service role can manage all training sources." on training_sources;
create policy "Service role can manage all training sources." on training_sources for all using (true);
-- Create a table for CSV data storage
create table if not exists csv_data (
    id uuid default uuid_generate_v4() primary key,
    chatbot_id uuid references chatbots(id) on delete cascade not null,
    table_name text not null,
    file_name text not null,
    headers text [] not null,
    row_count integer default 0,
    data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- RLS for csv_data
alter table csv_data enable row level security;
drop policy if exists "Users can view CSV data for their chatbots." on csv_data;
create policy "Users can view CSV data for their chatbots." on csv_data for
select using (
        chatbot_id in (
            select id
            from chatbots
            where user_id = auth.uid()
        )
    );
drop policy if exists "Service role can manage all CSV data." on csv_data;
create policy "Service role can manage all CSV data." on csv_data for all using (true);
-- Add policy to allow service role to insert chatbots
drop policy if exists "Service role can insert chatbots." on chatbots;
create policy "Service role can insert chatbots." on chatbots for
insert with check (true);
-- Verify tables were created
select 'training_sources' as table_name,
    count(*) as row_count
from training_sources
union all
select 'csv_data' as table_name,
    count(*) as row_count
from csv_data;
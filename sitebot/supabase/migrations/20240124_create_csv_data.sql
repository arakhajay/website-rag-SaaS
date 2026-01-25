-- Create table for storing CSV data rows
create table if not exists csv_data (
    id uuid default gen_random_uuid() primary key,
    chatbot_id uuid references chatbots(id) on delete cascade not null,
    file_name text not null,
    headers jsonb,
    row_count integer,
    data jsonb,
    -- Stores the rows as a JSON array
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS
alter table csv_data enable row level security;
-- Policies
create policy "Users can view own csv data" on csv_data for
select using (
        auth.uid() in (
            select user_id
            from chatbots
            where id = csv_data.chatbot_id
        )
    );
create policy "Users can insert own csv data" on csv_data for
insert with check (
        auth.uid() in (
            select user_id
            from chatbots
            where id = csv_data.chatbot_id
        )
    );
-- (Optional) Create function to search CSV data if we want structured search within JSON
-- For now, we rely on the hybrid RAG approach (Text representation in Pinecone).
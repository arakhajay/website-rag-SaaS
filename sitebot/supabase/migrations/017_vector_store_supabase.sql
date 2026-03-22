-- Migration: Move vector store from Pinecone to Supabase pgvector
-- This enables vector similarity search directly in Supabase

-- 1. Enable the pgvector extension
create extension if not exists vector with schema extensions;

-- 2. Create the documents table for storing embeddings
create table if not exists documents (
    id uuid default uuid_generate_v4() primary key,
    chatbot_id uuid references chatbots(id) on delete cascade not null,
    content text not null,
    metadata jsonb default '{}'::jsonb,
    embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
    source_type text not null default 'text',  -- 'website', 'text', 'file', 'csv'
    source_id text,  -- links to training_sources.id
    source_url text,  -- for website sources
    source_label text,  -- for text/file sources
    chunk_index integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create an index for fast vector similarity search (IVFFlat)
create index if not exists documents_embedding_idx 
    on documents 
    using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- 4. Create an index for filtering by chatbot_id
create index if not exists documents_chatbot_id_idx on documents(chatbot_id);
create index if not exists documents_source_id_idx on documents(source_id);

-- 5. Create the similarity search function
create or replace function match_documents(
    query_embedding vector(1536),
    match_chatbot_id uuid,
    match_count int default 3,
    match_threshold float default 0.5
)
returns table (
    id uuid,
    content text,
    metadata jsonb,
    source_type text,
    source_url text,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        d.id,
        d.content,
        d.metadata,
        d.source_type,
        d.source_url,
        1 - (d.embedding <=> query_embedding) as similarity
    from documents d
    where d.chatbot_id = match_chatbot_id
      and 1 - (d.embedding <=> query_embedding) > match_threshold
    order by d.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- 6. RLS policies
alter table documents enable row level security;

drop policy if exists "Users can view documents for their chatbots." on documents;
create policy "Users can view documents for their chatbots." on documents for
select using (
    chatbot_id in (
        select id from chatbots where user_id = auth.uid()
    )
);

drop policy if exists "Service role can manage all documents." on documents;
create policy "Service role can manage all documents." on documents for all using (true);

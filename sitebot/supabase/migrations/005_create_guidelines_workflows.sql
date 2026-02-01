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
    training_phrases text [] default '{}',
    instructions text not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS
alter table guidelines enable row level security;
alter table workflows enable row level security;
-- Create policies (simplified for admin/authenticated users)
-- Adjust 'public' to 'authenticated' if you strictly enforce Auth, 
-- but ensuring 'public' reads for chat interface (if anonymous) might be needed depending on arch.
-- For now, using standard policies.
create policy "Enable read access for all users" on guidelines for
select using (true);
create policy "Enable insert for authenticated users only" on guidelines for
insert with check (auth.role() = 'authenticated');
create policy "Enable update for users based on email" on guidelines for
update using (auth.role() = 'authenticated');
create policy "Enable delete for users based on email" on guidelines for delete using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on workflows for
select using (true);
create policy "Enable insert for authenticated users only" on workflows for
insert with check (auth.role() = 'authenticated');
create policy "Enable update for users based on email" on workflows for
update using (auth.role() = 'authenticated');
create policy "Enable delete for users based on email" on workflows for delete using (auth.role() = 'authenticated');
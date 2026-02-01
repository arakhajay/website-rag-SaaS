-- Create chatbot_settings table
create table if not exists chatbot_settings (
    id uuid default gen_random_uuid() primary key,
    chatbot_id uuid references chatbots(id) on delete cascade not null unique,
    general jsonb default '{}'::jsonb,
    appearance jsonb default '{}'::jsonb,
    messaging jsonb default '{}'::jsonb,
    starter_questions jsonb default '[]'::jsonb,
    email_config jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS
alter table chatbot_settings enable row level security;
-- Create policies
create policy "Enable read access for all users" on chatbot_settings for
select using (true);
create policy "Enable insert for authenticated users only" on chatbot_settings for
insert with check (auth.role() = 'authenticated');
create policy "Enable update for users based on email" on chatbot_settings for
update using (auth.role() = 'authenticated');
create policy "Enable delete for users based on email" on chatbot_settings for delete using (auth.role() = 'authenticated');
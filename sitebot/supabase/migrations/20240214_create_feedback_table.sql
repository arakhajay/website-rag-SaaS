-- Create a table for storing user feedback
create table if not exists public.feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    category text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS
alter table public.feedback enable row level security;
-- Policies
create policy "Users can insert their own feedback" on public.feedback for
insert with check (auth.uid() = user_id);
create policy "Admins can view all feedback" on public.feedback for
select using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
                and profiles.role = 'admin'
        )
    );
-- Create a table for public profiles
create table profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text,
    full_name text,
    avatar_url text,
    billing_status text default 'free',
    stripe_customer_id text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for
select using (true);
create policy "Users can insert their own profile." on profiles for
insert with check (
        (
            select auth.uid()
        ) = id
    );
create policy "Users can update own profile." on profiles for
update using (
        (
            select auth.uid()
        ) = id
    );
-- Create a table for chatbots
create table chatbots (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) not null,
    name text not null,
    base_url text not null,
    theme_color text default '#000000',
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- RLS for chatbots
alter table chatbots enable row level security;
create policy "Users can view their own chatbots." on chatbots for
select using (
        (
            select auth.uid()
        ) = user_id
    );
create policy "Users can insert their own chatbots." on chatbots for
insert with check (
        (
            select auth.uid()
        ) = user_id
    );
create policy "Users can update their own chatbots." on chatbots for
update using (
        (
            select auth.uid()
        ) = user_id
    );
create policy "Users can delete their own chatbots." on chatbots for delete using (
    (
        select auth.uid()
    ) = user_id
);
-- Function to handle new user signup
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, email, full_name, avatar_url)
values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
return new;
end;
$$ language plpgsql security definer;
-- Trigger to call the function on new user creation
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- Create a table for training sources
create table training_sources (
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
create policy "Users can view training sources for their chatbots." on training_sources for
select using (
        chatbot_id in (
            select id
            from chatbots
            where user_id = auth.uid()
        )
    );
create policy "Service role can manage all training sources." on training_sources for all using (true);
-- Create a table for CSV data storage
create table csv_data (
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
create policy "Users can view CSV data for their chatbots." on csv_data for
select using (
        chatbot_id in (
            select id
            from chatbots
            where user_id = auth.uid()
        )
    );
create policy "Service role can manage all CSV data." on csv_data for all using (true);
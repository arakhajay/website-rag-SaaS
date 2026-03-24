-- Add status and error_message columns to training_sources
alter table training_sources
add column if not exists status text default 'pending',
add column if not exists error_message text;

-- Backfill existing sources as 'completed'
update training_sources set status = 'completed' where chunks_count > 0;

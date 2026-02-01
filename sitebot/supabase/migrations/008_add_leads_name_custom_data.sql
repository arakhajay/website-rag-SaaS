-- Add name and custom_data columns to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;
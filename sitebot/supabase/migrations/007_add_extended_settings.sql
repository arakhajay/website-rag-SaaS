-- Add new JSONB column for Usage and Security settings
ALTER TABLE chatbot_settings
ADD COLUMN IF NOT EXISTS usage_security JSONB DEFAULT '{}'::jsonb;
-- Add new JSONB column for User Form settings
ALTER TABLE chatbot_settings
ADD COLUMN IF NOT EXISTS user_form JSONB DEFAULT '{}'::jsonb;
-- Add new JSONB column for Working Hours settings
ALTER TABLE chatbot_settings
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}'::jsonb;
-- Update RLS policy to ensure access (usually covered by existing policy, but good to double check)
-- Existing policy "Modify settings" allows update on ALL columns so no change needed.
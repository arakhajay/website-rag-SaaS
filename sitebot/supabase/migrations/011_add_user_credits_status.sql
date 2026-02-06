-- Migration: 011_add_user_credits_status.sql
-- Purpose: Add credits, limits, and status columns to profiles for admin management
-- Add message credits column (monthly allowance)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS message_credits INTEGER DEFAULT 10000;
-- Add training character limit column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS training_char_limit INTEGER DEFAULT 400000;
-- Add user status column for ban/suspend functionality
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
-- Add check constraint for valid status values
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_status_check'
) THEN
ALTER TABLE profiles
ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'banned', 'suspended'));
END IF;
END $$;
-- Create admin audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        target_user_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for admin_audit_log (only super_admins can view)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can view audit log" ON admin_audit_log FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can insert audit log" ON admin_audit_log FOR
INSERT WITH CHECK (is_super_admin());
-- Index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_user_id);
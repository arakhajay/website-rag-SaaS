-- Migration: 013_admin_audit_log.sql
-- Purpose: Track all admin actions for security and compliance
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        admin_email TEXT,
        -- Denormalized for quick lookup
        action TEXT NOT NULL,
        -- 'update_credits', 'ban_user', 'change_plan', etc.
        target_type TEXT,
        -- 'user', 'chatbot', 'subscription', 'announcement', 'system'
        target_id UUID,
        target_email TEXT,
        -- For user targets, store email for readability
        details JSONB DEFAULT '{}',
        -- Additional context
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
);
-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_type ON admin_audit_log(target_type);
-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- Only super admins can view audit log
CREATE POLICY "Super admin can view audit log" ON admin_audit_log FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'super_admin'
        )
    );
-- Only super admins can insert (we'll use service role for actual inserts)
CREATE POLICY "Super admin can insert audit log" ON admin_audit_log FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'super_admin'
        )
    );
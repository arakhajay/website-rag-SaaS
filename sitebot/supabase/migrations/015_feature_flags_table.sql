-- Migration: 015_feature_flags_table.sql
-- Purpose: Feature flags for A/B testing and gradual rollouts
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    -- 'advanced_analytics', 'new_chat_ui', etc.
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    -- Global on/off
    enabled_plans TEXT [] DEFAULT '{}',
    -- Which plans have access (empty = use is_enabled)
    enabled_users UUID [] DEFAULT '{}',
    -- Specific users (for beta testing)
    percentage INTEGER DEFAULT 100,
    -- Rollout percentage (0-100)
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
);
-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);
-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
-- All authenticated users can view feature flags
CREATE POLICY "Users can view feature flags" ON feature_flags FOR
SELECT USING (true);
-- Only super admin can manage feature flags
CREATE POLICY "Super admin can manage feature flags" ON feature_flags FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'super_admin'
    )
);
-- Insert some default feature flags
INSERT INTO feature_flags (name, description, is_enabled, enabled_plans)
VALUES (
        'advanced_analytics',
        'Show advanced analytics charts',
        false,
        ARRAY ['pro', 'enterprise']
    ),
    (
        'ai_suggestions',
        'AI-powered response suggestions',
        false,
        ARRAY ['enterprise']
    ),
    (
        'custom_branding',
        'Allow custom widget branding',
        true,
        ARRAY ['pro', 'enterprise']
    ),
    (
        'api_access',
        'Enable API access for chatbots',
        false,
        ARRAY ['enterprise']
    ),
    (
        'multiple_chatbots',
        'Allow more than 1 chatbot',
        true,
        ARRAY ['pro', 'enterprise']
    ) ON CONFLICT (name) DO NOTHING;
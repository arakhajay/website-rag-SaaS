-- Migration: 014_announcements_table.sql
-- Purpose: Global announcements/banners shown to all users
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    -- 'info', 'warning', 'success', 'maintenance'
    link_url TEXT,
    -- Optional CTA link
    link_text TEXT,
    -- Optional CTA button text
    is_active BOOLEAN DEFAULT true,
    is_dismissible BOOLEAN DEFAULT true,
    -- Can users dismiss it?
    target_plans TEXT [] DEFAULT '{}',
    -- Empty = all plans, or ['free', 'pro']
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
);
-- Track which users dismissed which announcements
CREATE TABLE IF NOT EXISTS announcement_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(announcement_id, user_id)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_dismissals_user_id ON announcement_dismissals(user_id);
-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;
-- All authenticated users can view active announcements
CREATE POLICY "Users can view active announcements" ON announcements FOR
SELECT USING (
        is_active = true
        AND starts_at <= now()
        AND (
            ends_at IS NULL
            OR ends_at > now()
        )
    );
-- Super admin can manage announcements
CREATE POLICY "Super admin can manage announcements" ON announcements FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'super_admin'
    )
);
-- Users can manage their own dismissals
CREATE POLICY "Users can manage own dismissals" ON announcement_dismissals FOR ALL USING (auth.uid() = user_id);
-- Migration: Create integrations table
-- Stores which integrations are enabled per chatbot with platform-specific configuration
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (
        platform IN (
            'whatsapp',
            'slack',
            'telegram',
            'zapier',
            'wordpress',
            'discord',
            'messenger',
            'shopify',
            'hubspot'
        )
    ),
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    api_key TEXT,
    -- auto-generated API key for webhook auth (Zapier, etc.)
    webhook_url TEXT,
    -- platform-specific webhook URL
    status TEXT DEFAULT 'disconnected' CHECK (
        status IN ('connected', 'disconnected', 'error', 'pending')
    ),
    last_message_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(chatbot_id, platform)
);
-- Enable Row Level Security
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
-- RLS: Users can only see their own integrations
CREATE POLICY "Users can view own integrations" ON public.integrations FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own integrations" ON public.integrations FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integrations FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integrations FOR DELETE USING (auth.uid() = user_id);
-- Admin can see all integrations
CREATE POLICY "Admins can view all integrations" ON public.integrations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Index for fast lookups
CREATE INDEX idx_integrations_chatbot ON public.integrations(chatbot_id);
CREATE INDEX idx_integrations_user ON public.integrations(user_id);
CREATE INDEX idx_integrations_platform ON public.integrations(platform);
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_integrations_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_integrations_updated_at BEFORE
UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION update_integrations_updated_at();
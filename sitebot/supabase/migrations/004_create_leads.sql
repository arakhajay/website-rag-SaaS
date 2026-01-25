-- Leads Table
-- Migration: 004_create_leads.sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (
        status IN (
            'new',
            'contacted',
            'qualified',
            'converted',
            'lost'
        )
    ),
    remark TEXT,
    source TEXT DEFAULT 'widget',
    last_contact_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_chatbot ON leads(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage leads" ON leads FOR ALL USING (true) WITH CHECK (true);
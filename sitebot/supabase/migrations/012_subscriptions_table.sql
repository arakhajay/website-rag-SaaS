-- Migration: 012_subscriptions_table.sql
-- Purpose: Track user subscriptions and billing for revenue analytics
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    -- 'free', 'pro', 'enterprise'
    status TEXT NOT NULL DEFAULT 'active',
    -- 'active', 'cancelled', 'past_due', 'trialing'
    amount_cents INTEGER DEFAULT 0,
    -- Monthly amount in cents
    currency TEXT DEFAULT 'usd',
    interval TEXT DEFAULT 'month',
    -- 'month', 'year'
    started_at TIMESTAMPTZ DEFAULT now(),
    cancelled_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ DEFAULT now(),
    current_period_end TIMESTAMPTZ,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Add constraints
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('free', 'pro', 'enterprise'));
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_status_check CHECK (
        status IN (
            'active',
            'cancelled',
            'past_due',
            'trialing',
            'incomplete'
        )
    );
-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions FOR
SELECT USING (auth.uid() = user_id);
-- Super admin can view all subscriptions
CREATE POLICY "Super admin can view all subscriptions" ON subscriptions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'super_admin'
        )
    );
-- Super admin can manage all subscriptions
CREATE POLICY "Super admin can manage all subscriptions" ON subscriptions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'super_admin'
    )
);
-- Create default free subscription for existing users
INSERT INTO subscriptions (user_id, plan, status, amount_cents)
SELECT id,
    'free',
    'active',
    0
FROM profiles
WHERE id NOT IN (
        SELECT user_id
        FROM subscriptions
    );
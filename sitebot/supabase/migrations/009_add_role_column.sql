-- Migration: 009_add_role_column.sql
-- Purpose: Add role column to profiles for super_admin access control
-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
-- Add check constraint for valid roles
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
) THEN
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'super_admin'));
END IF;
END $$;
-- Add index for role lookups (useful for admin queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
-- Set the super admin user
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'zivoxagent@gmail.com';
-- Migration: 010_admin_rls_policies.sql
-- Purpose: Create RLS policies allowing super_admin users full access to all tables
-- Helper function to check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
-- ============================================
-- PROFILES TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all profiles" ON profiles FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all profiles" ON profiles FOR
UPDATE USING (is_super_admin());
-- ============================================
-- CHATBOTS TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all chatbots" ON chatbots FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all chatbots" ON chatbots FOR
UPDATE USING (is_super_admin());
CREATE POLICY "Super admin can delete all chatbots" ON chatbots FOR DELETE USING (is_super_admin());
-- ============================================
-- CHAT_SESSIONS TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all chat_sessions" ON chat_sessions FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all chat_sessions" ON chat_sessions FOR
UPDATE USING (is_super_admin());
CREATE POLICY "Super admin can delete all chat_sessions" ON chat_sessions FOR DELETE USING (is_super_admin());
-- ============================================
-- CHAT_MESSAGES TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all chat_messages" ON chat_messages FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all chat_messages" ON chat_messages FOR
UPDATE USING (is_super_admin());
CREATE POLICY "Super admin can delete all chat_messages" ON chat_messages FOR DELETE USING (is_super_admin());
-- ============================================
-- LEADS TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all leads" ON leads FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all leads" ON leads FOR
UPDATE USING (is_super_admin());
CREATE POLICY "Super admin can delete all leads" ON leads FOR DELETE USING (is_super_admin());
-- ============================================
-- TRAINING_SOURCES TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all training_sources" ON training_sources FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all training_sources" ON training_sources FOR
UPDATE USING (is_super_admin());
CREATE POLICY "Super admin can delete all training_sources" ON training_sources FOR DELETE USING (is_super_admin());
-- ============================================
-- CSV_DATA TABLE: Super admin policies
-- ============================================
CREATE POLICY "Super admin can view all csv_data" ON csv_data FOR
SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all csv_data" ON csv_data FOR
UPDATE USING (is_super_admin());
CREATE POLICY "Super admin can delete all csv_data" ON csv_data FOR DELETE USING (is_super_admin());
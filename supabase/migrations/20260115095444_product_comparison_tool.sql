-- =====================================================================================
-- Migration: Product Comparison Tool System
-- Description: Creates tables and functions for product comparison functionality
-- Version: 1.0
-- =====================================================================================

-- Create product_comparison_sessions table
CREATE TABLE IF NOT EXISTS public.product_comparison_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name TEXT,
    product_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comparison_sessions_user_id 
    ON public.product_comparison_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_sessions_created_at 
    ON public.product_comparison_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.product_comparison_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_comparison_sessions
CREATE POLICY "users_manage_own_comparison_sessions"
    ON public.product_comparison_sessions
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow anonymous users to read comparison sessions they created in the same session
CREATE POLICY "anonymous_users_manage_comparison_sessions"
    ON public.product_comparison_sessions
    FOR ALL
    USING (user_id IS NULL)
    WITH CHECK (user_id IS NULL);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_comparison_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at
CREATE TRIGGER trigger_comparison_session_updated_at
    BEFORE UPDATE ON public.product_comparison_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_comparison_session_updated_at();

-- Function to clean up old comparison sessions (keep only last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_comparison_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.product_comparison_sessions
    WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days')
    AND is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_comparison_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_comparison_sessions TO anon;

-- =====================================================================================
-- End of Migration
-- =====================================================================================
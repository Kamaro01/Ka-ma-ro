-- Location: supabase/migrations/20260115094210_password_reset_system.sql
-- Schema Analysis: Existing user_profiles table, customer_preferences table
-- Integration Type: Addition (password reset tokens) + Extension (privacy controls)
-- Dependencies: public.user_profiles

-- 🆕 NEW MODULE: Password Reset Token System
CREATE TABLE public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Enable RLS for password reset tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own password reset tokens
CREATE POLICY "users_view_own_password_reset_tokens"
ON public.password_reset_tokens
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can manage all tokens (using auth metadata)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE POLICY "admin_manage_password_reset_tokens"
ON public.password_reset_tokens
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 🔄 PARTIAL_EXISTS: Extend customer_preferences with privacy controls
ALTER TABLE public.customer_preferences
ADD COLUMN IF NOT EXISTS email_marketing_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS data_sharing_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS account_activity_alerts BOOLEAN DEFAULT true;

-- Add index for privacy settings queries
CREATE INDEX IF NOT EXISTS idx_customer_preferences_privacy ON public.customer_preferences(profile_visibility, email_marketing_enabled);

-- Function to validate password reset token
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(reset_token TEXT)
RETURNS TABLE(
    is_valid BOOLEAN,
    user_id UUID,
    email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_record RECORD;
BEGIN
    -- Find the token
    SELECT 
        prt.id,
        prt.user_id,
        prt.expires_at,
        prt.used_at,
        up.email
    INTO token_record
    FROM public.password_reset_tokens prt
    JOIN public.user_profiles up ON prt.user_id = up.id
    WHERE prt.token = reset_token;

    -- Check if token exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    -- Check if token is expired
    IF token_record.expires_at < NOW() THEN
        RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    -- Check if token was already used
    IF token_record.used_at IS NOT NULL THEN
        RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    -- Token is valid
    RETURN QUERY SELECT 
        true::BOOLEAN, 
        token_record.user_id, 
        token_record.email;
END;
$$;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION public.mark_password_reset_token_used(reset_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.password_reset_tokens
    SET used_at = NOW()
    WHERE token = reset_token
    AND used_at IS NULL
    AND expires_at > NOW();

    RETURN FOUND;
END;
$$;

-- Function to create password reset token
CREATE OR REPLACE FUNCTION public.create_password_reset_token(
    user_email TEXT,
    client_ip TEXT DEFAULT NULL,
    client_user_agent TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
    reset_token TEXT;
    token_expiry TIMESTAMPTZ;
BEGIN
    -- Find user by email
    SELECT id INTO user_uuid
    FROM public.user_profiles
    WHERE email = user_email;

    -- If user not found, return empty string (don't reveal if email exists)
    IF user_uuid IS NULL THEN
        RETURN '';
    END IF;

    -- Generate random token (using encode with random bytes)
    reset_token := encode(gen_random_bytes(32), 'base64');
    
    -- Token expires in 15 minutes
    token_expiry := NOW() + INTERVAL '15 minutes';

    -- Insert token
    INSERT INTO public.password_reset_tokens (
        user_id,
        token,
        expires_at,
        ip_address,
        user_agent
    ) VALUES (
        user_uuid,
        reset_token,
        token_expiry,
        client_ip,
        client_user_agent
    );

    RETURN reset_token;
END;
$$;

-- Function to clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_reset_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.password_reset_tokens
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Trigger to automatically update updated_at on customer_preferences
CREATE OR REPLACE FUNCTION public.update_customer_preferences_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_customer_preferences_updated_at ON public.customer_preferences;
CREATE TRIGGER update_customer_preferences_updated_at
BEFORE UPDATE ON public.customer_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_preferences_timestamp();
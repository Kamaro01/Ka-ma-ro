-- Location: supabase/migrations/20260115065511_admin_authentication_system.sql
-- Schema Analysis: Existing user_profiles table, auth.users integration
-- Integration Type: Extension - Adding role-based access and admin features
-- Dependencies: user_profiles (existing), auth.users

-- 1. TYPES: Add role enum
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin');

-- 2. MODIFY EXISTING TABLE: Add role column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN role public.user_role DEFAULT 'customer'::public.user_role NOT NULL;

-- Add index for role-based queries
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- 3. CREATE ADMIN AUDIT LOG TABLE
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for audit log queries
CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_action ON public.admin_audit_logs(action);

-- 4. CREATE ADMIN SESSION TRACKING TABLE
CREATE TABLE public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for session management
CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- 5. ENABLE RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- 6. FUNCTIONS (MUST BE BEFORE RLS POLICIES)

-- Function to check if user is admin (queries auth.users metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'super_admin')
);
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = 'super_admin'
);
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_logs (
        admin_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        auth.uid(),
        p_action,
        p_resource_type,
        p_resource_id,
        p_details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 7. RLS POLICIES

-- Update user_profiles policy to allow admins to view all profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- Customer can manage their own profile
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can view all user profiles
CREATE POLICY "admins_view_all_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only super admins can modify roles
CREATE POLICY "super_admins_update_roles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Admin audit logs policies
CREATE POLICY "admins_view_own_audit_logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (admin_id = auth.uid() AND public.is_admin());

CREATE POLICY "super_admins_view_all_audit_logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "admins_create_audit_logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (admin_id = auth.uid() AND public.is_admin());

-- Admin sessions policies
CREATE POLICY "admins_manage_own_sessions"
ON public.admin_sessions
FOR ALL
TO authenticated
USING (admin_id = auth.uid() AND public.is_admin())
WITH CHECK (admin_id = auth.uid() AND public.is_admin());

-- 8. TRIGGERS

-- Trigger to update user_profiles timestamp
CREATE TRIGGER set_user_profiles_updated_at_with_role
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 9. MOCK DATA - Create test admin users
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    customer_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@kamaro.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Ka-ma-ro Admin", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (customer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'customer@kamaro.com', crypt('customer123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Ka-ma-ro Customer", "role": "customer"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Update user_profiles with roles
    UPDATE public.user_profiles 
    SET role = 'admin'::public.user_role 
    WHERE id = admin_uuid;

    UPDATE public.user_profiles 
    SET role = 'customer'::public.user_role 
    WHERE id = customer_uuid;

    -- Create sample audit log
    INSERT INTO public.admin_audit_logs (admin_id, action, details)
    VALUES (admin_uuid, 'ADMIN_LOGIN', '{"message": "Initial admin login"}'::jsonb);
END $$;
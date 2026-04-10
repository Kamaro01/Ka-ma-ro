-- Location: supabase/migrations/20260114125400_rwanda_business_settings.sql
-- Schema Analysis: Existing tables include orders, user_profiles, products
-- Integration Type: Addition of business settings and address system
-- Dependencies: user_profiles

-- 1. Types for Rwanda-specific features
CREATE TYPE public.language_code AS ENUM ('en', 'rw', 'fr');
CREATE TYPE public.payment_type AS ENUM ('advance_payment', 'full_payment', 'mtn', 'airtel', 'bk', 'equity', 'im', 'bpr', 'kcb');

-- 2. Business settings table for store configuration
CREATE TABLE public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL,
    primary_language public.language_code DEFAULT 'en'::public.language_code,
    business_hours_start TIME NOT NULL DEFAULT '09:00:00',
    business_hours_end TIME NOT NULL DEFAULT '18:00:00',
    support_email TEXT NOT NULL,
    support_whatsapp TEXT,
    allow_cash_on_delivery BOOLEAN DEFAULT false,
    require_advance_payment BOOLEAN DEFAULT true,
    advance_payment_percentage NUMERIC(5,2) DEFAULT 30.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rwanda address system table
CREATE TABLE public.rwanda_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    sector TEXT NOT NULL,
    cell TEXT NOT NULL,
    village TEXT,
    street_address TEXT,
    phone_number TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customer preferences and engagement tracking
CREATE TABLE public.customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    preferred_language public.language_code DEFAULT 'en'::public.language_code,
    preferred_contact_method TEXT,
    notification_preferences JSONB DEFAULT '{}'::JSONB,
    browsing_history JSONB DEFAULT '[]'::JSONB,
    engagement_score INTEGER DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 5. AI-powered recommendations table
CREATE TABLE public.product_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    relevance_score NUMERIC(3,2),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Digital consultation bookings
CREATE TABLE public.consultation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    consultation_type TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Essential Indexes
CREATE INDEX idx_rwanda_addresses_user_id ON public.rwanda_addresses(user_id);
CREATE INDEX idx_customer_preferences_user_id ON public.customer_preferences(user_id);
CREATE INDEX idx_product_recommendations_user_id ON public.product_recommendations(user_id);
CREATE INDEX idx_consultation_bookings_user_id ON public.consultation_bookings(user_id);
CREATE INDEX idx_consultation_bookings_date ON public.consultation_bookings(booking_date);

-- 8. Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rwanda_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Business settings - public read, authenticated write
CREATE POLICY "public_can_read_business_settings"
ON public.business_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_can_update_business_settings"
ON public.business_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Rwanda addresses - users manage own addresses
CREATE POLICY "users_manage_own_rwanda_addresses"
ON public.rwanda_addresses
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Customer preferences - users manage own preferences
CREATE POLICY "users_manage_own_customer_preferences"
ON public.customer_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Product recommendations - users view own recommendations
CREATE POLICY "users_view_own_product_recommendations"
ON public.product_recommendations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Consultation bookings - users manage own bookings
CREATE POLICY "users_manage_own_consultation_bookings"
ON public.consultation_bookings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. Triggers for updated_at
CREATE TRIGGER set_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_rwanda_addresses_updated_at
BEFORE UPDATE ON public.rwanda_addresses
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_customer_preferences_updated_at
BEFORE UPDATE ON public.customer_preferences
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_consultation_bookings_updated_at
BEFORE UPDATE ON public.consultation_bookings
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 11. Mock Data
DO $$
DECLARE
    settings_id UUID := gen_random_uuid();
    existing_user_id UUID;
    existing_product_id UUID;
BEGIN
    -- Insert business settings
    INSERT INTO public.business_settings (
        id,
        store_name,
        primary_language,
        business_hours_start,
        business_hours_end,
        support_email,
        support_whatsapp,
        allow_cash_on_delivery,
        require_advance_payment,
        advance_payment_percentage
    ) VALUES (
        settings_id,
        'Ka-ma-ro Electronics',
        'en'::public.language_code,
        '09:00:00',
        '18:00:00',
        'Kamarofisto@gmail.com',
        '+250788000000',
        false,
        true,
        30.00
    );

    -- Get existing user and product IDs
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_product_id FROM public.products LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
        -- Insert sample Rwanda address
        INSERT INTO public.rwanda_addresses (
            user_id,
            province,
            district,
            sector,
            cell,
            village,
            street_address,
            phone_number,
            is_default
        ) VALUES (
            existing_user_id,
            'Kigali City',
            'Gasabo',
            'Remera',
            'Rukiri I',
            'Amahoro',
            'KG 123 St',
            '+250788123456',
            true
        );

        -- Insert customer preferences
        INSERT INTO public.customer_preferences (
            user_id,
            preferred_language,
            preferred_contact_method,
            notification_preferences,
            engagement_score,
            loyalty_points
        ) VALUES (
            existing_user_id,
            'en'::public.language_code,
            'whatsapp',
            '{"email": true, "sms": true, "whatsapp": true}'::JSONB,
            85,
            150
        );

        IF existing_product_id IS NOT NULL THEN
            -- Insert product recommendation
            INSERT INTO public.product_recommendations (
                user_id,
                product_id,
                recommendation_type,
                relevance_score,
                reason
            ) VALUES (
                existing_user_id,
                existing_product_id,
                'browsing_history',
                0.95,
                'Based on your recent viewing of similar products'
            );

            -- Insert consultation booking
            INSERT INTO public.consultation_bookings (
                user_id,
                booking_date,
                booking_time,
                consultation_type,
                product_id,
                status,
                notes
            ) VALUES (
                existing_user_id,
                CURRENT_DATE + INTERVAL '2 days',
                '14:00:00',
                'product_demo',
                existing_product_id,
                'pending',
                'Need help understanding product features'
            );
        END IF;
    END IF;
END $$;
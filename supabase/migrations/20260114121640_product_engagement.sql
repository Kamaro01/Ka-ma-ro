-- Location: supabase/migrations/20260114121640_product_engagement.sql
-- Schema Analysis: Existing tables - products, orders, product_reviews, user_profiles
-- Integration Type: Addition - Product likes tracking and coming soon products
-- Dependencies: products, user_profiles

-- ============================================================================
-- 1. ADD COMING SOON SUPPORT TO PRODUCTS
-- ============================================================================

-- Add coming_soon field to existing products table
ALTER TABLE public.products
ADD COLUMN coming_soon BOOLEAN DEFAULT false;

-- Add index for filtering coming soon products
CREATE INDEX idx_products_coming_soon ON public.products(coming_soon) WHERE coming_soon = true;

-- Add launch_date for coming soon products
ALTER TABLE public.products
ADD COLUMN launch_date TIMESTAMPTZ;

-- ============================================================================
-- 2. CREATE PRODUCT LIKES TABLE
-- ============================================================================

CREATE TABLE public.product_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
);

-- Add indexes for product likes
CREATE INDEX idx_product_likes_product_id ON public.product_likes(product_id);
CREATE INDEX idx_product_likes_user_id ON public.product_likes(user_id);
CREATE INDEX idx_product_likes_created_at ON public.product_likes(created_at DESC);

-- ============================================================================
-- 3. ADD LIKE COUNT TO PRODUCTS TABLE
-- ============================================================================

ALTER TABLE public.products
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create index for sorting by likes
CREATE INDEX idx_products_likes_count ON public.products(likes_count DESC);

-- ============================================================================
-- 4. CREATE FUNCTION TO UPDATE PRODUCT LIKES COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_product_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.products
        SET likes_count = likes_count + 1
        WHERE id = NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.products
        SET likes_count = GREATEST(0, likes_count - 1)
        WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC LIKE COUNT UPDATE
-- ============================================================================

CREATE TRIGGER trigger_update_likes_count_on_insert
AFTER INSERT ON public.product_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_product_likes_count();

CREATE TRIGGER trigger_update_likes_count_on_delete
AFTER DELETE ON public.product_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_product_likes_count();

-- ============================================================================
-- 6. ENABLE RLS ON PRODUCT LIKES TABLE
-- ============================================================================

ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS POLICIES FOR PRODUCT LIKES
-- ============================================================================

-- Public can view all likes (for like counts)
CREATE POLICY "public_can_view_product_likes"
ON public.product_likes
FOR SELECT
TO public
USING (true);

-- Authenticated users can manage their own likes
CREATE POLICY "users_manage_own_likes"
ON public.product_likes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 8. MOCK DATA FOR TESTING
-- ============================================================================

DO $$
DECLARE
    product1_id UUID;
    product2_id UUID;
    product3_id UUID;
    user1_id UUID;
    user2_id UUID;
BEGIN
    -- Get some existing product IDs
    SELECT id INTO product1_id FROM public.products WHERE name ILIKE '%iPhone%' LIMIT 1;
    SELECT id INTO product2_id FROM public.products WHERE name ILIKE '%AirPods%' LIMIT 1;
    SELECT id INTO product3_id FROM public.products ORDER BY created_at DESC LIMIT 1 OFFSET 2;
    
    -- Get some existing user IDs
    SELECT id INTO user1_id FROM public.user_profiles ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.user_profiles ORDER BY created_at LIMIT 1 OFFSET 1;

    -- Mark some products as coming soon (if products exist)
    IF product3_id IS NOT NULL THEN
        UPDATE public.products
        SET coming_soon = true,
            launch_date = NOW() + INTERVAL '30 days'
        WHERE id = product3_id;
    END IF;

    -- Add some product likes (if users and products exist)
    IF product1_id IS NOT NULL AND user1_id IS NOT NULL THEN
        INSERT INTO public.product_likes (product_id, user_id)
        VALUES
            (product1_id, user1_id)
        ON CONFLICT (product_id, user_id) DO NOTHING;
    END IF;

    IF product2_id IS NOT NULL AND user2_id IS NOT NULL THEN
        INSERT INTO public.product_likes (product_id, user_id)
        VALUES
            (product2_id, user2_id)
        ON CONFLICT (product_id, user_id) DO NOTHING;
    END IF;

END $$;
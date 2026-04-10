-- Location: supabase/migrations/20260114113300_wishlist_management.sql
-- Schema Analysis: Existing e-commerce schema with products, user_profiles, orders, and reviews
-- Integration Type: New wishlist feature extending existing product functionality
-- Dependencies: products, user_profiles tables

-- Create wishlist_items table for storing user wishlists
CREATE TABLE public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlist_categories table for organizing wishlist items
CREATE TABLE public.wishlist_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for wishlist item categorization
CREATE TABLE public.wishlist_item_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_item_id UUID REFERENCES public.wishlist_items(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.wishlist_categories(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create price_alerts table for price drop notifications
CREATE TABLE public.price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_item_id UUID REFERENCES public.wishlist_items(id) ON DELETE CASCADE NOT NULL,
    target_price NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE INDEX idx_wishlist_items_added_at ON public.wishlist_items(added_at DESC);
CREATE INDEX idx_wishlist_categories_user_id ON public.wishlist_categories(user_id);
CREATE INDEX idx_wishlist_item_categories_item_id ON public.wishlist_item_categories(wishlist_item_id);
CREATE INDEX idx_wishlist_item_categories_category_id ON public.wishlist_item_categories(category_id);
CREATE INDEX idx_price_alerts_wishlist_item_id ON public.price_alerts(wishlist_item_id);
CREATE INDEX idx_price_alerts_is_active ON public.price_alerts(is_active);

-- Create unique constraint to prevent duplicate wishlist items per user
CREATE UNIQUE INDEX idx_wishlist_items_user_product ON public.wishlist_items(user_id, product_id);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist_items (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_wishlist_items"
ON public.wishlist_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for wishlist_categories (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_wishlist_categories"
ON public.wishlist_categories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for wishlist_item_categories (Pattern 7: Complex Relationships)
CREATE OR REPLACE FUNCTION public.can_access_wishlist_item_category(item_category_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.wishlist_item_categories wic
    JOIN public.wishlist_items wi ON wic.wishlist_item_id = wi.id
    WHERE wic.id = item_category_id AND wi.user_id = auth.uid()
)
$$;

CREATE POLICY "users_manage_own_wishlist_item_categories"
ON public.wishlist_item_categories
FOR ALL
TO authenticated
USING (public.can_access_wishlist_item_category(id))
WITH CHECK (public.can_access_wishlist_item_category(id));

-- RLS Policies for price_alerts (Pattern 7: Complex Relationships)
CREATE OR REPLACE FUNCTION public.can_access_price_alert(alert_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.price_alerts pa
    JOIN public.wishlist_items wi ON pa.wishlist_item_id = wi.id
    WHERE pa.id = alert_id AND wi.user_id = auth.uid()
)
$$;

CREATE POLICY "users_manage_own_price_alerts"
ON public.price_alerts
FOR ALL
TO authenticated
USING (public.can_access_price_alert(id))
WITH CHECK (public.can_access_price_alert(id));

-- Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_wishlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER set_wishlist_items_updated_at
    BEFORE UPDATE ON public.wishlist_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_wishlist_updated_at();

CREATE TRIGGER set_wishlist_categories_updated_at
    BEFORE UPDATE ON public.wishlist_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_wishlist_updated_at();

CREATE TRIGGER set_price_alerts_updated_at
    BEFORE UPDATE ON public.price_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_wishlist_updated_at();

-- Mock data for wishlist functionality
DO $$
DECLARE
    existing_user_id UUID;
    existing_product_id_1 UUID;
    existing_product_id_2 UUID;
    existing_product_id_3 UUID;
    wishlist_item_id_1 UUID := gen_random_uuid();
    wishlist_item_id_2 UUID := gen_random_uuid();
    wishlist_item_id_3 UUID := gen_random_uuid();
    category_id_1 UUID := gen_random_uuid();
    category_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Get existing product IDs
    SELECT id INTO existing_product_id_1 FROM public.products WHERE is_active = true LIMIT 1 OFFSET 0;
    SELECT id INTO existing_product_id_2 FROM public.products WHERE is_active = true LIMIT 1 OFFSET 1;
    SELECT id INTO existing_product_id_3 FROM public.products WHERE is_active = true LIMIT 1 OFFSET 2;
    
    -- Only create mock data if we have existing users and products
    IF existing_user_id IS NOT NULL AND existing_product_id_1 IS NOT NULL THEN
        -- Create wishlist items
        INSERT INTO public.wishlist_items (id, user_id, product_id, notes, priority)
        VALUES 
            (wishlist_item_id_1, existing_user_id, existing_product_id_1, 'Birthday gift for sister', 5),
            (wishlist_item_id_2, existing_user_id, existing_product_id_2, 'Wait for sale', 3);
        
        -- Add third item if we have a third product
        IF existing_product_id_3 IS NOT NULL THEN
            INSERT INTO public.wishlist_items (id, user_id, product_id, notes, priority)
            VALUES (wishlist_item_id_3, existing_user_id, existing_product_id_3, 'Christmas list', 4);
        END IF;
        
        -- Create wishlist categories
        INSERT INTO public.wishlist_categories (id, user_id, name, description)
        VALUES 
            (category_id_1, existing_user_id, 'Gift Ideas', 'Items to gift to family and friends'),
            (category_id_2, existing_user_id, 'Future Purchases', 'Items I want to buy later');
        
        -- Categorize wishlist items
        INSERT INTO public.wishlist_item_categories (wishlist_item_id, category_id)
        VALUES 
            (wishlist_item_id_1, category_id_1),
            (wishlist_item_id_2, category_id_2);
        
        IF existing_product_id_3 IS NOT NULL THEN
            INSERT INTO public.wishlist_item_categories (wishlist_item_id, category_id)
            VALUES (wishlist_item_id_3, category_id_1);
        END IF;
        
        -- Create price alerts
        INSERT INTO public.price_alerts (wishlist_item_id, target_price, is_active)
        VALUES 
            (wishlist_item_id_2, 75.00, true);
    ELSE
        RAISE NOTICE 'No existing users or products found. Skipping wishlist mock data creation.';
    END IF;
END $$;
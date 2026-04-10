-- Location: supabase/migrations/20260410194712_seed_products_and_fix_auth.sql
-- Purpose: Seed real Ka-ma-ro product data, fix auth trigger, enable public product access
-- Dependencies: user_profiles, products, categories, product_categories tables

-- ============================================================
-- 1. FIX AUTH TRIGGER - Ensure user_profiles is created on signup
-- ============================================================

-- Drop and recreate the handle_new_user trigger function to be robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        phone,
        role,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'handle_new_user error: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. FIX RLS POLICIES - Allow public read access to products & categories
-- ============================================================

-- Products: public read, authenticated write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_products" ON public.products;
CREATE POLICY "admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Categories: public read
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_categories" ON public.categories;
CREATE POLICY "admins_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Product categories junction: public read
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_categories" ON public.product_categories;
CREATE POLICY "public_read_product_categories"
ON public.product_categories
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admins_manage_product_categories" ON public.product_categories;
CREATE POLICY "admins_manage_product_categories"
ON public.product_categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 3. ADD MISSING COLUMNS IF NOT EXISTS
-- ============================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS launch_date TIMESTAMPTZ;

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0;

-- ============================================================
-- 4. SEED CATEGORIES
-- ============================================================

DO $$
DECLARE
    cat_electronics UUID := gen_random_uuid();
    cat_fashion UUID := gen_random_uuid();
    cat_home UUID := gen_random_uuid();
    cat_beauty UUID := gen_random_uuid();
    cat_sports UUID := gen_random_uuid();
    cat_food UUID := gen_random_uuid();

    -- Product UUIDs
    p1 UUID := gen_random_uuid();
    p2 UUID := gen_random_uuid();
    p3 UUID := gen_random_uuid();
    p4 UUID := gen_random_uuid();
    p5 UUID := gen_random_uuid();
    p6 UUID := gen_random_uuid();
    p7 UUID := gen_random_uuid();
    p8 UUID := gen_random_uuid();
    p9 UUID := gen_random_uuid();
    p10 UUID := gen_random_uuid();
    p11 UUID := gen_random_uuid();
    p12 UUID := gen_random_uuid();
    p13 UUID := gen_random_uuid();
    p14 UUID := gen_random_uuid();
    p15 UUID := gen_random_uuid();
    p16 UUID := gen_random_uuid();
    p17 UUID := gen_random_uuid();
    p18 UUID := gen_random_uuid();

BEGIN

    -- Insert categories
    INSERT INTO public.categories (id, name, slug, description, is_active, display_order, featured_image, featured_image_alt, product_count)
    VALUES
        (cat_electronics, 'Electronics', 'electronics', 'Smartphones, laptops, accessories and more', true, 1,
         'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 'Electronics and gadgets display', 6),
        (cat_fashion, 'Fashion & Clothing', 'fashion', 'Trendy clothing, shoes and accessories for men and women', true, 2,
         'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'Fashion clothing collection', 4),
        (cat_home, 'Home & Living', 'home-living', 'Furniture, decor and household essentials', true, 3,
         'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400', 'Modern home interior design', 3),
        (cat_beauty, 'Beauty & Personal Care', 'beauty', 'Skincare, haircare and wellness products', true, 4,
         'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'Beauty and skincare products', 3),
        (cat_sports, 'Sports & Fitness', 'sports', 'Equipment and gear for active lifestyles', true, 5,
         'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', 'Sports and fitness equipment', 2),
        (cat_food, 'Food & Beverages', 'food', 'Local and imported food products', true, 6,
         'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400', 'Fresh food and beverages', 2)
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        display_order = EXCLUDED.display_order,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        product_count = EXCLUDED.product_count;

    -- Re-fetch category IDs after potential conflict resolution
    SELECT id INTO cat_electronics FROM public.categories WHERE slug = 'electronics' LIMIT 1;
    SELECT id INTO cat_fashion FROM public.categories WHERE slug = 'fashion' LIMIT 1;
    SELECT id INTO cat_home FROM public.categories WHERE slug = 'home-living' LIMIT 1;
    SELECT id INTO cat_beauty FROM public.categories WHERE slug = 'beauty' LIMIT 1;
    SELECT id INTO cat_sports FROM public.categories WHERE slug = 'sports' LIMIT 1;
    SELECT id INTO cat_food FROM public.categories WHERE slug = 'food' LIMIT 1;

    -- ============================================================
    -- 5. SEED PRODUCTS - Real Ka-ma-ro store products
    -- ============================================================

    INSERT INTO public.products (
        id, sku, name, description, price, cost_price, category,
        image_url, image_alt, current_stock, minimum_stock, maximum_stock,
        reorder_point, stock_status, is_active, average_rating, review_count
    ) VALUES
        -- ELECTRONICS
        (p1, 'KMR-ELEC-001', 'Samsung Galaxy A54 5G',
         'Powerful 5G smartphone with 6.4-inch Super AMOLED display, 50MP triple camera, 5000mAh battery. Perfect for work and entertainment.',
         450000, 380000, 'Electronics',
         'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
         'Samsung Galaxy A54 5G smartphone in black color', 25, 5, 100, 10, 'in_stock', true, 4.5, 23),

        (p2, 'KMR-ELEC-002', 'Apple AirPods Pro (2nd Gen)',
         'Premium wireless earbuds with Active Noise Cancellation, Transparency mode, Adaptive Audio, and up to 30 hours battery life.',
         180000, 150000, 'Electronics',
         'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
         'Apple AirPods Pro second generation in white charging case', 40, 10, 200, 20, 'in_stock', true, 4.8, 45),

        (p3, 'KMR-ELEC-003', 'Lenovo IdeaPad Slim 3 Laptop',
         '15.6-inch Full HD laptop with Intel Core i5, 8GB RAM, 512GB SSD. Ideal for students and professionals.',
         750000, 620000, 'Electronics',
         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
         'Lenovo IdeaPad Slim 3 laptop open showing screen', 12, 3, 50, 5, 'in_stock', true, 4.3, 18),

        (p4, 'KMR-ELEC-004', 'Xiaomi Redmi Note 12 Pro',
         'Feature-packed smartphone with 200MP camera, 120Hz AMOLED display, 67W fast charging. Great value for money.',
         280000, 230000, 'Electronics',
         'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
         'Xiaomi Redmi Note 12 Pro smartphone showing camera system', 35, 8, 150, 15, 'in_stock', true, 4.4, 31),

        (p5, 'KMR-ELEC-005', 'JBL Charge 5 Bluetooth Speaker',
         'Portable waterproof speaker with 20 hours playtime, powerful bass, and built-in power bank. Perfect for outdoor adventures.',
         95000, 78000, 'Electronics',
         'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
         'JBL Charge 5 portable Bluetooth speaker in blue color', 50, 10, 200, 20, 'in_stock', true, 4.6, 52),

        (p6, 'KMR-ELEC-006', 'Smart LED TV 43 inch',
         '43-inch 4K Ultra HD Smart TV with Android OS, built-in WiFi, Netflix, YouTube. Transform your living room.',
         380000, 310000, 'Electronics',
         'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400',
         '43 inch Smart LED TV mounted on wall showing 4K content', 8, 2, 30, 4, 'in_stock', true, 4.2, 15),

        -- FASHION
        (p7, 'KMR-FASH-001', 'Men''s Classic Polo Shirt',
         'Premium cotton polo shirt available in multiple colors. Comfortable, breathable fabric perfect for casual and semi-formal occasions.',
         25000, 15000, 'Fashion',
         'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400',
         'Men classic polo shirt in navy blue color', 100, 20, 500, 40, 'in_stock', true, 4.1, 67),

        (p8, 'KMR-FASH-002', 'Women''s Ankara Print Dress',
         'Beautiful African print dress made from high-quality Ankara fabric. Vibrant colors, elegant design for special occasions.',
         45000, 28000, 'Fashion',
         'https://images.unsplash.com/photo-1594938298603-c8148c4b4f6c?w=400',
         'Women wearing colorful Ankara print dress with traditional African patterns', 60, 10, 200, 20, 'in_stock', true, 4.7, 89),

        (p9, 'KMR-FASH-003', 'Nike Air Max 270 Sneakers',
         'Iconic Nike Air Max 270 with large Air unit for all-day comfort. Stylish design for everyday wear.',
         120000, 95000, 'Fashion',
         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
         'Nike Air Max 270 sneakers in white and black colorway', 45, 10, 150, 20, 'in_stock', true, 4.5, 43),

        (p10, 'KMR-FASH-004', 'Leather Handbag - Premium',
         'Genuine leather handbag with multiple compartments, adjustable strap. Elegant and practical for daily use.',
         85000, 60000, 'Fashion',
         'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
         'Brown genuine leather handbag with gold hardware and adjustable strap', 30, 5, 100, 10, 'in_stock', true, 4.6, 34),

        -- HOME & LIVING
        (p11, 'KMR-HOME-001', 'Nespresso Coffee Machine',
         'Compact espresso machine with 19-bar pressure, fast heat-up time, and compatible with all Nespresso capsules.',
         185000, 145000, 'Home',
         'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
         'Nespresso coffee machine making espresso with steam', 20, 5, 80, 10, 'in_stock', true, 4.4, 28),

        (p12, 'KMR-HOME-002', 'Decorative Throw Pillows Set',
         'Set of 4 premium throw pillows with removable covers. Modern geometric patterns to elevate your living space.',
         35000, 22000, 'Home',
         'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
         'Set of colorful decorative throw pillows on modern sofa', 75, 15, 300, 30, 'in_stock', true, 4.3, 41),

        (p13, 'KMR-HOME-003', 'Stainless Steel Cookware Set',
         '10-piece stainless steel cookware set with glass lids. Induction compatible, dishwasher safe, professional quality.',
         125000, 95000, 'Home',
         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
         'Stainless steel cookware set with pots and pans on kitchen counter', 18, 4, 60, 8, 'in_stock', true, 4.5, 22),

        -- BEAUTY
        (p14, 'KMR-BEAU-001', 'Neutrogena Skincare Bundle',
         'Complete skincare routine: cleanser, toner, moisturizer, and SPF 50 sunscreen. Dermatologist recommended.',
         55000, 38000, 'Beauty',
         'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
         'Neutrogena skincare products arranged on white background', 80, 15, 300, 30, 'in_stock', true, 4.6, 76),

        (p15, 'KMR-BEAU-002', 'Professional Hair Dryer 2200W',
         'Ionic technology hair dryer with 3 heat settings, 2 speed settings, cool shot button. Reduces frizz and adds shine.',
         65000, 48000, 'Beauty',
         'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
         'Professional hair dryer in rose gold color with diffuser attachment', 35, 8, 120, 15, 'in_stock', true, 4.4, 38),

        (p16, 'KMR-BEAU-003', 'Perfume Gift Set - Luxury',
         'Exclusive collection of 3 premium fragrances in elegant packaging. Perfect gift for special occasions.',
         95000, 68000, 'Beauty',
         'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
         'Luxury perfume gift set with three glass bottles in decorative box', 25, 5, 80, 10, 'in_stock', true, 4.8, 55),

        -- SPORTS
        (p17, 'KMR-SPRT-001', 'Yoga Mat Premium Non-Slip',
         'Extra thick 6mm yoga mat with alignment lines, carrying strap, and non-slip surface. Perfect for yoga, pilates, and stretching.',
         28000, 18000, 'Sports',
         'https://images.unsplash.com/photo-1601925228008-8b8c4a4c5b2e?w=400',
         'Purple premium yoga mat rolled out on wooden floor', 90, 20, 400, 40, 'in_stock', true, 4.5, 63),

        (p18, 'KMR-FOOD-001', 'Rwanda Premium Coffee Beans 1kg',
         'Single-origin Rwandan Arabica coffee beans from the hills of Nyungwe. Rich, smooth flavor with notes of dark chocolate and citrus.',
         18000, 10000, 'Food',
         'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
         'Premium Rwanda coffee beans in brown kraft paper bag with mountain scenery', 200, 30, 1000, 60, 'in_stock', true, 4.9, 112)

    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        image_url = EXCLUDED.image_url,
        image_alt = EXCLUDED.image_alt,
        current_stock = EXCLUDED.current_stock,
        is_active = EXCLUDED.is_active,
        average_rating = EXCLUDED.average_rating,
        review_count = EXCLUDED.review_count;

    -- Re-fetch product IDs after conflict resolution
    SELECT id INTO p1 FROM public.products WHERE sku = 'KMR-ELEC-001' LIMIT 1;
    SELECT id INTO p2 FROM public.products WHERE sku = 'KMR-ELEC-002' LIMIT 1;
    SELECT id INTO p3 FROM public.products WHERE sku = 'KMR-ELEC-003' LIMIT 1;
    SELECT id INTO p4 FROM public.products WHERE sku = 'KMR-ELEC-004' LIMIT 1;
    SELECT id INTO p5 FROM public.products WHERE sku = 'KMR-ELEC-005' LIMIT 1;
    SELECT id INTO p6 FROM public.products WHERE sku = 'KMR-ELEC-006' LIMIT 1;
    SELECT id INTO p7 FROM public.products WHERE sku = 'KMR-FASH-001' LIMIT 1;
    SELECT id INTO p8 FROM public.products WHERE sku = 'KMR-FASH-002' LIMIT 1;
    SELECT id INTO p9 FROM public.products WHERE sku = 'KMR-FASH-003' LIMIT 1;
    SELECT id INTO p10 FROM public.products WHERE sku = 'KMR-FASH-004' LIMIT 1;
    SELECT id INTO p11 FROM public.products WHERE sku = 'KMR-HOME-001' LIMIT 1;
    SELECT id INTO p12 FROM public.products WHERE sku = 'KMR-HOME-002' LIMIT 1;
    SELECT id INTO p13 FROM public.products WHERE sku = 'KMR-HOME-003' LIMIT 1;
    SELECT id INTO p14 FROM public.products WHERE sku = 'KMR-BEAU-001' LIMIT 1;
    SELECT id INTO p15 FROM public.products WHERE sku = 'KMR-BEAU-002' LIMIT 1;
    SELECT id INTO p16 FROM public.products WHERE sku = 'KMR-BEAU-003' LIMIT 1;
    SELECT id INTO p17 FROM public.products WHERE sku = 'KMR-SPRT-001' LIMIT 1;
    SELECT id INTO p18 FROM public.products WHERE sku = 'KMR-FOOD-001' LIMIT 1;

    -- ============================================================
    -- 6. LINK PRODUCTS TO CATEGORIES
    -- ============================================================

    INSERT INTO public.product_categories (product_id, category_id, is_primary)
    VALUES
        (p1, cat_electronics, true),
        (p2, cat_electronics, true),
        (p3, cat_electronics, true),
        (p4, cat_electronics, true),
        (p5, cat_electronics, true),
        (p6, cat_electronics, true),
        (p7, cat_fashion, true),
        (p8, cat_fashion, true),
        (p9, cat_fashion, true),
        (p10, cat_fashion, true),
        (p11, cat_home, true),
        (p12, cat_home, true),
        (p13, cat_home, true),
        (p14, cat_beauty, true),
        (p15, cat_beauty, true),
        (p16, cat_beauty, true),
        (p17, cat_sports, true),
        (p18, cat_food, true)
    ON CONFLICT (product_id, category_id) DO NOTHING;

    RAISE NOTICE 'Ka-ma-ro seed data inserted successfully: 18 products, 6 categories';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;

-- ============================================================
-- 7. ENSURE DEMO USERS EXIST (idempotent)
-- ============================================================

DO $$
DECLARE
    admin_uuid UUID;
    customer_uuid UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@kamaro.com' LIMIT 1;
    SELECT id INTO customer_uuid FROM auth.users WHERE email = 'customer@kamaro.com' LIMIT 1;

    -- Create admin if not exists
    IF admin_uuid IS NULL THEN
        admin_uuid := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'admin@kamaro.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
            jsonb_build_object('full_name', 'Ka-ma-ro Admin', 'role', 'admin'),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        ) ON CONFLICT (id) DO NOTHING;

        -- Update role to admin
        UPDATE public.user_profiles SET role = 'admin'::public.user_role WHERE id = admin_uuid;
    END IF;

    -- Create customer if not exists
    IF customer_uuid IS NULL THEN
        customer_uuid := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            customer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'customer@kamaro.com', crypt('customer123', gen_salt('bf', 10)), now(), now(), now(),
            jsonb_build_object('full_name', 'Ka-ma-ro Customer', 'role', 'customer'),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Demo users ready: admin@kamaro.com / admin123 | customer@kamaro.com / customer123';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo user creation error: %', SQLERRM;
END $$;

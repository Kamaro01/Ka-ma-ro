-- Location: supabase/migrations/20260114111800_category_management.sql
-- Schema Analysis: Existing products table with text category field
-- Integration Type: Extension - Adding category management tables
-- Dependencies: products, user_profiles

-- 1. Create categories table for proper category management
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    featured_image TEXT,
    featured_image_alt TEXT,
    seo_title TEXT,
    seo_description TEXT,
    product_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create junction table for product-category relationships (many-to-many)
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, category_id)
);

-- 3. Create indexes for optimal performance
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_categories_display_order ON public.categories(display_order);
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);
CREATE INDEX idx_product_categories_is_primary ON public.product_categories(is_primary);

-- 4. Create function to update category product count
CREATE OR REPLACE FUNCTION public.update_category_product_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.categories
        SET product_count = product_count + 1
        WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.categories
        SET product_count = product_count - 1
        WHERE id = OLD.category_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$func$;

-- 5. Create function to auto-generate slug from category name
CREATE OR REPLACE FUNCTION public.generate_category_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$func$;

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_categories_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

-- 7. Enable RLS for new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for categories table
CREATE POLICY "public_can_read_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_can_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (au.raw_user_meta_data->>'role' = 'admin'
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (au.raw_user_meta_data->>'role' = 'admin'
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
);

-- 9. Create RLS policies for product_categories junction table
CREATE POLICY "public_can_read_product_categories"
ON public.product_categories
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_can_manage_product_categories"
ON public.product_categories
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (au.raw_user_meta_data->>'role' = 'admin'
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (au.raw_user_meta_data->>'role' = 'admin'
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
);

-- 10. Create triggers
CREATE TRIGGER trigger_update_category_product_count
AFTER INSERT OR DELETE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_category_product_count();

CREATE TRIGGER trigger_generate_category_slug
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.generate_category_slug();

CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.handle_categories_updated_at();

-- 11. Insert sample categories
DO $$
DECLARE
    existing_admin_id UUID;
    electronics_id UUID := gen_random_uuid();
    fashion_id UUID := gen_random_uuid();
    home_id UUID := gen_random_uuid();
    books_id UUID := gen_random_uuid();
BEGIN
    -- Get existing admin user ID
    SELECT id INTO existing_admin_id
    FROM public.user_profiles
    WHERE email LIKE '%admin%'
    LIMIT 1;

    -- Insert main categories
    INSERT INTO public.categories (id, name, description, created_by, display_order, featured_image, featured_image_alt)
    VALUES
        (electronics_id, 'Electronics', 'All electronic devices and gadgets', existing_admin_id, 1,
         'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
         'Modern electronics and gadgets display'),
        (fashion_id, 'Fashion', 'Clothing, accessories, and footwear', existing_admin_id, 2,
         'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
         'Fashion clothing and accessories collection'),
        (home_id, 'Home & Living', 'Furniture and home decor items', existing_admin_id, 3,
         'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop',
         'Modern home furniture and decor'),
        (books_id, 'Books', 'Books and educational materials', existing_admin_id, 4,
         'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
         'Collection of books and educational materials');

    -- Insert subcategories
    INSERT INTO public.categories (name, description, parent_id, created_by, display_order, featured_image, featured_image_alt)
    VALUES
        ('Smartphones', 'Mobile phones and accessories', electronics_id, existing_admin_id, 1,
         'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
         'Latest smartphones and mobile devices'),
        ('Laptops', 'Portable computers and accessories', electronics_id, existing_admin_id, 2,
         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
         'Modern laptops and computing devices'),
        ('Mens Fashion', 'Clothing and accessories for men', fashion_id, existing_admin_id, 1,
         'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=300&fit=crop',
         'Mens fashion clothing and accessories'),
        ('Womens Fashion', 'Clothing and accessories for women', fashion_id, existing_admin_id, 2,
         'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
         'Womens fashion clothing and accessories');

    RAISE NOTICE 'Sample categories created successfully';
END $$;
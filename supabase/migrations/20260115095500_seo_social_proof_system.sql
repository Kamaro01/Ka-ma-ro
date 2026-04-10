-- Location: supabase/migrations/20260115095500_seo_social_proof_system.sql
-- Schema Analysis: Existing e-commerce schema with products, categories, reviews
-- Integration Type: Extension - Adding comprehensive SEO and social proof management
-- Dependencies: products, categories, business_settings

-- ============================================================================
-- 1. CUSTOM TYPES
-- ============================================================================

-- SEO page types for different sections
CREATE TYPE public.seo_page_type AS ENUM (
    'home',
    'product',
    'category',
    'custom',
    'blog',
    'landing'
);

-- Trust badge types
CREATE TYPE public.badge_type AS ENUM (
    'security',
    'payment',
    'certification',
    'award',
    'guarantee',
    'shipping'
);

-- Social proof types
CREATE TYPE public.proof_type AS ENUM (
    'testimonial',
    'review_aggregate',
    'trust_score',
    'social_media',
    'press_mention'
);

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- SEO Pages Management - Comprehensive meta tag system
CREATE TABLE public.seo_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type public.seo_page_type NOT NULL,
    page_path TEXT NOT NULL UNIQUE,
    
    -- Basic SEO
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT[],
    canonical_url TEXT,
    
    -- Open Graph (Facebook, LinkedIn)
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    og_type TEXT DEFAULT 'website',
    
    -- Twitter Cards
    twitter_card TEXT DEFAULT 'summary_large_image',
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image TEXT,
    
    -- Structured Data (JSON-LD)
    schema_markup JSONB,
    
    -- Additional SEO
    robots_directives TEXT[] DEFAULT ARRAY['index', 'follow'],
    alternate_languages JSONB,
    
    -- Analytics
    priority NUMERIC(2,1) DEFAULT 0.5,
    change_frequency TEXT DEFAULT 'weekly',
    last_modified TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- References
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    
    -- Meta
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trust Badges Management
CREATE TABLE public.trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    badge_type public.badge_type NOT NULL,
    
    -- Visual
    image_url TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    icon_class TEXT,
    
    -- Content
    title TEXT NOT NULL,
    description TEXT,
    
    -- Display Settings
    display_order INTEGER DEFAULT 0,
    display_locations TEXT[] DEFAULT ARRAY['footer', 'checkout'],
    
    -- External Link
    link_url TEXT,
    link_text TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMPTZ,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Social Proof Elements
CREATE TABLE public.social_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_type public.proof_type NOT NULL,
    
    -- Content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    author_title TEXT,
    author_image TEXT,
    
    -- Ratings/Scores
    rating NUMERIC(3,2),
    metric_value TEXT,
    metric_label TEXT,
    
    -- Source
    source_name TEXT,
    source_url TEXT,
    source_logo TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    
    -- Meta
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SEO Analytics Tracking
CREATE TABLE public.seo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_page_id UUID REFERENCES public.seo_pages(id) ON DELETE CASCADE,
    
    -- Traffic Metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTEGER,
    bounce_rate NUMERIC(5,2),
    
    -- SEO Metrics
    organic_traffic INTEGER DEFAULT 0,
    keyword_rankings JSONB,
    backlinks_count INTEGER DEFAULT 0,
    domain_authority NUMERIC(3,1),
    
    -- Conversion
    conversion_rate NUMERIC(5,2),
    conversions INTEGER DEFAULT 0,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_seo_analytics_period UNIQUE(seo_page_id, period_start, period_end)
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- SEO Pages indexes
CREATE INDEX idx_seo_pages_type ON public.seo_pages(page_type);
CREATE INDEX idx_seo_pages_path ON public.seo_pages(page_path);
CREATE INDEX idx_seo_pages_product ON public.seo_pages(product_id);
CREATE INDEX idx_seo_pages_category ON public.seo_pages(category_id);
CREATE INDEX idx_seo_pages_active ON public.seo_pages(is_active);
CREATE INDEX idx_seo_pages_priority ON public.seo_pages(priority DESC);

-- Trust Badges indexes
CREATE INDEX idx_trust_badges_type ON public.trust_badges(badge_type);
CREATE INDEX idx_trust_badges_active ON public.trust_badges(is_active);
CREATE INDEX idx_trust_badges_order ON public.trust_badges(display_order);

-- Social Proofs indexes
CREATE INDEX idx_social_proofs_type ON public.social_proofs(proof_type);
CREATE INDEX idx_social_proofs_featured ON public.social_proofs(featured);
CREATE INDEX idx_social_proofs_active ON public.social_proofs(is_active);
CREATE INDEX idx_social_proofs_order ON public.social_proofs(display_order);

-- SEO Analytics indexes
CREATE INDEX idx_seo_analytics_page ON public.seo_analytics(seo_page_id);
CREATE INDEX idx_seo_analytics_period ON public.seo_analytics(period_start, period_end);

-- ============================================================================
-- 4. FUNCTIONS
-- ============================================================================

-- Function to generate sitemap data
CREATE OR REPLACE FUNCTION public.generate_sitemap_data()
RETURNS TABLE(
    loc TEXT,
    lastmod TEXT,
    changefreq TEXT,
    priority TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        page_path,
        to_char(last_modified, 'YYYY-MM-DD'),
        change_frequency,
        priority::TEXT
    FROM public.seo_pages
    WHERE is_active = true
    ORDER BY priority DESC, last_modified DESC;
$$;

-- Function to get SEO score for a page
CREATE OR REPLACE FUNCTION public.calculate_seo_score(page_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    score INTEGER := 0;
    page_rec RECORD;
BEGIN
    SELECT * INTO page_rec FROM public.seo_pages WHERE id = page_uuid;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Title (20 points)
    IF page_rec.title IS NOT NULL AND length(page_rec.title) BETWEEN 30 AND 60 THEN
        score := score + 20;
    ELSIF page_rec.title IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Description (20 points)
    IF page_rec.description IS NOT NULL AND length(page_rec.description) BETWEEN 120 AND 160 THEN
        score := score + 20;
    ELSIF page_rec.description IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Keywords (10 points)
    IF page_rec.keywords IS NOT NULL AND array_length(page_rec.keywords, 1) >= 3 THEN
        score := score + 10;
    END IF;
    
    -- Open Graph (15 points)
    IF page_rec.og_title IS NOT NULL AND page_rec.og_description IS NOT NULL AND page_rec.og_image IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    -- Twitter Cards (15 points)
    IF page_rec.twitter_title IS NOT NULL AND page_rec.twitter_description IS NOT NULL AND page_rec.twitter_image IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    -- Structured Data (10 points)
    IF page_rec.schema_markup IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Canonical URL (5 points)
    IF page_rec.canonical_url IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    -- Robots Directives (5 points)
    IF page_rec.robots_directives IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    RETURN score;
END;
$$;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_analytics ENABLE ROW LEVEL SECURITY;

-- SEO Pages - Public read, admin write
CREATE POLICY "public_can_read_seo_pages"
ON public.seo_pages
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_can_manage_seo_pages"
ON public.seo_pages
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Trust Badges - Public read, admin write
CREATE POLICY "public_can_read_trust_badges"
ON public.trust_badges
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_can_manage_trust_badges"
ON public.trust_badges
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Social Proofs - Public read, admin write
CREATE POLICY "public_can_read_social_proofs"
ON public.social_proofs
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_can_manage_social_proofs"
ON public.social_proofs
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- SEO Analytics - Admin only
CREATE POLICY "admin_can_view_seo_analytics"
ON public.seo_analytics
FOR SELECT
TO authenticated
USING (public.is_admin_from_auth());

CREATE POLICY "admin_can_manage_seo_analytics"
ON public.seo_analytics
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger to update timestamps
CREATE TRIGGER set_seo_pages_updated_at
    BEFORE UPDATE ON public.seo_pages
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_trust_badges_updated_at
    BEFORE UPDATE ON public.trust_badges
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_social_proofs_updated_at
    BEFORE UPDATE ON public.social_proofs
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- 7. MOCK DATA
-- ============================================================================

DO $$
DECLARE
    home_page_id UUID := gen_random_uuid();
    electronics_page_id UUID := gen_random_uuid();
    admin_user_id UUID;
BEGIN
    -- Get admin user
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    -- Insert SEO pages
    INSERT INTO public.seo_pages (
        id, page_type, page_path, title, description, keywords,
        og_title, og_description, og_image,
        twitter_title, twitter_description, twitter_image,
        schema_markup, priority, created_by
    ) VALUES
    (
        home_page_id,
        'home',
        '/',
        'Ka-ma-ro Electronics - Premium Electronics in Rwanda',
        'Shop the latest electronics, gadgets, and tech accessories in Rwanda. Fast delivery, secure payments, and quality products guaranteed.',
        ARRAY['electronics rwanda', 'gadgets kigali', 'online electronics store'],
        'Ka-ma-ro Electronics - Your Tech Destination in Rwanda',
        'Discover premium electronics and gadgets with fast delivery across Rwanda. Quality products, secure payments, and excellent service.',
        'https://images.unsplash.com/photo-1498049794561-7780e7231661',
        'Ka-ma-ro Electronics Rwanda',
        'Shop premium electronics in Rwanda with fast delivery and secure payments',
        'https://images.unsplash.com/photo-1498049794561-7780e7231661',
        '{"@context":"https://schema.org","@type":"Store","name":"Ka-ma-ro Electronics","description":"Premium electronics store in Rwanda","address":{"@type":"PostalAddress","addressCountry":"RW"},"priceRange":"$$"}'::jsonb,
        1.0,
        admin_user_id
    ),
    (
        electronics_page_id,
        'category',
        '/product-category-listing',
        'Electronics Category - Ka-ma-ro Store',
        'Browse our extensive collection of electronics including smartphones, laptops, tablets, and accessories. Quality products at competitive prices.',
        ARRAY['electronics', 'smartphones', 'laptops', 'tablets'],
        'Electronics Category - Premium Tech Products',
        'Shop the best electronics in Rwanda. From smartphones to laptops, find quality tech products with warranty and support.',
        'https://images.unsplash.com/photo-1498049794561-7780e7231661',
        'Electronics Category Rwanda',
        'Quality electronics and gadgets available in Rwanda',
        'https://images.unsplash.com/photo-1498049794561-7780e7231661',
        '{"@context":"https://schema.org","@type":"CollectionPage","name":"Electronics Category","description":"Premium electronics collection"}'::jsonb,
        0.9,
        admin_user_id
    );
    
    -- Insert trust badges
    INSERT INTO public.trust_badges (
        name, badge_type, image_url, image_alt, title, description, display_order, display_locations
    ) VALUES
    ('SSL Secure', 'security', 'https://images.unsplash.com/photo-1633265486064-086b219458ec', 'SSL security badge showing encrypted connection', 'SSL Secured', '256-bit encryption for secure transactions', 1, ARRAY['footer', 'checkout', 'product']),
    ('Mobile Money', 'payment', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d', 'Mobile money payment options including MTN and Airtel', 'Mobile Money Accepted', 'MTN, Airtel, and bank transfers', 2, ARRAY['footer', 'checkout']),
    ('Money Back', 'guarantee', 'https://images.unsplash.com/photo-1579621970795-87facc2f976d', 'Money back guarantee badge', '30-Day Money Back', 'Full refund if not satisfied', 3, ARRAY['footer', 'product']),
    ('Fast Delivery', 'shipping', 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55', 'Fast delivery truck icon', 'Fast Delivery', 'Same-day delivery in Kigali', 4, ARRAY['footer', 'checkout']),
    ('Rwanda Certified', 'certification', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 'Rwanda business certification badge', 'Rwanda Certified', 'Officially registered business', 5, ARRAY['footer']);
    
    -- Insert social proofs
    INSERT INTO public.social_proofs (
        proof_type, title, content, author_name, author_title, rating, display_order, featured, is_verified
    ) VALUES
    ('testimonial', 'Excellent Service!', 'I ordered a laptop and received it the same day in perfect condition. The customer service was outstanding and they helped me set everything up. Highly recommended!', 'Jean Paul Uwimana', 'Business Owner', 5.00, 1, true, true),
    ('testimonial', 'Great Quality Products', 'The electronics are genuine and come with proper warranty. I have been shopping here for over a year and never had any issues. Best online store in Rwanda!', 'Marie Claire Mukeshimana', 'Teacher', 5.00, 2, true, true),
    ('review_aggregate', 'Customer Satisfaction', 'Based on 500+ verified customer reviews', NULL, NULL, 4.8, 3, true, true),
    ('trust_score', 'Trust Rating', '4.9 out of 5 stars from 1,000+ customers', NULL, NULL, 4.9, 4, true, true),
    ('testimonial', 'Fast and Reliable', 'Ordered a smartphone and got it delivered within hours. The payment process was smooth with MTN Mobile Money. Will definitely order again!', 'Eric Niyonzima', 'Software Developer', 5.00, 5, false, true);
    
    -- Insert sample SEO analytics
    INSERT INTO public.seo_analytics (
        seo_page_id, page_views, unique_visitors, organic_traffic, 
        conversion_rate, conversions, period_start, period_end
    ) VALUES
    (home_page_id, 5000, 3200, 2800, 3.5, 112, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    (electronics_page_id, 3500, 2100, 1900, 4.2, 88, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.seo_pages IS 'Comprehensive SEO management for all pages with meta tags and structured data';
COMMENT ON TABLE public.trust_badges IS 'Trust badges and certifications displayed across the site';
COMMENT ON TABLE public.social_proofs IS 'Customer testimonials, reviews, and social validation elements';
COMMENT ON TABLE public.seo_analytics IS 'SEO performance metrics and analytics tracking';

COMMENT ON FUNCTION public.generate_sitemap_data() IS 'Generates XML sitemap data for search engines';
COMMENT ON FUNCTION public.calculate_seo_score(UUID) IS 'Calculates SEO optimization score (0-100) for a page';
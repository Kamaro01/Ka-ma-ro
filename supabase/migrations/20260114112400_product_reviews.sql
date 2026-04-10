-- Location: supabase/migrations/20260114112400_product_reviews.sql
-- Schema Analysis: Existing tables - products, orders, order_items, user_profiles
-- Integration Type: addition
-- Dependencies: products (id), user_profiles (id), orders (id, user_id)

-- 1. Create review_status enum
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create product_reviews table
CREATE TABLE public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    review_text TEXT NOT NULL,
    review_status public.review_status DEFAULT 'approved'::public.review_status,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id, order_id)
);

-- 3. Create review_helpful_votes table for tracking helpful votes
CREATE TABLE public.review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_review_vote UNIQUE (review_id, user_id)
);

-- 4. Add indexes for performance
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX idx_product_reviews_status ON public.product_reviews(review_status);
CREATE INDEX idx_product_reviews_verified ON public.product_reviews(is_verified_purchase);
CREATE INDEX idx_review_helpful_votes_review_id ON public.review_helpful_votes(review_id);

-- 5. Add product rating summary columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb;

CREATE INDEX idx_products_average_rating ON public.products(average_rating);

-- 6. Create function to update product rating statistics
CREATE OR REPLACE FUNCTION public.update_product_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_record RECORD;
BEGIN
    -- Get current product statistics
    SELECT 
        product_id,
        COUNT(*)::INTEGER as total_reviews,
        AVG(rating)::NUMERIC(3,2) as avg_rating,
        COUNT(CASE WHEN rating = 1 THEN 1 END)::INTEGER as rating_1,
        COUNT(CASE WHEN rating = 2 THEN 1 END)::INTEGER as rating_2,
        COUNT(CASE WHEN rating = 3 THEN 1 END)::INTEGER as rating_3,
        COUNT(CASE WHEN rating = 4 THEN 1 END)::INTEGER as rating_4,
        COUNT(CASE WHEN rating = 5 THEN 1 END)::INTEGER as rating_5
    INTO product_record
    FROM public.product_reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND review_status = 'approved'
    GROUP BY product_id;

    -- Update product table with new statistics
    IF product_record IS NOT NULL THEN
        UPDATE public.products
        SET 
            average_rating = COALESCE(product_record.avg_rating, 0.00),
            review_count = COALESCE(product_record.total_reviews, 0),
            rating_distribution = jsonb_build_object(
                '1', COALESCE(product_record.rating_1, 0),
                '2', COALESCE(product_record.rating_2, 0),
                '3', COALESCE(product_record.rating_3, 0),
                '4', COALESCE(product_record.rating_4, 0),
                '5', COALESCE(product_record.rating_5, 0)
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = product_record.product_id;
    ELSE
        -- Reset statistics if no approved reviews
        UPDATE public.products
        SET 
            average_rating = 0.00,
            review_count = 0,
            rating_distribution = '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Create function to update helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.product_reviews
    SET helpful_count = (
        SELECT COUNT(*)::INTEGER 
        FROM public.review_helpful_votes 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
    )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 8. Create function to verify purchase before review
CREATE OR REPLACE FUNCTION public.verify_purchase_for_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_delivered_order BOOLEAN;
BEGIN
    -- Check if user has delivered order with this product
    SELECT EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        WHERE o.user_id = NEW.user_id
        AND oi.product_id = NEW.product_id
        AND o.order_status = 'delivered'
    ) INTO has_delivered_order;

    -- Set verified purchase flag
    NEW.is_verified_purchase = has_delivered_order;
    
    -- If order_id provided, verify it matches
    IF NEW.order_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.order_items oi ON o.id = oi.order_id
            WHERE o.id = NEW.order_id
            AND o.user_id = NEW.user_id
            AND oi.product_id = NEW.product_id
            AND o.order_status = 'delivered'
        ) THEN
            RAISE EXCEPTION 'Invalid order ID or order not delivered';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 9. Create triggers
CREATE TRIGGER trigger_verify_purchase_before_review
BEFORE INSERT ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.verify_purchase_for_review();

CREATE TRIGGER trigger_update_product_rating_after_review_insert
AFTER INSERT ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating_stats();

CREATE TRIGGER trigger_update_product_rating_after_review_update
AFTER UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating_stats();

CREATE TRIGGER trigger_update_product_rating_after_review_delete
AFTER DELETE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating_stats();

CREATE TRIGGER trigger_update_helpful_count_after_vote_insert
AFTER INSERT ON public.review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();

CREATE TRIGGER trigger_update_helpful_count_after_vote_delete
AFTER DELETE ON public.review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();

CREATE TRIGGER set_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 10. Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for product_reviews
CREATE POLICY "public_can_read_approved_reviews"
ON public.product_reviews
FOR SELECT
TO public
USING (review_status = 'approved');

CREATE POLICY "users_can_create_own_reviews"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_reviews"
ON public.product_reviews
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_reviews"
ON public.product_reviews
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 12. RLS Policies for review_helpful_votes
CREATE POLICY "users_can_view_all_votes"
ON public.review_helpful_votes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_can_create_own_votes"
ON public.review_helpful_votes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_votes"
ON public.review_helpful_votes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 13. Mock data with existing user references
DO $$
DECLARE
    existing_user_id UUID;
    existing_product_id UUID;
    existing_order_id UUID;
    review1_id UUID := gen_random_uuid();
    review2_id UUID := gen_random_uuid();
    review3_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user, product, and delivered order
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_product_id FROM public.products LIMIT 1;
    SELECT id INTO existing_order_id FROM public.orders 
    WHERE order_status = 'delivered' AND user_id = existing_user_id LIMIT 1;
    
    IF existing_user_id IS NOT NULL AND existing_product_id IS NOT NULL AND existing_order_id IS NOT NULL THEN
        -- Insert sample reviews
        INSERT INTO public.product_reviews (id, product_id, user_id, order_id, rating, title, review_text, review_status, is_verified_purchase, helpful_count)
        VALUES
            (review1_id, existing_product_id, existing_user_id, existing_order_id, 5, 'Excellent Product!', 'This product exceeded my expectations. The quality is outstanding and it arrived on time.', 'approved', true, 15),
            (review2_id, existing_product_id, existing_user_id, NULL, 4, 'Good but could be better', 'Overall satisfied with the purchase. Minor improvements could be made to the packaging.', 'approved', false, 8),
            (review3_id, existing_product_id, existing_user_id, existing_order_id, 5, 'Best purchase ever', 'Cannot recommend this enough. Worth every penny and the customer service was amazing.', 'approved', true, 23);
        
        -- Insert helpful votes
        INSERT INTO public.review_helpful_votes (review_id, user_id)
        VALUES
            (review1_id, existing_user_id),
            (review2_id, existing_user_id);
    ELSE
        RAISE NOTICE 'No existing users, products, or delivered orders found. Run auth and order migrations first.';
    END IF;
END $$;
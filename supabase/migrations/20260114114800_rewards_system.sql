-- Location: supabase/migrations/20260114114800_rewards_system.sql
-- Schema Analysis: Existing tables - orders, product_reviews, user_profiles
-- Integration Type: NEW_MODULE - Adding rewards and referral system
-- Dependencies: user_profiles, orders, product_reviews

-- 1. ENUMS
CREATE TYPE public.transaction_type AS ENUM (
  'earned_purchase',
  'earned_review', 
  'earned_referral_signup',
  'earned_referral_purchase',
  'redeemed_discount',
  'expired',
  'admin_adjustment'
);

CREATE TYPE public.referral_status AS ENUM (
  'pending',
  'signed_up',
  'first_purchase_complete',
  'active'
);

-- 2. CORE TABLES

-- User rewards account
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  points_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_points CHECK (total_points >= 0)
);

-- Points transaction history
CREATE TABLE public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  transaction_type public.transaction_type NOT NULL,
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Referral tracking
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  referee_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referral_status public.referral_status DEFAULT 'pending'::public.referral_status,
  signup_date TIMESTAMPTZ,
  first_purchase_date TIMESTAMPTZ,
  referrer_points_earned INTEGER DEFAULT 0,
  referee_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Discount redemptions
CREATE TABLE public.discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points_used INTEGER NOT NULL,
  discount_amount NUMERIC NOT NULL,
  discount_code TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_points_used CHECK (points_used > 0),
  CONSTRAINT positive_discount CHECK (discount_amount > 0)
);

-- Reward configuration
CREATE TABLE public.reward_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX idx_reward_transactions_user_id ON public.reward_transactions(user_id);
CREATE INDEX idx_reward_transactions_type ON public.reward_transactions(transaction_type);
CREATE INDEX idx_reward_transactions_reference ON public.reward_transactions(reference_id, reference_type);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(referral_status);
CREATE INDEX idx_discount_redemptions_user_id ON public.discount_redemptions(user_id);
CREATE INDEX idx_discount_redemptions_order_id ON public.discount_redemptions(order_id);

-- 4. FUNCTIONS

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_user_id::TEXT) FROM 1 FOR 8));
    
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Calculate points for purchase
CREATE OR REPLACE FUNCTION public.calculate_purchase_points(p_order_total NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_points_per_dollar INTEGER;
BEGIN
  SELECT (config_value->>'points_per_dollar')::INTEGER
  INTO v_points_per_dollar
  FROM public.reward_config
  WHERE config_key = 'purchase_rewards';
  
  v_points_per_dollar := COALESCE(v_points_per_dollar, 10);
  
  RETURN FLOOR(p_order_total * v_points_per_dollar)::INTEGER;
END;
$$;

-- Award points to user
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type public.transaction_type,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be positive';
  END IF;
  
  v_expires_at := CURRENT_TIMESTAMP + INTERVAL '1 year';
  
  INSERT INTO public.reward_transactions (
    user_id, transaction_type, points, description,
    reference_id, reference_type, expires_at
  )
  VALUES (
    p_user_id, p_transaction_type, p_points, p_description,
    p_reference_id, p_reference_type, v_expires_at
  )
  RETURNING id INTO v_transaction_id;
  
  INSERT INTO public.user_rewards (user_id, total_points, lifetime_points)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_rewards.total_points + p_points,
    lifetime_points = public.user_rewards.lifetime_points + p_points,
    updated_at = CURRENT_TIMESTAMP;
  
  RETURN v_transaction_id;
END;
$$;

-- 5. TRIGGERS

-- Auto-create user rewards account
CREATE OR REPLACE FUNCTION public.create_user_rewards_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_rewards (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_user_rewards_account
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_user_rewards_account();

-- Award points for completed orders
CREATE OR REPLACE FUNCTION public.award_purchase_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
BEGIN
  IF NEW.order_status = 'delivered' AND 
     (OLD.order_status IS NULL OR OLD.order_status != 'delivered') THEN
    
    v_points := public.calculate_purchase_points(NEW.total);
    
    PERFORM public.award_points(
      NEW.user_id,
      v_points,
      'earned_purchase'::public.transaction_type,
      'Points earned from order ' || NEW.order_number,
      NEW.id,
      'order'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_award_purchase_points
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_purchase_points();

-- Award points for approved reviews
CREATE OR REPLACE FUNCTION public.award_review_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_review_points INTEGER;
  v_already_awarded BOOLEAN;
BEGIN
  IF NEW.review_status = 'approved' AND 
     (OLD.review_status IS NULL OR OLD.review_status != 'approved') THEN
    
    SELECT EXISTS(
      SELECT 1 FROM public.reward_transactions
      WHERE reference_id = NEW.id AND reference_type = 'review'
    ) INTO v_already_awarded;
    
    IF NOT v_already_awarded THEN
      SELECT (config_value->>'points_per_review')::INTEGER
      INTO v_review_points
      FROM public.reward_config
      WHERE config_key = 'review_rewards';
      
      v_review_points := COALESCE(v_review_points, 50);
      
      PERFORM public.award_points(
        NEW.user_id,
        v_review_points,
        'earned_review'::public.transaction_type,
        'Points earned for product review',
        NEW.id,
        'review'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_award_review_points
AFTER INSERT OR UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.award_review_points();

-- Update user rewards timestamp
CREATE OR REPLACE FUNCTION public.handle_user_rewards_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_rewards_updated_at
BEFORE UPDATE ON public.user_rewards
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_rewards_updated_at();

CREATE TRIGGER set_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_rewards_updated_at();

-- 6. RLS POLICIES

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_config ENABLE ROW LEVEL SECURITY;

-- User rewards policies
CREATE POLICY "users_view_own_rewards"
ON public.user_rewards
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Reward transactions policies
CREATE POLICY "users_view_own_transactions"
ON public.reward_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Referrals policies
CREATE POLICY "users_manage_own_referrals"
ON public.referrals
FOR ALL
TO authenticated
USING (referrer_id = auth.uid())
WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "users_view_referee_referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (referee_id = auth.uid());

-- Discount redemptions policies
CREATE POLICY "users_view_own_redemptions"
ON public.discount_redemptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_redemptions"
ON public.discount_redemptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Reward config - public read
CREATE POLICY "public_read_reward_config"
ON public.reward_config
FOR SELECT
TO authenticated
USING (true);

-- 7. INITIAL CONFIGURATION DATA

INSERT INTO public.reward_config (config_key, config_value, description)
VALUES
  ('purchase_rewards', '{"points_per_dollar": 10, "min_order_amount": 0}'::jsonb, 
   'Points earned per dollar spent on purchases'),
  ('review_rewards', '{"points_per_review": 50, "max_per_product": 1}'::jsonb,
   'Points earned for writing product reviews'),
  ('referral_rewards', '{"referrer_signup_points": 100, "referrer_purchase_points": 200, "referee_signup_points": 50}'::jsonb,
   'Points earned through referral program'),
  ('redemption_rules', '{"points_per_dollar_discount": 100, "min_points_for_redemption": 500, "max_discount_percentage": 50}'::jsonb,
   'Rules for redeeming points for discounts');

-- 8. MOCK DATA

DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_referral_code1 TEXT;
  v_referral_code2 TEXT;
BEGIN
  SELECT id INTO v_user1_id FROM public.user_profiles ORDER BY created_at LIMIT 1;
  SELECT id INTO v_user2_id FROM public.user_profiles ORDER BY created_at OFFSET 1 LIMIT 1;
  
  IF v_user1_id IS NULL THEN
    RAISE NOTICE 'No users found for rewards mock data';
    RETURN;
  END IF;
  
  INSERT INTO public.user_rewards (user_id, total_points, lifetime_points, points_redeemed)
  VALUES
    (v_user1_id, 850, 1250, 400)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = 850,
    lifetime_points = 1250,
    points_redeemed = 400;
  
  IF v_user2_id IS NOT NULL THEN
    INSERT INTO public.user_rewards (user_id, total_points, lifetime_points, points_redeemed)
    VALUES
      (v_user2_id, 320, 320, 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  v_referral_code1 := public.generate_referral_code(v_user1_id);
  v_referral_code2 := CASE WHEN v_user2_id IS NOT NULL 
                            THEN public.generate_referral_code(v_user2_id) 
                            ELSE NULL END;
  
  INSERT INTO public.referrals (
    referrer_id, referee_email, referral_code, referral_status, 
    referrer_points_earned, referee_points_earned
  )
  VALUES
    (v_user1_id, 'friend1@example.com', v_referral_code1, 'pending', 0, 0),
    (v_user1_id, 'friend2@example.com', public.generate_referral_code(v_user1_id), 'signed_up', 100, 50);
  
  IF v_user2_id IS NOT NULL AND v_referral_code2 IS NOT NULL THEN
    INSERT INTO public.referrals (
      referrer_id, referee_email, referral_code, referral_status,
      referrer_points_earned, referee_points_earned
    )
    VALUES
      (v_user2_id, 'newfriend@example.com', v_referral_code2, 'pending', 0, 0);
  END IF;
  
  INSERT INTO public.reward_transactions (
    user_id, transaction_type, points, description, reference_type
  )
  VALUES
    (v_user1_id, 'earned_purchase', 250, 'Points earned from order ORD-2024-001', 'order'),
    (v_user1_id, 'earned_review', 50, 'Points earned for product review', 'review'),
    (v_user1_id, 'earned_referral_signup', 100, 'Referral signup bonus', 'referral'),
    (v_user1_id, 'redeemed_discount', -400, 'Redeemed for 20% discount', 'redemption');
  
  IF v_user2_id IS NOT NULL THEN
    INSERT INTO public.reward_transactions (
      user_id, transaction_type, points, description, reference_type
    )
    VALUES
      (v_user2_id, 'earned_purchase', 220, 'Points earned from order ORD-2024-015', 'order'),
      (v_user2_id, 'earned_review', 50, 'Points earned for product review', 'review'),
      (v_user2_id, 'earned_referral_signup', 50, 'Welcome bonus from referral', 'referral');
  END IF;
END $$;
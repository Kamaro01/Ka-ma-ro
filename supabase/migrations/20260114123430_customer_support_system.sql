-- Location: supabase/migrations/20260114123430_customer_support_system.sql
-- Schema Analysis: Existing user_profiles, orders, products tables
-- Integration Type: Addition of customer support system
-- Dependencies: user_profiles (for user references), orders (for ticket context)

-- 1. Create ENUM types for support system
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.ticket_category AS ENUM ('order', 'product', 'technical', 'account', 'general');
CREATE TYPE public.faq_category AS ENUM ('ordering', 'shipping', 'returns', 'payments', 'technical', 'account');

-- 2. Create support tickets table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.ticket_category NOT NULL,
    priority public.ticket_priority DEFAULT 'medium'::public.ticket_priority,
    status public.ticket_status DEFAULT 'open'::public.ticket_status,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create ticket messages table for conversations
CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create FAQs table
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category public.faq_category NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create FAQ feedback table
CREATE TABLE public.faq_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faq_id UUID REFERENCES public.faqs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faq_id, user_id)
);

-- 6. Create indexes for performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages(created_at);
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_published ON public.faqs(is_published);
CREATE INDEX idx_faq_feedback_faq_id ON public.faq_feedback(faq_id);

-- 7. Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        new_number := 'TKT-' || LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM public.support_tickets WHERE ticket_number = new_number) INTO exists_check;
        EXIT WHEN NOT exists_check;
    END LOOP;
    RETURN new_number;
END;
$$;

-- 8. Create trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_ticket_number
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_ticket_number();

-- 9. Create trigger to update ticket updated_at
CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ticket_timestamp
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_ticket_timestamp();

-- 10. Create trigger to update FAQ helpful counts
CREATE OR REPLACE FUNCTION public.update_faq_helpful_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_helpful THEN
            UPDATE public.faqs SET helpful_count = helpful_count + 1 WHERE id = NEW.faq_id;
        ELSE
            UPDATE public.faqs SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.faq_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_helpful != NEW.is_helpful THEN
            IF NEW.is_helpful THEN
                UPDATE public.faqs 
                SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 
                WHERE id = NEW.faq_id;
            ELSE
                UPDATE public.faqs 
                SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 
                WHERE id = NEW.faq_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_helpful THEN
            UPDATE public.faqs SET helpful_count = helpful_count - 1 WHERE id = OLD.faq_id;
        ELSE
            UPDATE public.faqs SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.faq_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_faq_helpful_counts
AFTER INSERT OR UPDATE OR DELETE ON public.faq_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_faq_helpful_counts();

-- 11. Enable RLS on all tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_feedback ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for support_tickets (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_support_tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 13. RLS Policies for ticket_messages (Pattern 2: Simple User Ownership)
CREATE POLICY "users_view_ticket_messages"
ON public.ticket_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_messages.ticket_id
        AND st.user_id = auth.uid()
    )
);

CREATE POLICY "users_create_ticket_messages"
ON public.ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 14. RLS Policies for FAQs (Pattern 4: Public Read, Private Write)
CREATE POLICY "public_can_read_published_faqs"
ON public.faqs
FOR SELECT
TO public
USING (is_published = true);

-- 15. RLS Policies for FAQ feedback (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_faq_feedback"
ON public.faq_feedback
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 16. Insert sample FAQs
DO $$
BEGIN
    INSERT INTO public.faqs (category, question, answer, display_order, is_published) VALUES
        ('ordering'::public.faq_category, 'How do I place an order?', 'To place an order, browse our products, add items to your cart, and proceed to checkout. You will need to provide your shipping address and payment information.', 1, true),
        ('ordering'::public.faq_category, 'Can I modify my order after placing it?', 'Orders can be modified within 1 hour of placement. Please contact support immediately with your order number to request changes.', 2, true),
        ('ordering'::public.faq_category, 'What payment methods do you accept?', 'We accept MTN Mobile Money, Airtel Money, and bank transfers from major Rwandan banks including Bank of Kigali, Equity Bank, and I&M Bank.', 3, true),
        ('shipping'::public.faq_category, 'How long does delivery take in Kigali?', 'Delivery within Kigali typically takes 1-2 business days. We offer same-day delivery for orders placed before 12 PM.', 1, true),
        ('shipping'::public.faq_category, 'Do you deliver outside Kigali?', 'Yes, we deliver to all provinces in Rwanda. Delivery time varies by location, typically 2-5 business days.', 2, true),
        ('shipping'::public.faq_category, 'How can I track my order?', 'Once your order ships, you will receive a tracking number via SMS and email. Use this number to track your delivery status.', 3, true),
        ('returns'::public.faq_category, 'What is your return policy?', 'We accept returns within 14 days of delivery. Products must be unused, in original packaging, and with all accessories included.', 1, true),
        ('returns'::public.faq_category, 'How do I initiate a return?', 'Contact our support team with your order number and reason for return. We will provide return instructions and arrange pickup if needed.', 2, true),
        ('returns'::public.faq_category, 'When will I receive my refund?', 'Refunds are processed within 5-7 business days after we receive and inspect the returned product. The amount will be credited to your original payment method.', 3, true),
        ('payments'::public.faq_category, 'Is my payment information secure?', 'Yes, all payment information is encrypted and processed securely. We do not store your complete payment details.', 1, true),
        ('payments'::public.faq_category, 'Can I pay on delivery?', 'Cash on delivery is available for orders within Kigali only. A small service fee may apply.', 2, true),
        ('technical'::public.faq_category, 'My product is not working properly. What should I do?', 'First, refer to the product manual for troubleshooting steps. If the issue persists, contact our technical support team with your order number and a description of the problem.', 1, true),
        ('technical'::public.faq_category, 'Do you offer warranty on products?', 'Yes, all products come with manufacturer warranty. Warranty period varies by product, typically 6-12 months. Check product details for specific warranty information.', 2, true),
        ('account'::public.faq_category, 'How do I create an account?', 'Click on the Sign Up button at the top of the page, enter your email, create a password, and provide your basic information.', 1, true),
        ('account'::public.faq_category, 'I forgot my password. How do I reset it?', 'Click on Forgot Password on the login page, enter your email, and follow the password reset instructions sent to your email.', 2, true);
END $$;
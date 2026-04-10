-- Location: supabase/migrations/20260114111300_inventory_management.sql
-- Schema Analysis: Existing orders and user_profiles tables
-- Integration Type: Addition - New inventory management module
-- Dependencies: user_profiles (for admin tracking)

-- 1. ENUMS & TYPES
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
CREATE TYPE public.alert_type AS ENUM ('low_stock', 'out_of_stock', 'restock_needed');

-- 2. CORE TABLES

-- Products table with comprehensive inventory tracking
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    category TEXT,
    image_url TEXT,
    image_alt TEXT,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    maximum_stock INTEGER,
    reorder_point INTEGER NOT NULL DEFAULT 20,
    stock_status public.stock_status DEFAULT 'in_stock'::public.stock_status,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Stock movements history for audit trail
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return', 'damage'
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id UUID, -- order_id or other reference
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Alert configurations per product
CREATE TABLE public.stock_alert_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    alert_type public.alert_type NOT NULL,
    threshold INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    notification_emails TEXT[], -- Array of email addresses
    notification_frequency TEXT DEFAULT 'once', -- 'once', 'daily', 'weekly'
    last_notification_sent TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, alert_type)
);

-- Active alerts tracking
CREATE TABLE public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    alert_type public.alert_type NOT NULL,
    message TEXT NOT NULL,
    current_stock INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_stock_status ON public.products(stock_status);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_movement_type ON public.stock_movements(movement_type);
CREATE INDEX idx_stock_alert_configs_product_id ON public.stock_alert_configs(product_id);
CREATE INDEX idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_is_resolved ON public.stock_alerts(is_resolved);

-- 4. FUNCTIONS

-- Function to update stock status based on current quantity
CREATE OR REPLACE FUNCTION public.update_stock_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF NEW.current_stock <= 0 THEN
        NEW.stock_status := 'out_of_stock'::public.stock_status;
    ELSIF NEW.current_stock <= NEW.minimum_stock THEN
        NEW.stock_status := 'low_stock'::public.stock_status;
    ELSE
        NEW.stock_status := 'in_stock'::public.stock_status;
    END IF;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

-- Function to log stock movements
CREATE OR REPLACE FUNCTION public.log_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF NEW.current_stock <> OLD.current_stock THEN
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity,
            previous_stock,
            new_stock,
            performed_by
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.current_stock > OLD.current_stock THEN 'adjustment_increase'
                ELSE 'adjustment_decrease'
            END,
            ABS(NEW.current_stock - OLD.current_stock),
            OLD.current_stock,
            NEW.current_stock,
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$func$;

-- Function to check and create alerts
CREATE OR REPLACE FUNCTION public.check_stock_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    alert_config RECORD;
    alert_message TEXT;
BEGIN
    -- Check each alert configuration for this product
    FOR alert_config IN 
        SELECT * FROM public.stock_alert_configs 
        WHERE product_id = NEW.id AND is_enabled = true
    LOOP
        -- Check if alert threshold is met
        IF NEW.current_stock <= alert_config.threshold THEN
            -- Check if alert already exists and is not resolved
            IF NOT EXISTS (
                SELECT 1 FROM public.stock_alerts 
                WHERE product_id = NEW.id 
                AND alert_type = alert_config.alert_type 
                AND is_resolved = false
            ) THEN
                -- Create alert message
                alert_message := format(
                    'Product %s (SKU: %s) stock is at %s units (threshold: %s)',
                    NEW.name,
                    NEW.sku,
                    NEW.current_stock,
                    alert_config.threshold
                );
                
                -- Insert new alert
                INSERT INTO public.stock_alerts (
                    product_id,
                    alert_type,
                    message,
                    current_stock,
                    threshold
                ) VALUES (
                    NEW.id,
                    alert_config.alert_type,
                    alert_message,
                    NEW.current_stock,
                    alert_config.threshold
                );
                
                -- Update last notification sent
                UPDATE public.stock_alert_configs
                SET last_notification_sent = CURRENT_TIMESTAMP
                WHERE id = alert_config.id;
            END IF;
        ELSE
            -- Resolve existing alerts if stock is above threshold
            UPDATE public.stock_alerts
            SET is_resolved = true,
                resolved_at = CURRENT_TIMESTAMP
            WHERE product_id = NEW.id 
            AND alert_type = alert_config.alert_type 
            AND is_resolved = false;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$func$;

-- Function to update order stock when order is created
CREATE OR REPLACE FUNCTION public.sync_order_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    order_item RECORD;
    product_record RECORD;
BEGIN
    -- When a new order is confirmed, reduce stock
    IF NEW.order_status IN ('confirmed', 'processing') THEN
        FOR order_item IN 
            SELECT * FROM public.order_items WHERE order_id = NEW.id
        LOOP
            -- Get product by matching product_name (since we do not have product_id in order_items)
            SELECT * INTO product_record FROM public.products 
            WHERE name = order_item.product_name 
            LIMIT 1;
            
            IF product_record.id IS NOT NULL THEN
                -- Reduce stock
                UPDATE public.products
                SET current_stock = GREATEST(current_stock - order_item.quantity, 0)
                WHERE id = product_record.id;
                
                -- Log stock movement
                INSERT INTO public.stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    previous_stock,
                    new_stock,
                    reference_id,
                    notes
                ) VALUES (
                    product_record.id,
                    'sale',
                    order_item.quantity,
                    product_record.current_stock,
                    GREATEST(product_record.current_stock - order_item.quantity, 0),
                    NEW.id,
                    format('Order %s', NEW.order_number)
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$func$;

-- 5. TRIGGERS
CREATE TRIGGER trigger_update_stock_status
    BEFORE INSERT OR UPDATE OF current_stock ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stock_status();

CREATE TRIGGER trigger_log_stock_movement
    AFTER UPDATE OF current_stock ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.log_stock_movement();

CREATE TRIGGER trigger_check_stock_alerts
    AFTER INSERT OR UPDATE OF current_stock ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.check_stock_alerts();

CREATE TRIGGER trigger_sync_order_stock
    AFTER INSERT OR UPDATE OF order_status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_order_stock();

-- 6. RLS POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "public_can_read_products"
ON public.products
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_can_manage_products"
ON public.products
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

-- Stock movements: Admin only
CREATE POLICY "admin_can_view_stock_movements"
ON public.stock_movements
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
);

CREATE POLICY "admin_can_manage_stock_movements"
ON public.stock_movements
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

-- Alert configs: Admin only
CREATE POLICY "admin_can_manage_alert_configs"
ON public.stock_alert_configs
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

-- Alerts: Admin only
CREATE POLICY "admin_can_manage_alerts"
ON public.stock_alerts
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

-- 7. MOCK DATA
DO $$
DECLARE
    admin_user_id UUID;
    product1_id UUID := gen_random_uuid();
    product2_id UUID := gen_random_uuid();
    product3_id UUID := gen_random_uuid();
    product4_id UUID := gen_random_uuid();
BEGIN
    -- Get existing admin user (assuming one exists from previous migrations)
    SELECT id INTO admin_user_id FROM public.user_profiles LIMIT 1;
    
    -- Only insert mock data if an admin user exists
    IF admin_user_id IS NOT NULL THEN
        -- Insert sample products
        INSERT INTO public.products (
            id, sku, name, description, price, cost_price, category, 
            image_url, image_alt, current_stock, minimum_stock, reorder_point,
            is_active, created_by
        ) VALUES
            (
                product1_id,
                'KMR-SHP-001',
                'Premium Leather Handbag',
                'Elegant leather handbag with adjustable strap and multiple compartments',
                45000.00,
                25000.00,
                'Handbags',
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
                'Brown leather handbag with gold hardware',
                25,
                10,
                20,
                true,
                admin_user_id
            ),
            (
                product2_id,
                'KMR-SHP-002',
                'Designer Crossbody Bag',
                'Compact crossbody bag perfect for daily use with chain strap',
                35000.00,
                18000.00,
                'Crossbody Bags',
                'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d',
                'Black designer crossbody bag with chain strap',
                8,
                10,
                15,
                true,
                admin_user_id
            ),
            (
                product3_id,
                'KMR-SHP-003',
                'Classic Tote Bag',
                'Spacious tote bag with reinforced handles for everyday carry',
                28000.00,
                15000.00,
                'Tote Bags',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
                'Beige canvas tote bag with leather handles',
                50,
                15,
                25,
                true,
                admin_user_id
            ),
            (
                product4_id,
                'KMR-SHP-004',
                'Evening Clutch',
                'Elegant clutch with crystal embellishments for special occasions',
                32000.00,
                16000.00,
                'Clutches',
                'https://images.unsplash.com/photo-1564422167509-4f10f3cb9c57',
                'Silver evening clutch with crystal details',
                3,
                5,
                10,
                true,
                admin_user_id
            );
        
        -- Insert default alert configurations
        INSERT INTO public.stock_alert_configs (product_id, alert_type, threshold, notification_emails)
        VALUES
            (product1_id, 'low_stock'::public.alert_type, 20, ARRAY['admin@ka-ma-ro.rw']::TEXT[]),
            (product2_id, 'low_stock'::public.alert_type, 15, ARRAY['admin@ka-ma-ro.rw']::TEXT[]),
            (product3_id, 'low_stock'::public.alert_type, 25, ARRAY['admin@ka-ma-ro.rw']::TEXT[]),
            (product4_id, 'low_stock'::public.alert_type, 10, ARRAY['admin@ka-ma-ro.rw']::TEXT[]),
            (product4_id, 'out_of_stock'::public.alert_type, 5, ARRAY['admin@ka-ma-ro.rw']::TEXT[]);
        
        -- Insert some initial stock movements
        INSERT INTO public.stock_movements (
            product_id, movement_type, quantity, previous_stock, new_stock, 
            notes, performed_by
        ) VALUES
            (product1_id, 'purchase', 25, 0, 25, 'Initial stock purchase', admin_user_id),
            (product2_id, 'purchase', 20, 0, 20, 'Initial stock purchase', admin_user_id),
            (product2_id, 'sale', 12, 20, 8, 'Sales during launch week', admin_user_id),
            (product3_id, 'purchase', 50, 0, 50, 'Initial stock purchase', admin_user_id),
            (product4_id, 'purchase', 10, 0, 10, 'Initial stock purchase', admin_user_id),
            (product4_id, 'sale', 7, 10, 3, 'Holiday season sales', admin_user_id);
    ELSE
        RAISE NOTICE 'No admin user found in user_profiles table. Skipping mock data insertion. Please create products manually or ensure user_profiles table has at least one user.';
    END IF;
        
END $$;
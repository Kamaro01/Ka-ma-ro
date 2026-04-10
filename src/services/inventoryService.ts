import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
type StockAlertConfig = Database['public']['Tables']['stock_alert_configs']['Row'];
type StockAlert = Database['public']['Tables']['stock_alerts']['Row'];
const asRows = <T>(data: unknown): T[] => (data ?? []) as T[];
const asRow = <T>(data: unknown): T | null => (data ?? null) as T | null;

export interface ProductWithStats extends Product {
  totalMovements?: number;
  activeAlerts?: number;
}

export const inventoryService = {
  // Products
  async getAllProducts(): Promise<{ data: Product[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    return { data: asRows<Product>(data), error: error as Error | null };
  },

  async getProductById(id: string): Promise<{ data: Product | null; error: Error | null }> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

    return { data: asRow<Product>(data), error: error as Error | null };
  },

  async getProductsWithStats(): Promise<{ data: ProductWithStats[] | null; error: Error | null }> {
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      const typedProducts = asRows<Product>(products);
      if (!typedProducts.length) return { data: null, error: null };

      const productsWithStats = await Promise.all(
        typedProducts.map(async (product) => {
          const [movements, alerts] = await Promise.all([
            supabase
              .from('stock_movements')
              .select('id', { count: 'exact', head: true })
              .eq('product_id', product.id),
            supabase
              .from('stock_alerts')
              .select('id', { count: 'exact', head: true })
              .eq('product_id', product.id)
              .eq('is_resolved', false),
          ]);

          return {
            ...product,
            totalMovements: movements?.count ?? 0,
            activeAlerts: alerts?.count ?? 0,
          };
        })
      );

      return { data: productsWithStats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateProductStock(
    productId: string,
    newStock: number,
    notes?: string
  ): Promise<{ data: Product | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('products')
      .update({ current_stock: newStock } as any)
      .eq('id', productId)
      .select()
      .single();

    return { data: asRow<Product>(data), error: error as Error | null };
  },

  async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<{ data: Product | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('products')
      .update(updates as any)
      .eq('id', productId)
      .select()
      .single();

    return { data: asRow<Product>(data), error: error as Error | null };
  },

  // Stock Movements
  async getStockMovements(
    productId?: string,
    limit: number = 50
  ): Promise<{ data: StockMovement[] | null; error: Error | null }> {
    let query = supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    return { data: asRows<StockMovement>(data), error: error as Error | null };
  },

  async createStockMovement(movement: {
    productId: string;
    movementType: string;
    quantity: number;
    notes?: string;
  }): Promise<{ data: StockMovement | null; error: Error | null }> {
    const { data: product } = await supabase
      .from('products')
      .select('current_stock')
      .eq('id', movement.productId)
      .single();

    const typedProduct = product as Pick<Product, 'current_stock'> | null;
    if (!typedProduct) {
      return { data: null, error: new Error('Product not found') };
    }

    const previousStock = typedProduct.current_stock;
    const newStock =
      movement.movementType === 'purchase' || movement.movementType === 'adjustment_increase'
        ? previousStock + movement.quantity
        : Math.max(0, previousStock - movement.quantity);

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        product_id: movement.productId,
        movement_type: movement.movementType,
        quantity: movement.quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        notes: movement.notes,
      } as any)
      .select()
      .single();

    if (!error) {
      await supabase
        .from('products')
        .update({ current_stock: newStock } as any)
        .eq('id', movement.productId);
    }

    return { data: asRow<StockMovement>(data), error: error as Error | null };
  },

  // Alert Configurations
  async getAlertConfigs(
    productId?: string
  ): Promise<{ data: StockAlertConfig[] | null; error: Error | null }> {
    let query = supabase.from('stock_alert_configs').select('*');

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    return { data: asRows<StockAlertConfig>(data), error: error as Error | null };
  },

  async createAlertConfig(config: {
    productId: string;
    alertType: 'low_stock' | 'out_of_stock' | 'restock_needed';
    threshold: number;
    notificationEmails?: string[];
  }): Promise<{ data: StockAlertConfig | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('stock_alert_configs')
      .insert({
        product_id: config.productId,
        alert_type: config.alertType,
        threshold: config.threshold,
        notification_emails: config.notificationEmails || [],
      } as any)
      .select()
      .single();

    return { data: asRow<StockAlertConfig>(data), error: error as Error | null };
  },

  async updateAlertConfig(
    configId: string,
    updates: Partial<StockAlertConfig>
  ): Promise<{ data: StockAlertConfig | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('stock_alert_configs')
      .update(updates as any)
      .eq('id', configId)
      .select()
      .single();

    return { data: asRow<StockAlertConfig>(data), error: error as Error | null };
  },

  async deleteAlertConfig(configId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('stock_alert_configs').delete().eq('id', configId);

    return { error };
  },

  // Alerts
  async getActiveAlerts(): Promise<{ data: StockAlert[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*, product:products(*)')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    return { data: asRows<StockAlert>(data), error: error as Error | null };
  },

  async resolveAlert(alertId: string): Promise<{ data: StockAlert | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('stock_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
      } as any)
      .eq('id', alertId)
      .select()
      .single();

    return { data: asRow<StockAlert>(data), error: error as Error | null };
  },

  // Real-time subscription
  subscribeToProductChanges(productId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`product:${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToStockAlerts(callback: (payload: any) => void) {
    return supabase
      .channel('stock_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_alerts',
        },
        callback
      )
      .subscribe();
  },
};

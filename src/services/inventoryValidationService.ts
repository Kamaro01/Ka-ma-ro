import { createClient } from '@/lib/supabase/client';
import { Product } from './productService';

export interface StockValidationResult {
  productId: string;
  available: boolean;
  currentStock: number;
  requestedQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  message: string;
}

export interface CartStockValidation {
  isValid: boolean;
  issues: StockValidationResult[];
  canCheckout: boolean;
}

const supabase = createClient();

export const inventoryValidationService = {
  /**
   * Check real-time stock availability for a single product
   */
  async checkProductStock(
    productId: string,
    requestedQuantity: number
  ): Promise<{ data: StockValidationResult | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, current_stock, stock_status, minimum_stock')
        .eq('id', productId)
        .single();

      if (error) {
        return { data: null, error };
      }

      if (!data) {
        return {
          data: null,
          error: new Error('Product not found'),
        };
      }

      const available = data.current_stock >= requestedQuantity;
      const stockStatus = data.stock_status as 'in_stock' | 'low_stock' | 'out_of_stock';

      let message = '';
      if (stockStatus === 'out_of_stock') {
        message = 'This product is currently out of stock';
      } else if (!available) {
        message = `Only ${data.current_stock} items available`;
      } else if (stockStatus === 'low_stock') {
        message = `Low stock: Only ${data.current_stock} items left`;
      } else {
        message = `${data.current_stock} items available`;
      }

      return {
        data: {
          productId: data.id,
          available,
          currentStock: data.current_stock,
          requestedQuantity,
          stockStatus,
          message,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Validate entire cart inventory in real-time
   */
  async validateCartStock(
    cartItems: Array<{ id: string; quantity: number }>
  ): Promise<{ data: CartStockValidation | null; error: any }> {
    try {
      if (cartItems.length === 0) {
        return {
          data: {
            isValid: true,
            issues: [],
            canCheckout: false,
          },
          error: null,
        };
      }

      const productIds = cartItems.map((item) => item.id);

      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, current_stock, stock_status, is_active')
        .in('id', productIds);

      if (error) {
        return { data: null, error };
      }

      const issues: StockValidationResult[] = [];
      let canCheckout = true;

      for (const cartItem of cartItems) {
        const product = (
          products as Array<{
            id: string;
            current_stock: number;
            stock_status: string;
            is_active: boolean;
          }> | null
        )?.find((p: { id: string }) => p.id === cartItem.id);

        if (!product) {
          issues.push({
            productId: cartItem.id,
            available: false,
            currentStock: 0,
            requestedQuantity: cartItem.quantity,
            stockStatus: 'out_of_stock',
            message: 'Product not found',
          });
          canCheckout = false;
          continue;
        }

        if (!product.is_active) {
          issues.push({
            productId: cartItem.id,
            available: false,
            currentStock: 0,
            requestedQuantity: cartItem.quantity,
            stockStatus: 'out_of_stock',
            message: 'Product is no longer available',
          });
          canCheckout = false;
          continue;
        }

        const stockStatus = product.stock_status as 'in_stock' | 'low_stock' | 'out_of_stock';
        const available = product.current_stock >= cartItem.quantity;

        if (stockStatus === 'out_of_stock' || !available) {
          let message = '';
          if (stockStatus === 'out_of_stock') {
            message = 'Currently out of stock';
          } else {
            message = `Only ${product.current_stock} items available (requested: ${cartItem.quantity})`;
          }

          issues.push({
            productId: product.id,
            available: false,
            currentStock: product.current_stock,
            requestedQuantity: cartItem.quantity,
            stockStatus,
            message,
          });
          canCheckout = false;
        } else if (stockStatus === 'low_stock') {
          issues.push({
            productId: product.id,
            available: true,
            currentStock: product.current_stock,
            requestedQuantity: cartItem.quantity,
            stockStatus,
            message: `Low stock warning: Only ${product.current_stock} items left`,
          });
        }
      }

      return {
        data: {
          isValid: issues.length === 0,
          issues,
          canCheckout,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Subscribe to real-time stock updates for products in cart
   */
  subscribeToStockUpdates(productIds: string[], callback: (payload: any) => void) {
    if (productIds.length === 0) return null;

    const subscription = supabase
      .channel('cart-stock-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=in.(${productIds.join(',')})`,
        },
        (payload: any) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Get maximum quantity allowed for a product
   */
  async getMaxQuantity(productId: string): Promise<{ data: number | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('current_stock, maximum_stock')
        .eq('id', productId)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Return the smaller of current_stock or maximum_stock (if set)
      const maxQuantity = data?.maximum_stock
        ? Math.min(data.current_stock, data.maximum_stock)
        : data?.current_stock || 0;

      return { data: maxQuantity, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

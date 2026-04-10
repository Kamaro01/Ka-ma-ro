import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database.types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row'];

export interface CreateOrderData {
  transactionRef: string;
  paymentMethod: 'mtn' | 'airtel' | 'bk' | 'equity' | 'im' | 'bpr' | 'kcb';
  items: Array<{
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    country: string;
    phone?: string;
  };
  estimatedDelivery: string;
  paymentStatus?: string;
  advancePayment?: number;
  remainingPayment?: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
}

export const orderService = {
  async generateOrderNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_order_number');
    if (error) throw error;
    return data;
  },

  async createOrder(userId: string, orderData: CreateOrderData): Promise<OrderWithItems> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const orderInsert: OrderInsert = {
      order_number: orderNumber,
      user_id: userId,
      transaction_ref: orderData.transactionRef,
      payment_method: orderData.paymentMethod,
      order_status: 'confirmed',
      shipping_status: 'pending',
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping_cost: orderData.shippingCost,
      total: orderData.total,
      shipping_address: orderData.shippingAddress,
      estimated_delivery: orderData.estimatedDelivery,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const itemsInsert: OrderItemInsert[] = orderData.items.map((item) => ({
      order_id: order.id,
      product_name: item.productName,
      product_image: item.productImage,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsInsert)
      .select();

    if (itemsError) throw itemsError;

    return {
      ...order,
      items: items || [],
      statusHistory: [],
    };
  },

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError) throw orderError;
    if (!order) return null;

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) throw itemsError;

    // Get status history
    const { data: statusHistory, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false });

    if (historyError) throw historyError;

    return {
      ...order,
      items: items || [],
      statusHistory: statusHistory || [],
    };
  },

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;
    if (!orders) return [];

    // Get all order items for these orders
    const orderIds = orders.map((order: Order) => order.id);
    const { data: allItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) throw itemsError;

    // Get status history for all orders
    const { data: allHistory, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false });

    if (historyError) throw historyError;

    // Combine data
    return orders.map((order: Order) => ({
      ...order,
      items:
        (allItems as OrderItem[] | null)?.filter((item: OrderItem) => item.order_id === order.id) ||
        [],
      statusHistory:
        (allHistory as OrderStatusHistory[] | null)?.filter(
          (history: OrderStatusHistory) => history.order_id === order.id
        ) || [],
    }));
  },

  subscribeToOrderUpdates(
    orderId: string,
    onUpdate: (order: Order) => void
  ): { unsubscribe: () => void } {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.new) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },

  subscribeToUserOrders(
    userId: string,
    onInsert: (order: Order) => void,
    onUpdate: (order: Order) => void
  ): { unsubscribe: () => void } {
    const channel = supabase
      .channel(`user-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.new) {
            onInsert(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.new) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};

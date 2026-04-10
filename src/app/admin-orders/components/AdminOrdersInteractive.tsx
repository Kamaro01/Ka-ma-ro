'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import Icon from '@/components/ui/AppIcon';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  transaction_ref: string;
  payment_method: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_status:
    | 'pending'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'failed';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    country: string;
  };
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer_email?: string;
  customer_name?: string;
}

type FilterStatus = 'all' | Order['order_status'];
type PaymentFilter = 'all' | 'paid' | 'pending';

const ORDER_STATUS_CONFIG: Record<
  Order['order_status'],
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-100' },
  processing: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-100' },
  shipped: { label: 'Shipped', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
};

const SHIPPING_STATUS_CONFIG: Record<
  Order['shipping_status'],
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending', color: 'text-gray-700', bg: 'bg-gray-100' },
  picked_up: { label: 'Picked Up', color: 'text-blue-700', bg: 'bg-blue-100' },
  in_transit: { label: 'In Transit', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-700', bg: 'bg-orange-100' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100' },
  failed: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-100' },
};

const PAID_STATUSES: Order['order_status'][] = ['confirmed', 'processing', 'shipped', 'delivered'];

export default function AdminOrdersInteractive() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, profile, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Fetch order items
      const orderIds = (ordersData as Order[]).map((o: Order) => o.id);
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // Fetch customer profiles
      const userIds = [
        ...new Set((ordersData as Order[]).map((o: Order) => o.user_id).filter(Boolean)),
      ];
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap: Record<string, { email: string; full_name: string | null }> = {};
      profilesData?.forEach((p: { id: string; email: string; full_name: string | null }) => {
        profileMap[p.id] = { email: p.email, full_name: p.full_name };
      });

      const enriched: Order[] = (ordersData as Order[]).map((order: Order) => ({
        ...order,
        items:
          (itemsData as Array<OrderItem & { order_id: string }> | null)?.filter(
            (item: OrderItem & { order_id: string }) => item.order_id === order.id
          ) || [],
        customer_email: profileMap[order.user_id]?.email || 'Unknown',
        customer_name: profileMap[order.user_id]?.full_name || 'Unknown',
      }));

      setOrders(enriched);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchOrders();
    }
  }, [user, profile, fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.new) {
            setOrders((prev) => [payload.new as Order, ...prev]);
            setLiveCount((c) => c + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.new) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === (payload.new as Order).id ? { ...o, ...(payload.new as Order) } : o
              )
            );
            setSelectedOrder((prev) =>
              prev && prev.id === (payload.new as Order).id
                ? { ...prev, ...(payload.new as Order) }
                : prev
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  const updateOrderStatus = async (
    orderId: string,
    orderStatus: Order['order_status'],
    shippingStatus: Order['shipping_status']
  ) => {
    try {
      setUpdatingOrderId(orderId);
      const { error } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_order_status: orderStatus,
        p_shipping_status: shippingStatus,
        p_notes: `Status updated by admin`,
      });
      if (error) throw error;
    } catch (err: any) {
      alert('Failed to update order: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    const isPaid = PAID_STATUSES.includes(order.order_status);
    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && isPaid) ||
      (paymentFilter === 'pending' && !isPaid);
    const matchesSearch =
      !searchQuery ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.order_status === 'pending').length,
    processing: orders.filter((o) => ['confirmed', 'processing'].includes(o.order_status)).length,
    shipped: orders.filter((o) => o.order_status === 'shipped').length,
    delivered: orders.filter((o) => o.order_status === 'delivered').length,
    revenue: orders
      .filter((o) => PAID_STATUSES.includes(o.order_status))
      .reduce((sum, o) => sum + Number(o.total), 0),
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time view of all customer orders
            {liveCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                {liveCount} new since load
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Icon name="ArrowPathIcon" size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Processing', value: stats.processing, color: 'text-purple-600' },
          { label: 'Shipped', value: stats.shipped, color: 'text-indigo-600' },
          { label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
          {
            label: 'Revenue (RWF)',
            value: `${stats.revenue.toLocaleString()}`,
            color: 'text-emerald-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 text-center"
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by order #, customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Unpaid</option>
        </select>
        <span className="text-sm text-gray-500">{filteredOrders.length} orders</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Icon name="ShoppingBagIcon" size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">
              Orders will appear here in real-time as customers place them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order #</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fulfillment</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const orderCfg = ORDER_STATUS_CONFIG[order.order_status];
                  const shipCfg = SHIPPING_STATUS_CONFIG[order.shipping_status];
                  const isPaid = PAID_STATUSES.includes(order.order_status);
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-indigo-600">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.customer_name || '—'}</p>
                        <p className="text-xs text-gray-500">{order.customer_email || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-RW', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        RWF {Number(order.total).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}
                          />
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <p className="text-xs text-gray-400 mt-1 uppercase">
                          {order.payment_method}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${orderCfg.bg} ${orderCfg.color}`}
                        >
                          {orderCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${shipCfg.bg} ${shipCfg.color}`}
                        >
                          {shipCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
                          >
                            View
                          </button>
                          {isUpdating && (
                            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order {selectedOrder.order_number}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString('en-RW')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="XMarkIcon" size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-gray-500">{selectedOrder.customer_email}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p>{selectedOrder.shipping_address?.name}</p>
                  <p>{selectedOrder.shipping_address?.street}</p>
                  <p>
                    {selectedOrder.shipping_address?.city},{' '}
                    {selectedOrder.shipping_address?.country}
                  </p>
                </div>
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-gray-500">
                            Qty: {item.quantity} × RWF {Number(item.unit_price).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          RWF {Number(item.total_price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>RWF {Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>RWF {Number(selectedOrder.tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>RWF {Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>RWF {Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Order Status</label>
                    <select
                      value={selectedOrder.order_status}
                      onChange={(e) =>
                        updateOrderStatus(
                          selectedOrder.id,
                          e.target.value as Order['order_status'],
                          selectedOrder.shipping_status
                        )
                      }
                      disabled={updatingOrderId === selectedOrder.id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fulfillment Status</label>
                    <select
                      value={selectedOrder.shipping_status}
                      onChange={(e) =>
                        updateOrderStatus(
                          selectedOrder.id,
                          selectedOrder.order_status,
                          e.target.value as Order['shipping_status']
                        )
                      }
                      disabled={updatingOrderId === selectedOrder.id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {Object.entries(SHIPPING_STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {updatingOrderId === selectedOrder.id && (
                  <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
                    Updating...
                  </p>
                )}
              </div>

              {/* Tracking */}
              {selectedOrder.tracking_number && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tracking</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p>
                      <span className="text-gray-500">Number:</span> {selectedOrder.tracking_number}
                    </p>
                    {selectedOrder.carrier && (
                      <p>
                        <span className="text-gray-500">Carrier:</span> {selectedOrder.carrier}
                      </p>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <p>
                        <span className="text-gray-500">Est. Delivery:</span>{' '}
                        {selectedOrder.estimated_delivery}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

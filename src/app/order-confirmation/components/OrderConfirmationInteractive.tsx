'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Download, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { orderService, OrderWithItems } from '@/services/orderService';
import { generateInvoicePDF } from '@/utils/pdfInvoiceGenerator';

const getStatusColor = (orderStatus: string, shippingStatus: string) => {
  if (orderStatus === 'cancelled') return 'bg-red-100 text-red-800';
  if (orderStatus === 'delivered') return 'bg-green-100 text-green-800';
  if (shippingStatus === 'in_transit') return 'bg-blue-100 text-blue-800';
  if (shippingStatus === 'out_for_delivery') return 'bg-purple-100 text-purple-800';
  return 'bg-yellow-100 text-yellow-800';
};

const getStatusText = (orderStatus: string, shippingStatus: string) => {
  if (orderStatus === 'cancelled') return 'Cancelled';
  if (orderStatus === 'delivered') return 'Delivered';
  if (shippingStatus === 'in_transit') return 'In Transit';
  if (shippingStatus === 'out_for_delivery') return 'Out for Delivery';
  if (shippingStatus === 'picked_up') return 'Picked Up';
  return 'Confirmed';
};

interface OrderConfirmationInteractiveProps {
  orderNumber: string | null;
}

export default function OrderConfirmationInteractive({
  orderNumber,
}: OrderConfirmationInteractiveProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orderNumber) {
      router.push('/home-product-showcase');
      return;
    }

    loadOrder(orderNumber);
  }, [orderNumber, router]);

  const loadOrder = async (orderNumber: string) => {
    try {
      setLoading(true);
      setError('');

      const orderData = await orderService.getOrderByNumber(orderNumber);

      if (!orderData) {
        setError('Order not found');
        return;
      }

      setOrder(orderData);

      // Subscribe to real-time updates
      const subscription = orderService.subscribeToOrderUpdates(orderData.id, (updatedOrder) => {
        setOrder((current) => {
          if (!current) return null;
          return {
            ...current,
            ...updatedOrder,
          };
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Order</h3>
            <p className="text-red-700">{error || 'Order not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      mtn: 'MTN Mobile Money',
      airtel: 'Airtel Money',
      bk: 'Bank of Kigali',
      equity: 'Equity Bank',
      im: 'I&M Bank',
      bpr: 'BPR Bank',
      kcb: 'KCB Bank',
    };
    return methods[method] || method;
  };

  const handleDownloadReceipt = () => {
    if (order) {
      generateInvoicePDF(order);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Success Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 rounded-full p-3 mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-xl font-bold text-blue-600">{order.order_number}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Transaction Reference</span>
                <span className="font-semibold">{order.transaction_ref}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold">{getPaymentMethodName(order.payment_method)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-semibold">
                  {new Date(order.created_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Status</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.order_status,
                    order.shipping_status
                  )}`}
                >
                  {getStatusText(order.order_status, order.shipping_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Receipt */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <AppImage
                      src={item.product_image || '/assets/images/no_image.png'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      Unit Price: {item.unit_price.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {item.total_price.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{order.subtotal.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (18%)</span>
                <span>{order.tax.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping_cost.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total Paid</span>
                <span className="text-green-600">{order.total.toLocaleString()} RWF</span>
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Shipping & Tracking</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                <p className="font-semibold">{order.shipping_address.name}</p>
                <p className="text-gray-700">{order.shipping_address.street}</p>
                <p className="text-gray-700">
                  {order.shipping_address.city}, {order.shipping_address.country}
                </p>
              </div>

              {order.estimated_delivery && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                  <p className="font-bold text-blue-900">{order.estimated_delivery}</p>
                </div>
              )}

              {order.tracking_number && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold">{order.tracking_number}</p>
                    </div>
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  {order.carrier && (
                    <p className="text-sm text-gray-600">Carrier: {order.carrier}</p>
                  )}
                  <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    Track Shipment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Email Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Confirmation Email Sent</h3>
                <p className="text-sm text-blue-800">
                  A detailed order confirmation has been sent to your registered email address.
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
              <button
                onClick={() => router.push('/user-account-dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                View Order Details
              </button>
              <button
                onClick={() => router.push('/home-product-showcase')}
                className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Support Contact */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your order, please contact our customer support team.
            </p>
            <button className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

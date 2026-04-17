'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { convertCurrency } from '@/utils/currencyConverter';
import OrderSummary from './OrderSummary';
import PaymentMethodSelector from './PaymentMethodSelector';
import SecurityIndicators from './SecurityIndicators';
import { orderService, CreateOrderData } from '@/services/orderService';
import { supabase } from '@/lib/supabase/client';

export default function PaymentProcessingInteractive() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const TAX_RATE = 0.18; // 18% VAT for Rwanda
  const SHIPPING_COST = 5000; // Fixed shipping cost in RWF
  const ADVANCE_PERCENTAGE = 0.3; // 30% advance payment

  const subtotal = totalAmount;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Convert to RWF (Rwandan Franc)
  const totalRWF = convertCurrency(total, 'USD', 'RWF');
  const subtotalRWF = convertCurrency(subtotal, 'USD', 'RWF');
  const taxRWF = convertCurrency(tax, 'USD', 'RWF');
  const shippingRWF = SHIPPING_COST;
  const finalTotalRWF = totalRWF + shippingRWF;
  const advancePaymentRWF = Math.ceil(finalTotalRWF * ADVANCE_PERCENTAGE);
  const remainingPaymentRWF = finalTotalRWF - advancePaymentRWF;

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!phoneNumber?.trim()) {
      setError('Please enter your phone number for order confirmation');
      return;
    }

    // Validate phone number format (basic validation for Rwanda)
    const phoneRegex = /^(07\d{8}|(\+?250)?7\d{8})$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid Rwandan phone number (07XX XXX XXX)');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      if (selectedMethod !== 'mtn' && selectedMethod !== 'airtel') {
        setError('Please choose MTN Mobile Money or Airtel Money');
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to complete your order');
        return;
      }

      // Prepare order data with mobile money payment status
      const orderData: CreateOrderData = {
        transactionRef: `MANUAL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        paymentMethod: selectedMethod,
        items: items.map((item) => ({
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: subtotalRWF,
        tax: taxRWF,
        shippingCost: shippingRWF,
        total: finalTotalRWF,
        shippingAddress: {
          name: user.user_metadata?.full_name || 'Customer Name',
          street: 'Address will be confirmed',
          city: 'Kigali',
          country: 'Rwanda',
          phone: phoneNumber,
        },
        estimatedDelivery: '3-5 business days after payment confirmation',
        paymentStatus: 'pending_advance', // Custom status for manual payments
        advancePayment: advancePaymentRWF,
        remainingPayment: remainingPaymentRWF,
      };

      // Create order in database
      const order = await orderService.createOrder(user.id, orderData);

      // Clear cart after successful order creation
      clearCart();

      // Redirect to order confirmation with order number
      router.push(`/order-confirmation?order=${order.order_number}&manual=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
      <p className="text-gray-600 mb-8">
        Mobile money only: MTN or Airtel. Submit your number, then we request the 30% advance and
        confirm the remaining 70% on delivery.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-4">
          <OrderSummary items={items} subtotal={subtotalRWF} tax={taxRWF} total={finalTotalRWF} />

          {/* Payment Breakdown */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Advance (30%):</span>
                <span className="font-semibold text-blue-900">
                  {advancePaymentRWF.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">On Delivery (70%):</span>
                <span className="font-semibold text-blue-900">
                  {remainingPaymentRWF.toLocaleString()} RWF
                </span>
              </div>
              <div className="pt-2 border-t border-blue-300 flex justify-between">
                <span className="text-blue-900 font-medium">Total:</span>
                <span className="font-bold text-blue-900">
                  {finalTotalRWF.toLocaleString()} RWF
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            advancePaymentAmount={advancePaymentRWF}
          />

          <SecurityIndicators />

          {/* Submit Order Button */}
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || !phoneNumber || processing}
            className={`mt-6 w-full py-4 rounded-lg font-bold text-lg transition-all ${
              !selectedMethod || !phoneNumber || processing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing Order...
              </span>
            ) : (
              `Submit Order - Request ${advancePaymentRWF.toLocaleString()} RWF Advance`
            )}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            By submitting, you agree that we can contact you or send a mobile money request before
            order processing
          </p>
        </div>
      </div>
    </div>
  );
}

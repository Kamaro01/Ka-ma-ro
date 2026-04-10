import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon, EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

interface PaymentConfirmationProps {
  transactionRef: string;
  amount: number;
  paymentMethod: string;
}

const paymentMethodNames: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  airtel: 'Airtel Money',
  bk: 'Bank of Kigali',
  equity: 'Equity Bank',
  im: 'I&M Bank',
  bpr: 'Bank Populaire du Rwanda',
  kcb: 'KCB Bank',
};

export default function PaymentConfirmation({
  transactionRef,
  amount,
  paymentMethod,
}: PaymentConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction Reference</span>
              <span className="font-semibold text-gray-900">{transactionRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-semibold text-gray-900">{amount?.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold text-gray-900">
                {paymentMethodNames[paymentMethod] || paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-RW')}
              </span>
            </div>
          </div>
        </div>

        {/* Email Receipt Notice */}
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-8">
          <EnvelopeIcon className="w-5 h-5" />
          <p className="text-sm">A receipt has been sent to your email address</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/user-account-dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5" />
            View Order History
          </Link>
          <Link
            href="/home-product-showcase"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

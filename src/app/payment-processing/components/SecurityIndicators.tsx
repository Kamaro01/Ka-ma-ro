import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function SecurityIndicators() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Secure Payment</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <LockClosedIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">SSL Encrypted</h3>
            <p className="text-xs text-gray-600">Your data is protected with 256-bit encryption</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">PCI Compliant</h3>
            <p className="text-xs text-gray-600">Payment Card Industry security standards</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckBadgeIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Paystack Verified</h3>
            <p className="text-xs text-gray-600">Powered by trusted payment partner</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-600 text-center">
          Your payment information is never stored on our servers. All transactions are processed
          securely through Paystack.
        </p>
      </div>
    </div>
  );
}

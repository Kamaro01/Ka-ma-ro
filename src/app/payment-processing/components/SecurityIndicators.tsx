import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function SecurityIndicators() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Mobile Money Order Protection</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <LockClosedIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Private Confirmation</h3>
            <p className="text-xs text-gray-600">
              Your phone number is used only to confirm your MTN or Airtel payment.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Manual Review</h3>
            <p className="text-xs text-gray-600">
              We check the advance payment before processing and delivering the order.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckBadgeIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Delivery Balance</h3>
            <p className="text-xs text-gray-600">
              You pay the remaining 70% only when the delivery is completed.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-600 text-center">
          No online checkout payment is collected here. After you submit the order, complete the mobile money
          advance and we will confirm it before processing.
        </p>
      </div>
    </div>
  );
}

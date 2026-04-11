import React from 'react';
import AppImage from '@/components/ui/AppImage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  partnerFulfillment?: boolean;
  supplierName?: string;
  availabilityNote?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export default function OrderSummary({ items, subtotal, tax, total }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items?.map?.((item) => (
          <div key={item?.id} className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              {item?.image && (
                <AppImage
                  src={item.image}
                  alt={item?.name || 'Product image'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item?.name}</h3>
              <p className="text-sm text-gray-600">Qty: {item?.quantity}</p>
              {item?.partnerFulfillment && (
                <p className="mt-1 text-xs text-blue-700">
                  Partner item: {item.availabilityNote || 'availability confirmed after order'}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {((item?.price || 0) * (item?.quantity || 1)).toFixed(2)} RWF
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{subtotal?.toLocaleString()} RWF</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>VAT (18%)</span>
          <span>{tax?.toLocaleString()} RWF</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
          <span>Total</span>
          <span>{total?.toLocaleString()} RWF</span>
        </div>
      </div>
    </div>
  );
}

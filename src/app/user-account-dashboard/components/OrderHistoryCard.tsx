'use client';

import React from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Download } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { OrderWithItems } from '@/services/orderService';
import { generateInvoicePDF } from '@/utils/pdfInvoiceGenerator';

type DisplayOrder = Pick<
  OrderWithItems,
  'id' | 'order_number' | 'order_status' | 'created_at' | 'total'
> & {
  items: Array<{
    id: string;
    product_name?: string;
    product_image?: string | null;
    quantity: number;
    total_price?: number;
    name?: string;
    image?: string;
    price?: number;
    alt?: string;
  }>;
  statusHistory?: OrderWithItems['statusHistory'];
  trackingNumber?: string;
};

interface OrderHistoryCardProps {
  order: DisplayOrder;
  onViewDetails?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onTrack?: (trackingNumber: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'processing':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    default:
      return <Package className="w-5 h-5 text-blue-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default function OrderHistoryCard({
  order,
  onViewDetails,
  onReorder,
  onTrack,
}: OrderHistoryCardProps) {
  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (Array.isArray(order.statusHistory)) {
      generateInvoicePDF(order as OrderWithItems);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(order.order_status)}
          <div>
            <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                dateStyle: 'medium',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              order.order_status
            )}`}
          >
            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {order.items?.slice(0, 2).map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <AppImage
                src={item.product_image || item.image || '/assets/images/no_image.png'}
                alt={item.product_name || item.name || 'Product image'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {item.product_name || item.name || 'Product'}
              </p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              <p className="text-sm font-semibold text-gray-900">
                {Number(item.total_price ?? (item.price || 0) * item.quantity).toLocaleString()} RWF
              </p>
            </div>
          </div>
        ))}
        {order.items && order.items.length > 2 && (
          <p className="text-sm text-gray-600 pl-19">+{order.items.length - 2} more items</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">{order.total.toLocaleString()} RWF</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Invoice
          </button>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View Details
              <Truck className="w-4 h-4" />
            </button>
          )}
          {!onViewDetails && onReorder && (
            <button
              onClick={() => onReorder(order.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Reorder
              <Truck className="w-4 h-4" />
            </button>
          )}
          {!onViewDetails && onTrack && order.trackingNumber && (
            <button
              onClick={() => onTrack(order.trackingNumber!)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
            >
              Track
              <Truck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

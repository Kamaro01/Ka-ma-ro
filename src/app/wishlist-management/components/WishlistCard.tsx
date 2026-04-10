'use client';

import { useState } from 'react';
import { WishlistItemWithProduct } from '@/types/models';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface WishlistCardProps {
  item: WishlistItemWithProduct;
  onRemove: (itemId: string) => void;
  onMoveToCart: (itemId: string) => void;
  onUpdatePriority: (itemId: string, priority: number) => void;
  onSetPriceAlert: (itemId: string, targetPrice: number) => void;
}

export default function WishlistCard({
  item,
  onRemove,
  onMoveToCart,
  onUpdatePriority,
  onSetPriceAlert,
}: WishlistCardProps) {
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [targetPrice, setTargetPrice] = useState(item?.product?.price?.toString() || '');

  const handleSetAlert = () => {
    const price = parseFloat(targetPrice);
    if (!isNaN(price) && price > 0) {
      onSetPriceAlert(item?.id, price);
      setShowPriceAlert(false);
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600';
      case 'low_stock':
        return 'text-yellow-600';
      case 'out_of_stock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <Link href={`/product-detail-page?id=${item?.product?.id}`}>
        <div className="relative h-48 bg-gray-100">
          <AppImage
            src={item?.product?.imageUrl || '/assets/images/no_image.png'}
            alt={item?.product?.imageAlt || item?.product?.name || 'Product image'}
            className="w-full h-full object-cover"
          />
          {item?.priceAlert?.isActive && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Price Alert
            </div>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/product-detail-page?id=${item?.product?.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
            {item?.product?.name}
          </h3>
        </Link>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-blue-600">${item?.product?.price?.toFixed(2)}</p>
            <p className={`text-sm ${getStockStatusColor(item?.product?.stockStatus || '')}`}>
              {getStockStatusText(item?.product?.stockStatus || '')}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>
                {item?.product?.averageRating?.toFixed(1)} ({item?.product?.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="mb-3">
          <label className="text-sm text-gray-600 block mb-1">Priority</label>
          <select
            value={item?.priority}
            onChange={(e) => onUpdatePriority(item?.id, parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="0">None</option>
            <option value="1">Low</option>
            <option value="3">Medium</option>
            <option value="5">High</option>
          </select>
        </div>

        {/* Notes */}
        {item?.notes && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 italic line-clamp-2">Note: {item.notes}</p>
          </div>
        )}

        {/* Price Alert Section */}
        {showPriceAlert ? (
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <label className="text-sm text-gray-600 block mb-1">
              Alert me when price drops to:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Target price"
              />
              <button
                onClick={handleSetAlert}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Set
              </button>
              <button
                onClick={() => setShowPriceAlert(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : item?.priceAlert?.isActive ? (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-gray-700">
              Alert set for ${item.priceAlert.targetPrice.toFixed(2)}
            </p>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onMoveToCart(item?.id)}
            disabled={item?.product?.stockStatus === 'out_of_stock'}
            className={`flex-1 px-4 py-2 rounded font-semibold ${
              item?.product?.stockStatus === 'out_of_stock'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Add to Cart
          </button>
          <button
            onClick={() => setShowPriceAlert(!showPriceAlert)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded font-semibold hover:bg-blue-50"
            title="Set Price Alert"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          <button
            onClick={() => onRemove(item?.id)}
            className="px-4 py-2 border border-red-600 text-red-600 rounded font-semibold hover:bg-red-50"
            title="Remove from Wishlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Added Date */}
        <p className="text-xs text-gray-500 mt-3">
          Added {new Date(item?.addedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

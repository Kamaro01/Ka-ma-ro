'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { formatPrice } from '@/utils/currencyConverter';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  currencyCode: string;
  inStock: boolean;
  onAddToCart: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  alt,
  currencyCode,
  inStock,
  onAddToCart,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(id);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <AppImage src={image} alt={alt} className="w-full h-full object-cover" />
        {!inStock && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-body font-medium text-base text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-lg text-gray-900">
            {formatPrice(price, currencyCode)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-colors ${
            inStock
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <>
              <Icon name="CheckIcon" size={18} />
              <span>Added</span>
            </>
          ) : (
            <>
              <Icon name="ShoppingCartIcon" size={18} />
              <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

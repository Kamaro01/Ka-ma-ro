'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  MinusIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_alt: string | null;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  current_stock: number;
  average_rating: number;
  review_count: number;
}

interface MenuProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function MenuProductCard({ product, onAddToCart }: MenuProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getStockStatusConfig = () => {
    switch (product.stock_status) {
      case 'in_stock':
        return {
          icon: CheckCircleIcon,
          text: 'In Stock',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'low_stock':
        return {
          icon: ExclamationTriangleIcon,
          text: `Only ${product.current_stock} left`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      case 'out_of_stock':
        return {
          icon: XCircleIcon,
          text: 'Out of Stock',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
    }
  };

  const stockConfig = getStockStatusConfig();
  const StockIcon = stockConfig.icon;
  const isAvailable = product.stock_status !== 'out_of_stock';
  const maxQuantity = product.stock_status === 'low_stock' ? product.current_stock : 10;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAvailable) return;

    setIsAdding(true);
    try {
      onAddToCart(product, quantity);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setQuantity(1);
      }, 2000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
      {/* Product Image */}
      <Link
        href={`/product-detail-page?id=${product.id}`}
        className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden bg-muted"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.image_alt || product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            title="Add to wishlist"
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Stock Status Badge */}
        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full ${stockConfig.bgColor} ${stockConfig.borderColor} border backdrop-blur-sm`}
        >
          <StockIcon className={`h-4 w-4 ${stockConfig.color}`} />
          <span className={`text-xs font-medium ${stockConfig.color}`}>{stockConfig.text}</span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1">
          {/* Title and Rating */}
          <div className="mb-2">
            <Link href={`/product-detail-page?id=${product.id}`}>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star}>
                      {star <= Math.round(product.average_rating) ? (
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.review_count})</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
          )}

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary">
              FRW {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quantity Selector and Add to Cart */}
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {isAvailable ? (
            <>
              {/* Quantity Selector */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || showSuccess}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showSuccess ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              disabled
              className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

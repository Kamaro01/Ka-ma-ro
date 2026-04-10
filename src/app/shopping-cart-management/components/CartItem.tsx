'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  alt: string;
  currency: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  // Stock validation props
  currentStock?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockMessage?: string;
  isAvailable?: boolean;
}

const CartItem = ({
  id,
  name,
  price,
  quantity,
  image,
  alt,
  currency,
  onUpdateQuantity,
  onRemove,
  currentStock,
  stockStatus,
  stockMessage,
  isAvailable = true,
}: CartItemProps) => {
  const handleIncrement = () => {
    // Check if we can increment based on current stock
    if (currentStock !== undefined && quantity >= currentStock) {
      return; // Don't allow increment beyond available stock
    }
    onUpdateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(id, quantity - 1);
    }
  };

  const itemTotal = price * quantity;

  // Determine stock status styling
  const getStockStatusColor = () => {
    if (!isAvailable || stockStatus === 'out_of_stock') return 'text-error';
    if (stockStatus === 'low_stock') return 'text-warning';
    return 'text-success';
  };

  const isOutOfStock = !isAvailable || stockStatus === 'out_of_stock';
  const isOverStock = currentStock !== undefined && quantity > currentStock;
  const canIncrement = currentStock === undefined || quantity < currentStock;

  return (
    <div
      className={`flex gap-4 p-4 bg-card rounded-lg elevation-1 transition-smooth hover:elevation-2 ${
        isOutOfStock || isOverStock ? 'border-2 border-error' : ''
      }`}
    >
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        <AppImage
          src={image}
          alt={alt}
          className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-error/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-error bg-white px-2 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-heading font-semibold text-base text-foreground line-clamp-2">
            {name}
          </h3>
          <button
            onClick={() => onRemove(id)}
            className="touch-target flex items-center justify-center transition-smooth hover:bg-muted rounded-md active:scale-97 flex-shrink-0"
            aria-label={`Remove ${name} from cart`}
          >
            <Icon name="TrashIcon" size={20} className="text-error" />
          </button>
        </div>

        <p className="font-data text-sm text-muted-foreground mb-2">
          {price.toLocaleString()} {currency}
        </p>

        {/* Stock Status Indicator */}
        {stockMessage && (
          <div className={`flex items-center gap-2 mb-3 ${getStockStatusColor()}`}>
            <Icon
              name={isOutOfStock ? 'ExclamationTriangleIcon' : 'InformationCircleIcon'}
              size={16}
            />
            <span className="text-xs font-medium">{stockMessage}</span>
          </div>
        )}

        {/* Quantity exceeds stock warning */}
        {isOverStock && !isOutOfStock && (
          <div className="flex items-center gap-2 mb-3 text-error">
            <Icon name="ExclamationTriangleIcon" size={16} />
            <span className="text-xs font-medium">
              Requested quantity exceeds available stock ({currentStock} available)
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-muted rounded-md p-1">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || isOutOfStock}
              className="touch-target flex items-center justify-center w-8 h-8 transition-smooth hover:bg-background rounded active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Icon name="MinusIcon" size={16} className="text-foreground" />
            </button>
            <span
              className={`font-data font-medium text-sm min-w-[32px] text-center ${
                isOverStock ? 'text-error' : 'text-foreground'
              }`}
            >
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={!canIncrement || isOutOfStock}
              className="touch-target flex items-center justify-center w-8 h-8 transition-smooth hover:bg-background rounded active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
              title={!canIncrement ? `Maximum stock: ${currentStock}` : ''}
            >
              <Icon name="PlusIcon" size={16} className="text-foreground" />
            </button>
          </div>

          <div className="flex flex-col items-end">
            <p
              className={`font-data font-semibold text-base ${
                isOutOfStock ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}
            >
              {currency} {itemTotal.toFixed(2)}
            </p>
            {currentStock !== undefined && currentStock > 0 && !isOutOfStock && (
              <span className="text-xs text-muted-foreground">{currentStock} in stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

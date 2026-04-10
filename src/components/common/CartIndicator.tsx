'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';

const CartIndicator = () => {
  const { itemCount } = useCart();

  return (
    <Link
      href="/shopping-cart-management"
      className="touch-target relative flex items-center justify-center transition-smooth hover:bg-muted rounded-md active:scale-97"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <Icon name="ShoppingCartIcon" size={24} className="text-foreground" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-accent text-accent-foreground text-xs font-data font-medium rounded-full elevation-1">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIndicator;

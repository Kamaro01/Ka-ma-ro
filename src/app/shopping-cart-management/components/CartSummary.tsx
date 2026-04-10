'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface CartSummaryProps {
  subtotal: number;
  currency: string;
  itemCount: number;
  canCheckout?: boolean;
  isValidating?: boolean;
}

const CartSummary = ({
  subtotal,
  currency,
  itemCount,
  canCheckout = true,
  isValidating = false,
}: CartSummaryProps) => {
  const router = useRouter();
  const shipping = 0; // Free shipping for demonstration
  const tax = subtotal * 0.18; // 18% VAT for Rwanda
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!canCheckout) {
      return; // Prevent checkout if stock validation failed
    }
    router.push('/payment-processing');
  };

  return (
    <div className="bg-card rounded-lg p-6 elevation-1 sticky top-24">
      <h2 className="font-heading font-semibold text-xl text-foreground mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="caption text-muted-foreground">Items ({itemCount})</span>
          <span className="font-data text-sm text-foreground">
            {subtotal.toLocaleString()} {currency}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="caption text-muted-foreground">Shipping</span>
          <span className="font-data text-sm text-foreground">Calculated at checkout</span>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="font-heading font-semibold text-lg text-foreground">Subtotal</span>
          <span className="font-data font-semibold text-xl text-foreground">
            {subtotal.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      <p className="caption text-muted-foreground text-center mb-4">
        Taxes and shipping calculated at checkout
      </p>

      <button
        onClick={handleCheckout}
        disabled={!canCheckout || isValidating}
        className="w-full button-primary py-3 px-6 rounded-md font-heading font-semibold text-base transition-smooth active:scale-97 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Proceed to checkout"
      >
        {isValidating ? (
          <>
            <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
            <span>Validating Stock...</span>
          </>
        ) : !canCheckout ? (
          <>
            <Icon name="ExclamationTriangleIcon" size={20} />
            <span>Stock Unavailable</span>
          </>
        ) : (
          <>
            <span>Proceed to Checkout</span>
            <Icon name="ArrowRightIcon" size={20} />
          </>
        )}
      </button>

      {!canCheckout && !isValidating && (
        <p className="text-xs text-error text-center mt-2">
          Please resolve stock issues before checkout
        </p>
      )}

      <button className="w-full touch-target mt-3 bg-muted text-foreground font-body font-medium text-sm rounded-md transition-smooth hover:bg-muted/80 active:scale-97">
        Continue Shopping
      </button>
    </div>
  );
};

export default CartSummary;

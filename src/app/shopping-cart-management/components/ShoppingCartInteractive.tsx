'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import { inventoryValidationService } from '@/services/inventoryValidationService';
import Icon from '@/components/ui/AppIcon';

interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

const ShoppingCartInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { items, updateQuantity, removeItem, totalAmount, itemCount, updateItemStock } = useCart();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'RWF',
    symbol: 'FRW',
    rate: 1,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [canCheckout, setCanCheckout] = useState(true);
  const [stockIssues, setStockIssues] = useState<string[]>([]);
  const [showStockAlert, setShowStockAlert] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(JSON.parse(savedCurrency));
    }
  }, []);

  // Validate cart stock on mount and when items change
  const validateCartStock = useCallback(async () => {
    if (items.length === 0) {
      setCanCheckout(false);
      return;
    }

    setIsValidating(true);
    const cartItems = items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    const { data: validation, error } =
      await inventoryValidationService.validateCartStock(cartItems);

    if (error) {
      setStockIssues(['Unable to validate stock. Please try again.']);
      setShowStockAlert(true);
      setIsValidating(false);
      return;
    }

    if (validation) {
      setCanCheckout(validation.canCheckout);

      // Update each cart item with stock information
      validation.issues.forEach((issue) => {
        updateItemStock(issue.productId, {
          currentStock: issue.currentStock,
          stockStatus: issue.stockStatus,
          stockMessage: issue.message,
          isAvailable: issue.available,
        });
      });

      // Also update items with no issues to show stock availability
      const itemsWithoutIssues = items.filter(
        (item) => !validation.issues.find((issue) => issue.productId === item.id)
      );

      for (const item of itemsWithoutIssues) {
        const { data: stockCheck } = await inventoryValidationService.checkProductStock(
          item.id,
          item.quantity
        );
        if (stockCheck) {
          updateItemStock(item.id, {
            currentStock: stockCheck.currentStock,
            stockStatus: stockCheck.stockStatus,
            stockMessage: stockCheck.message,
            isAvailable: stockCheck.available,
          });
        }
      }

      // Show alert if there are blocking issues
      const blockingIssues = validation.issues.filter((issue) => !issue.available);
      if (blockingIssues.length > 0) {
        setStockIssues(blockingIssues.map((issue) => issue.message));
        setShowStockAlert(true);
      } else {
        setShowStockAlert(false);
      }
    }

    setIsValidating(false);
  }, [items, updateItemStock]);

  useEffect(() => {
    if (isHydrated && items.length > 0) {
      validateCartStock();
    }
  }, [isHydrated, items.length]); // Only validate when length changes, not on every item update

  // Set up real-time stock updates
  useEffect(() => {
    if (!isHydrated || items.length === 0) return;

    const productIds = items.map((item) => item.id);
    const subscription = inventoryValidationService.subscribeToStockUpdates(
      productIds,
      (payload) => {
        // Re-validate cart when stock updates occur
        validateCartStock();
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [isHydrated, items, validateCartStock]);

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    updateQuantity(id, quantity);

    // Validate the specific item's new quantity
    const { data: stockCheck } = await inventoryValidationService.checkProductStock(id, quantity);
    if (stockCheck) {
      updateItemStock(id, {
        currentStock: stockCheck.currentStock,
        stockStatus: stockCheck.stockStatus,
        stockMessage: stockCheck.message,
        isAvailable: stockCheck.available,
      });

      if (!stockCheck.available) {
        setCanCheckout(false);
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    // Re-validate cart after removal
    setTimeout(() => validateCartStock(), 100);
  };

  const convertedTotal = totalAmount * selectedCurrency.rate;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
                Shopping Cart
              </h1>
              <p className="caption text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {isValidating && (
              <div className="flex items-center gap-2 text-accent">
                <div className="animate-spin">
                  <Icon name="ArrowPathIcon" size={20} />
                </div>
                <span className="text-sm font-medium">Checking stock...</span>
              </div>
            )}
          </div>
        </div>

        {/* Stock Alert Banner */}
        {showStockAlert && stockIssues.length > 0 && (
          <div className="mb-6 bg-error/10 border-2 border-error rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon
                name="ExclamationTriangleIcon"
                size={24}
                className="text-error flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-base text-error mb-2">
                  Stock Availability Issues
                </h3>
                <ul className="space-y-1">
                  {stockIssues.map((issue, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-error">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Please adjust quantities or remove unavailable items to proceed with checkout.
                </p>
              </div>
              <button
                onClick={() => setShowStockAlert(false)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss alert"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price * selectedCurrency.rate}
                quantity={item.quantity}
                image={
                  item.image || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'
                }
                alt={`Product image of ${item.name}`}
                currency={selectedCurrency.symbol}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                currentStock={item.currentStock}
                stockStatus={item.stockStatus}
                stockMessage={item.stockMessage}
                isAvailable={item.isAvailable}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              subtotal={convertedTotal}
              currency={selectedCurrency.symbol}
              itemCount={itemCount}
              canCheckout={canCheckout}
              isValidating={isValidating}
            />
          </div>
        </div>

        <div className="mt-12 bg-card rounded-lg p-6 elevation-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="ShieldCheckIcon" size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-base text-foreground mb-2">
                Real-Time Inventory Protection
              </h3>
              <p className="caption text-muted-foreground">
                Stock availability is verified in real-time to prevent purchasing out-of-stock
                items. You&apos;ll always see the current availability before completing your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartInteractive;

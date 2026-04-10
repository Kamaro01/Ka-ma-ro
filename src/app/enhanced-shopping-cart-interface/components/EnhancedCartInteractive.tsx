'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  maxStock?: number;
}

const EnhancedCartInteractive = () => {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const [removedItems, setRemovedItems] = useState<CartItem[]>([]);
  const [showUndo, setShowUndo] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number, maxStock?: number) => {
    if (newQuantity < 1) return;
    if (maxStock && newQuantity > maxStock) {
      alert(`Only ${maxStock} items available in stock`);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (item: CartItem) => {
    setRemovedItems([...removedItems, item]);
    removeItem(item.id);
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 5000);
  };

  const handleUndoRemove = () => {
    if (removedItems.length > 0) {
      const lastRemoved = removedItems[removedItems.length - 1];
      updateQuantity(lastRemoved.id, lastRemoved.quantity);
      setRemovedItems(removedItems.slice(0, -1));
      setShowUndo(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <button
            onClick={() => router.push('/home-product-showcase')}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-smooth"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-8">Shopping Cart</h1>

        {showUndo && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent rounded-lg flex items-center justify-between">
            <span className="text-sm text-foreground">Item removed from cart</span>
            <button
              onClick={handleUndoRemove}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-smooth"
            >
              Undo
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex gap-4">
                  <img
                    src={
                      item.image ||
                      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'
                    }
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-heading font-semibold text-lg text-foreground">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="p-2 hover:bg-error/10 rounded-lg transition-smooth"
                      >
                        <svg
                          className="w-5 h-5 text-error"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      FRW {item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1, item.maxStock)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-background rounded-lg transition-smooth"
                        >
                          <svg
                            className="w-5 h-5 text-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>

                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 1,
                              item.maxStock
                            )
                          }
                          className="w-16 text-center bg-transparent border-none focus:outline-none font-semibold text-foreground"
                          min="1"
                          max={item.maxStock}
                        />

                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1, item.maxStock)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-background rounded-lg transition-smooth"
                        >
                          <svg
                            className="w-5 h-5 text-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      <p className="font-semibold text-lg text-foreground">
                        FRW {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {item.maxStock && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.maxStock} items available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 elevation-1 sticky top-8">
              <h2 className="font-heading font-bold text-xl text-foreground mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    FRW {totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (0%)</span>
                  <span className="font-semibold text-foreground">FRW 0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-sm text-accent">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-muted pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-xl text-foreground">
                    FRW {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/payment-processing')}
                className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-smooth mb-3"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => router.push('/home-product-showcase')}
                className="w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCartInteractive;

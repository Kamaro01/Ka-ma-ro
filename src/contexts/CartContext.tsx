'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/services/storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  partnerFulfillment?: boolean;
  supplierName?: string;
  availabilityNote?: string;
  maxStock?: number;
  // Stock validation fields
  currentStock?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockMessage?: string;
  isAvailable?: boolean;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  // Stock validation methods
  updateItemStock: (id: string, stockData: Partial<CartItem>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCart = storage.get('ka-ma-ro-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      storage.set('ka-ma-ro-cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
    quantity: number = item.quantity ?? 1
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    storage.remove('ka-ma-ro-cart');
  };

  const isInCart = (id: string) => {
    return items.some((item) => item.id === id);
  };

  // New method to update stock information
  const updateItemStock = (id: string, stockData: Partial<CartItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, ...stockData } : item))
    );
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isInCart,
        updateItemStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

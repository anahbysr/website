"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  qty: number;
  maxStock?: number;
  customizationValue?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, customizationValue?: string) => void;
  updateQuantity: (productId: string, size: string, qty: number, customizationValue?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const stored = localStorage.getItem('anah-cart');
    if (stored) {
      try {
        // Hydrate persisted cart on mount. Done in an effect (not a lazy
        // useState initializer) so the server render stays empty and matches
        // the client's first paint — avoiding a hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  useEffect(() => {
    // Skip the first run so we don't overwrite the stored cart before it loads.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('anah-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find((i) => (
        i.productId === item.productId
        && i.size === item.size
        && i.customizationValue === item.customizationValue
      ));
      if (existing) {
        const nextQty = Math.min(getStockLimit(existing.maxStock), existing.qty + item.qty);
        return prev.map(i => i === existing ? { ...i, qty: nextQty, customizationValue: item.customizationValue || i.customizationValue } : i);
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, size: string, customizationValue?: string) => {
    setItems((prev) => prev.filter((i) => !(
      i.productId === productId
      && i.size === size
      && i.customizationValue === customizationValue
    )));
  };

  const updateQuantity = (productId: string, size: string, qty: number, customizationValue?: string) => {
    setItems(prev => prev.map(i => {
      if (i.productId === productId && i.size === size && i.customizationValue === customizationValue) {
        return { ...i, qty: Math.max(1, Math.min(getStockLimit(i.maxStock), qty)) };
      }
      return i;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

function getStockLimit(stock?: number) {
  return stock && stock > 0 ? stock : Number.POSITIVE_INFINITY;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

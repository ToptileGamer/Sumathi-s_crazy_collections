// src/hooks/useCart.js
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  getCart, addToCart, updateCartQuantity, removeFromCart, clearCart,
} from '../services/cartService';
import { useAuth } from './useAuth';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch cart ──────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const data = await getCart(user.id);
      setItems(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── Realtime subscription ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('cart-changes')
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'cart_items',
        filter: `user_id=eq.${user.id}`,
      }, fetchCart)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, fetchCart]);

  // ── Actions ─────────────────────────────────────────────
  const add = async (productId, quantity = 1) => {
    if (!user) return;
    await addToCart(user.id, productId, quantity);
    await fetchCart();
  };

  const update = async (productId, quantity) => {
    if (!user) return;
    await updateCartQuantity(user.id, productId, quantity);
    await fetchCart();
  };

  const remove = async (productId) => {
    if (!user) return;
    await removeFromCart(user.id, productId);
    await fetchCart();
  };

  const clear = async () => {
    if (!user) return;
    await clearCart(user.id);
    setItems([]);
  };

  // ── Derived ─────────────────────────────────────────────
  const count    = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, count, subtotal, add, update, remove, clear, refresh: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

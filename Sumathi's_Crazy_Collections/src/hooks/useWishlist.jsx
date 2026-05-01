// src/hooks/useWishlist.js
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { useAuth } from './useAuth';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const data = await getWishlist(user.id);
      setItems(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const add = async (productId) => {
    if (!user) return;
    await addToWishlist(user.id, productId);
    await fetchWishlist();
  };

  const remove = async (productId) => {
    if (!user) return;
    await removeFromWishlist(user.id, productId);
    setItems(prev => prev.filter(i => i.product?.id !== productId));
  };

  const toggle = async (productId) => {
    const inWishlist = items.some(i => i.product?.id === productId);
    inWishlist ? await remove(productId) : await add(productId);
  };

  const isWishlisted = (productId) => items.some(i => i.product?.id === productId);

  return (
    <WishlistContext.Provider value={{ items, loading, add, remove, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}

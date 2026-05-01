// src/services/cartService.js
import { supabase } from '../lib/supabaseClient';

// ── Fetch cart ────────────────────────────────────────────
export async function getCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id, quantity,
      product:products(
        id, name, slug, price, original_price, stock,
        images:product_images(url, is_primary)
      )
    `)
    .eq('user_id', userId)
    .order('created_at');
  if (error) throw error;
  return data;
}

// ── Add to cart (or increment) ────────────────────────────
export async function addToCart(userId, productId, quantity = 1) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      {
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Update quantity ───────────────────────────────────────
export async function updateCartQuantity(userId, productId, quantity) {
  if (quantity <= 0) return removeFromCart(userId, productId);

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Remove from cart ──────────────────────────────────────
export async function removeFromCart(userId, productId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

// ── Clear cart ────────────────────────────────────────────
export async function clearCart(userId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// ── Get cart count ────────────────────────────────────────
export async function getCartCount(userId) {
  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}

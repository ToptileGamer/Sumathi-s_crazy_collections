// src/services/wishlistService.js
import { supabase } from '../lib/supabaseClient';

export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      product:products(
        id, name, slug, price, original_price,
        images:product_images(url, is_primary)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addToWishlist(userId, productId) {
  const { data, error } = await supabase
    .from('wishlists')
    .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromWishlist(userId, productId) {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function isInWishlist(userId, productId) {
  const { count } = await supabase
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('product_id', productId);
  return (count ?? 0) > 0;
}

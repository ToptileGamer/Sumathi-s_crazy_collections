// src/services/reviewService.js
import { supabase } from '../lib/supabaseClient';

export async function getReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, title, body, is_verified, created_at,
      user:profiles(full_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addReview(review) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReview(reviewId, updates) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReview(reviewId) {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

// ── Check if user purchased product (for verified badge) ─
export async function hasUserPurchased(userId, productId) {
  const { count } = await supabase
    .from('order_items')
    .select('id, order:orders!inner(user_id, status)', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('order.user_id', userId)
    .in('order.status', ['paid', 'processing', 'shipped', 'delivered']);
  return (count ?? 0) > 0;
}

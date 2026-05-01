// src/services/orderService.js
import { supabase } from '../lib/supabaseClient';

// ── Get user orders ───────────────────────────────────────
export async function getOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      address:addresses(*),
      items:order_items(
        id, product_name, product_image, price, quantity, line_total
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Get single order ──────────────────────────────────────
export async function getOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      address:addresses(*),
      items:order_items(
        id, product_name, product_image, price, quantity, line_total,
        product:products(id, slug)
      )
    `)
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
}

// ── Initiate checkout via Edge Function ───────────────────
export async function initiateCheckout({ cartItems, addressId, notes }) {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { cartItems, addressId, notes },
  });
  if (error) throw error;
  return data;
}

// ── Verify payment via Edge Function ─────────────────────
export async function verifyPayment(payload) {
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: payload,
  });
  if (error) throw error;
  return data;
}

// ── Address management ────────────────────────────────────
export async function getAddresses(userId) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addAddress(userId, address) {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...address, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(addressId) {
  const { error } = await supabase.from('addresses').delete().eq('id', addressId);
  if (error) throw error;
}

export async function setDefaultAddress(userId, addressId) {
  // Unset all
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  // Set this one
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

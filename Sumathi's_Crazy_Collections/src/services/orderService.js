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
        id, product_id, product_name, product_image, price, quantity, line_total
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
        id, product_id, product_name, product_image, price, quantity, line_total,
        product:products(id, slug)
      )
    `)
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
}

// ── Initiate checkout via Supabase Edge Function ──────────
export async function initiateCheckout({ cartItems, addressId, notes }) {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { cartItems, addressId, notes },
  });
  if (error) {
    let details = error.message || 'Failed to create order';
    try {
      if (error.context instanceof Response) {
        const body = await error.context.json();
        if (body?.details) details = `${body.error}: ${body.details}`;
        else if (body?.error) details = body.error;
      } else if (typeof error.context === 'object' && error.context?.error) {
        details = error.context.error;
      }
    } catch {}
    throw new Error(details);
  }
  return data;
}

// ── Verify payment via Supabase Edge Function ─────────────
export async function verifyPayment(payload) {
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: payload,
  });
  if (error) {
    let details = error.message || 'Payment verification failed';
    try {
      if (error.context instanceof Response) {
        const body = await error.context.json();
        if (body?.error) details = body.error;
      } else if (typeof error.context === 'object' && error.context?.error) {
        details = error.context.error;
      }
    } catch {}
    throw new Error(details);
  }
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
// Add this new function at bottom
// COD order creation now runs server-side in the edge function — prices, stock
// and totals are computed from the DB there, never trusted from the client.
export async function createCODOrder({ cartItems, addressId }) {
  const { data, error } = await supabase.functions.invoke('create-cod-order', {
    body: { cartItems, addressId },
  });
  if (error) {
    let details = error.message || 'Failed to create order';
    try {
      if (error.context instanceof Response) {
        const body = await error.context.json();
        if (body?.error) details = body.error;
      } else if (typeof error.context === 'object' && error.context?.error) {
        details = error.context.error;
      }
    } catch {}
    throw new Error(details);
  }
  return data.order;
}

// ── Cancel order (server-side with stock restoration) ─────
export async function cancelOrder(orderId, userId) {
  const { data, error } = await supabase.functions.invoke('cancel-order', {
    body: { orderId },
  });
  if (error) {
    let details = error.message || 'Failed to cancel order';
    try {
      if (error.context instanceof Response) {
        const body = await error.context.json();
        if (body?.error) details = body.error;
      } else if (typeof error.context === 'object' && error.context?.error) {
        details = error.context.error;
      }
    } catch {}
    throw new Error(details);
  }
  return data;
}
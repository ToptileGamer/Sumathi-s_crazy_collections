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

// ── Initiate checkout via Edge Function ───────────────────
// export async function initiateCheckout({ cartItems, addressId, notes }) {
//   const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
//     body: { cartItems, addressId, notes },
//   });
//   if (error) throw error;
//   return data;
// }
// 
// // ── Verify payment via Edge Function ─────────────────────
// export async function verifyPayment(payload) {
//   const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
//     body: payload,
//   });
//   if (error) throw error;
//   return data;
// }

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
export async function createCODOrder({ cartItems, addressId, userId }) {
  // Fetch real prices from DB (never trust client)
  const productIds = cartItems.map(i => i.product_id);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .in("id", productIds)
    .eq("is_active", true);
  if (error) throw error;

  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  let subtotal = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const product = productMap[item.product_id];
    if (!product) throw new Error(`Product not found`);
    if (product.stock < item.quantity) throw new Error(`${product.name} is out of stock`);
    subtotal += product.price * item.quantity;
    orderItems.push({
      product_id:   product.id,
      product_name: product.name,
      price:        product.price,
      quantity:     item.quantity,
    });
  }

  const shippingAmount = subtotal >= 999 ? 0 : 99;
  const totalAmount    = subtotal + shippingAmount;

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id:         userId,
      address_id:      addressId,
      status:          "pending",
      subtotal,
      shipping_amount: shippingAmount,
      total_amount:    totalAmount,
      payment_method:  "cod",
    })
    .select().single();
  if (orderErr) throw orderErr;

  // Insert order items
  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItems.map(i => ({ ...i, order_id: order.id })));
  if (itemsErr) throw itemsErr;

  // Clear cart
  await supabase.from("cart_items").delete().eq("user_id", userId);

  return order;
}

// ── Cancel order ──────────────────────────────────────────
export async function cancelOrder(orderId, reason) {
  // We update the status to cancelled.
  // We use .select() without .single() and check data.length to avoid PGRST116 when 0 rows are updated.
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .select();

  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Could not cancel order. You might not have permission, or the order doesn't exist.");
  }
  return data[0];
}
// src/services/adminService.js
import { supabase } from '../lib/supabaseClient';

// ── Dashboard stats ───────────────────────────────────────
export async function getDashboardStats() {
  const [orders, products, customers, revenue] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('total_amount').in('status', ['paid', 'processing', 'shipped', 'delivered']),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce((s, o) => s + Number(o.total_amount), 0);

  return {
    totalOrders:    orders.count    ?? 0,
    totalProducts:  products.count  ?? 0,
    totalCustomers: customers.count ?? 0,
    totalRevenue,
  };
}

// ── All orders (admin) ────────────────────────────────────
export async function getAllOrders({ status = null, page = 1, limit = 20 } = {}) {
  let query = supabase
    .from('orders')
    .select(`
  *,
  user:profiles(full_name, id),
address:addresses(full_name, phone, line1, city, state, pincode),
  items:order_items(product_name, quantity, line_total)
`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: data, total: count };
}

// ── Update order status ───────────────────────────────────
export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── All products (admin, including inactive) ──────────────
export async function getAllProducts({ page = 1, limit = 20 } = {}) {
  const { data, error, count } = await supabase
    .from('products')
    .select('*, category:categories(name), images:product_images(url, is_primary)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { products: data, total: count };
}

// ── Set admin role ────────────────────────────────────────
export async function setAdminRole(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);
  if (error) throw error;
}

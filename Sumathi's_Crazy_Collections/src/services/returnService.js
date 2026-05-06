import { supabase } from '../lib/supabaseClient';

export async function requestReturn(orderId, userId, reason) {
  const { data, error } = await supabase
    .from('return_requests')
    .insert({ order_id: orderId, user_id: userId, reason })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getUserReturns(userId) {
  const { data, error } = await supabase
    .from('return_requests')
    .select('*, order:orders(order_number, total_amount)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllReturns() {
  const { data, error } = await supabase
    .from('return_requests')
    .select('*, order:orders(order_number, total_amount), user:profiles(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateReturnStatus(id, status) {
  const { data, error } = await supabase
    .from('return_requests')
    .update({ status })
    .eq('id', id)
    .select().single();
  if (error) throw error;
  return data;
}
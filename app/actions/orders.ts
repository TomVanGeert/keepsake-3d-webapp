'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';

/**
 * Get orders for the current user
 */
export async function getUserOrders() {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single order by ID (user's own orders only)
 */
export async function getUserOrderById(orderId: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}


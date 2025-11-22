'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/types';

/**
 * Get all orders (admin only)
 */
export async function getAllOrders() {
  const user = await getCurrentUser();
  
  if (!user?.profile?.is_admin) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      profiles (full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single order by ID (admin only)
 */
export async function getOrderById(orderId: string) {
  const user = await getCurrentUser();
  
  if (!user?.profile?.is_admin) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      profiles (full_name, email)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return data;
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const user = await getCurrentUser();
  
  if (!user?.profile?.is_admin) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/orders/${orderId}`);
}


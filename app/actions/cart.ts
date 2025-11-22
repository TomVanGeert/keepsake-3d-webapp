'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CartItem, Size } from '@/types';

export interface CartItemWithId extends CartItem {
  id: string;
}

/**
 * Get cart items from session storage (client-side)
 * This is a placeholder - in production, you might want to store cart in database
 */
export async function getCartItems(): Promise<CartItemWithId[]> {
  // Cart is stored client-side in sessionStorage
  // This function is mainly for type consistency
  return [];
}

/**
 * Add item to cart
 * In this MVP, cart is stored client-side, but we validate the pricing server-side
 */
export async function validateCartItem(
  size: Size,
  price: number
): Promise<{ valid: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: pricing } = await supabase
    .from('pricing_config')
    .select('price')
    .eq('size', size)
    .single();

  if (!pricing) {
    return { valid: false, error: 'Invalid size' };
  }

  const expectedPrice = Number(pricing.price);
  if (Math.abs(price - expectedPrice) > 0.01) {
    return { valid: false, error: 'Price mismatch' };
  }

  return { valid: true };
}


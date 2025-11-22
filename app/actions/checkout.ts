'use server';

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import type { CartItem, ShippingAddress } from '@/types';
import { headers } from 'next/headers';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

/**
 * Get the base URL for the current environment
 */
async function getBaseUrl(): Promise<string> {
  // In production on Vercel, use VERCEL_URL (automatically set)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Use NEXT_PUBLIC_APP_URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Try to get from headers
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Headers might not be available
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

export interface CreateCheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  cartItems: CartItem[],
  shippingAddress: ShippingAddress
): Promise<CreateCheckoutSessionResult> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { success: false, error: 'You must be logged in to checkout' };
    }

    if (cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Calculate total
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Custom ${item.size} Keychain`,
          description: `Custom 3D printed keychain - ${item.size}`,
          images: item.converted_image_url ? [item.converted_image_url] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const baseUrl = await getBaseUrl();

    // Create checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: user.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
      metadata: {
        userId: user.id,
        cartItems: JSON.stringify(cartItems),
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}

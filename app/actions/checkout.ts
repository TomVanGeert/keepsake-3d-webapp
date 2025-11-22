'use server';

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import type { CartItem, ShippingAddress } from '@/types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

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
          images: item.convertedImageUrl ? [item.convertedImageUrl] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
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


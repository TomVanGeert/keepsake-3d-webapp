import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { generate3MFFile } from '@/app/actions/generate-3mf';
import type { CartItem } from '@/types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutSession(session);
    } catch (error) {
      console.error('Error handling checkout session:', error);
      return NextResponse.json(
        { error: 'Failed to process order' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  const userId = session.metadata?.userId;
  const cartItemsJson = session.metadata?.cartItems;
  const shippingAddressJson = session.metadata?.shippingAddress;

  if (!userId || !cartItemsJson) {
    throw new Error('Missing required metadata');
  }

  const cartItems: CartItem[] = JSON.parse(cartItemsJson);
  const shippingAddress = shippingAddressJson ? JSON.parse(shippingAddressJson) : null;

  // Calculate total
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      status: 'pending',
      total_amount: totalAmount,
      shipping_address: shippingAddress,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Create order items and generate 3MF files
  for (const item of cartItems) {
    // Generate 3MF file
    let threeMfFileUrl: string | null = null;
    
    if (item.converted_image_url) {
      const result = await generate3MFFile(item.converted_image_url, item.size);
      if (result.success && result.threeMfFileUrl) {
        threeMfFileUrl = result.threeMfFileUrl;
      }
    }

    // Create order item
    await supabase.from('order_items').insert({
      order_id: order.id,
      is_custom: true,
      original_image_url: item.original_image_url,
      converted_image_url: item.converted_image_url,
      three_mf_file_url: threeMfFileUrl,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    });
  }

  // Update order status to processing
  await supabase
    .from('orders')
    .update({ status: 'processing' })
    .eq('id', order.id);

  // TODO: Send email notifications
  // This would be implemented using Resend or Supabase Edge Functions
  console.log('Order created:', order.id);
}


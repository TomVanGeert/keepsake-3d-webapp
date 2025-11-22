/**
 * Script to set up Stripe webhook endpoint
 * Run this after deploying to production to configure the webhook
 * 
 * Usage: npx tsx scripts/setup-stripe-webhook.ts
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function setupWebhook() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`;
  
  console.log(`Setting up webhook endpoint: ${webhookUrl}`);
  
  try {
    // List existing webhooks
    const existingWebhooks = await stripe.webhookEndpoints.list({
      limit: 100,
    });
    
    // Check if webhook already exists
    const existingWebhook = existingWebhooks.data.find(
      (webhook) => webhook.url === webhookUrl
    );
    
    if (existingWebhook) {
      console.log('Webhook already exists:', existingWebhook.id);
      console.log('Webhook secret:', existingWebhook.secret);
      console.log('\nAdd this to your .env file:');
      console.log(`STRIPE_WEBHOOK_SECRET=${existingWebhook.secret}`);
      return;
    }
    
    // Create new webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
      ],
      description: 'Keepsake 3D - Order processing webhook',
    });
    
    console.log('Webhook created successfully!');
    console.log('Webhook ID:', webhook.id);
    console.log('Webhook secret:', webhook.secret);
    console.log('\nAdd this to your .env file:');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  } catch (error) {
    console.error('Error setting up webhook:', error);
    throw error;
  }
}

setupWebhook()
  .then(() => {
    console.log('\nWebhook setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup webhook:', error);
    process.exit(1);
  });


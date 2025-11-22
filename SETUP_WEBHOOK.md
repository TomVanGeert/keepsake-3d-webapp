# Stripe Webhook Setup Guide

## Option 1: Using the Setup Script (Recommended)

After deploying to production, run:

```bash
# Set your environment variables
export STRIPE_SECRET_KEY=sk_live_...
export NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Run the setup script
npx tsx scripts/setup-stripe-webhook.ts
```

This will:
1. Check if a webhook already exists for your URL
2. Create a new webhook if it doesn't exist
3. Display the webhook secret to add to your environment variables

## Option 2: Manual Setup via Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded` (optional, for delayed payment methods)
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Option 3: Using Stripe CLI (for testing)

For local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret for local development.

## Verify Webhook is Working

1. Make a test purchase
2. Check your Stripe Dashboard > Webhooks > Your endpoint
3. You should see successful event deliveries
4. Check your application logs for order creation

## Troubleshooting

- **Webhook not receiving events**: Check that the URL is publicly accessible
- **Signature verification failed**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- **Events not processing**: Check application logs and ensure the webhook handler is working correctly


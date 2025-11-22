# Deployment Guide

## Prerequisites

1. **Supabase Project**: Already set up at project ID `azriosdfhdmmmroqiksx`
   - ✅ Database schema applied
   - ✅ RLS policies configured
   - ✅ Storage buckets created (`images` and `3mf-files`)

2. **Stripe Account**: Create a Stripe account and get API keys
3. **Vercel Account**: Sign up at vercel.com

## Environment Variables

Set these in your Vercel project settings:

```env
# Next.js
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://azriosdfhdmmmroqiksx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmlvc2RmaGRtbW1yb3Fpa3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzE2MjksImV4cCI6MjA3OTMwNzYyOX0.L_f-6vxlXby31VoKG5_QqekWKw5p0Fvq-jbqJliMEhg
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (set after webhook creation)

# Email (Optional - for notifications)
RESEND_API_KEY=re_...
ADMIN_EMAIL=your-email@example.com
```

## Supabase Storage Setup

✅ **Already completed!** The following buckets have been created:
- `images` (public, 10MB limit) - for original and converted images
- `3mf-files` (public, 50MB limit) - for generated 3MF files

## Stripe Webhook Setup

After deploying to Vercel, set up the webhook:

### Option 1: Using the Setup Script (Recommended)

```bash
# After deployment, run:
export STRIPE_SECRET_KEY=sk_live_...
export NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
npx tsx scripts/setup-stripe-webhook.ts
```

This will create the webhook and display the secret to add to your environment variables.

### Option 2: Manual Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded` (optional)
5. Copy the signing secret and add to `STRIPE_WEBHOOK_SECRET` in Vercel

See `SETUP_WEBHOOK.md` for detailed instructions.

## Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (see above)
4. Deploy

## Post-Deployment Checklist

- [ ] Verify Supabase storage buckets are accessible
- [ ] Test user registration/login
- [ ] Test image upload and conversion
- [ ] Set up Stripe webhook (see above)
- [ ] Test checkout flow with Stripe test cards
- [ ] Verify webhook receives events
- [ ] Test order processing and 3MF generation
- [ ] Set up email notifications (optional)

## Making a User Admin

To make a user an admin, run this SQL in Supabase:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'user-uuid-here';
```

Replace `user-uuid-here` with the actual user ID from `auth.users`.

## Testing

### Test Cards (Stripe Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Flow
1. Register a new account
2. Upload an image
3. Select size and add to cart
4. Complete checkout with test card
5. Verify order appears in admin dashboard
6. Check that 3MF file is generated

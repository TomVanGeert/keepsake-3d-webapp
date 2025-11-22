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
NEXT_PUBLIC_APP_URL=https://keepsake-3d-webapp.vercel.app

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

## Supabase Authentication Configuration

### Option 1: Using the Configuration Script (Recommended)

After deploying to Vercel, configure authentication URLs:

```bash
# Get your Supabase access token from:
# https://supabase.com/dashboard/account/tokens

export SUPABASE_ACCESS_TOKEN=your-access-token
export PROJECT_ID=azriosdfhdmmmroqiksx
export SITE_URL=https://keepsake-3d-webapp.vercel.app

npx tsx scripts/configure-supabase-auth.ts
```

This will automatically configure:
- Site URL: `https://keepsake-3d-webapp.vercel.app`
- Redirect URLs:
  - `https://keepsake-3d-webapp.vercel.app/auth/callback`
  - `https://keepsake-3d-webapp.vercel.app/**`
  - `http://localhost:3000/auth/callback` (for local dev)
  - `http://localhost:3000/**` (for local dev)

### Option 2: Manual Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/azriosdfhdmmmroqiksx)
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to: `https://keepsake-3d-webapp.vercel.app`
4. Add **Redirect URLs**:
   - `https://keepsake-3d-webapp.vercel.app/auth/callback`
   - `https://keepsake-3d-webapp.vercel.app/**`
   - `http://localhost:3000/auth/callback` (for local development)
   - `http://localhost:3000/**` (for local development)

## Stripe Webhook Setup

After deploying to Vercel, set up the webhook:

### Option 1: Using the Setup Script (Recommended)

```bash
# After deployment, run:
export STRIPE_SECRET_KEY=sk_live_...
export NEXT_PUBLIC_APP_URL=https://keepsake-3d-webapp.vercel.app
npx tsx scripts/setup-stripe-webhook.ts
```

This will create the webhook and display the secret to add to your environment variables.

### Option 2: Manual Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter URL: `https://keepsake-3d-webapp.vercel.app/api/webhooks/stripe`
4. Select events: `checkout.session.completed`
5. Copy the webhook signing secret and add it to Vercel as `STRIPE_WEBHOOK_SECRET`

## Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set all environment variables in Vercel project settings
4. Deploy

The application will automatically detect the production URL using `VERCEL_URL` (automatically set by Vercel).

## Post-Deployment Checklist

- [ ] Configure Supabase Authentication URLs (use script or manual)
- [ ] Set up Stripe webhook (use script or manual)
- [ ] Verify environment variables are set in Vercel
- [ ] Test user registration and email confirmation
- [ ] Test checkout flow end-to-end

# Supabase Authentication Configuration

## Issue: Magic Link Redirects to Root Instead of Callback

If magic links are redirecting to `/` instead of `/auth/callback`, you need to configure Supabase's Site URL.

## Solution: Configure Supabase Site URL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/azriosdfhdmmmroqiksx
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to: `http://localhost:3000` (for local development)
4. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (wildcard for any path)

For production, set:
- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**:
  - `https://your-domain.vercel.app/auth/callback`
  - `https://your-domain.vercel.app/**`

## How It Works

The application now handles authentication codes in two places:

1. **Primary**: `/auth/callback` route - the intended callback handler
2. **Fallback**: Home page (`/`) - catches codes if Supabase redirects to root

If Supabase redirects to `/` with a code parameter, the home page will automatically redirect to `/auth/callback` to complete authentication.

## Testing

After configuring Supabase:
1. Request a magic link
2. Click the link in your email
3. You should be redirected to `/auth/callback` (or `/` which then redirects to `/auth/callback`)
4. After successful authentication, you'll be redirected to the home page (or the `next` parameter if provided)

## Debugging

Check the server logs for:
- `Successfully authenticated user: [user-id]` - confirms authentication worked
- `Created profile for user: [user-id]` - confirms profile was created
- `Redirecting to: [path]` - shows where you'll be redirected after login

If you see errors, check:
- Supabase Site URL matches your app URL
- Redirect URLs are properly configured
- Environment variables are set correctly


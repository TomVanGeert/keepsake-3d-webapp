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

The application handles authentication codes in two places:

1. **Primary**: `/auth/callback` route - the intended callback handler
2. **Fallback**: Home page (`/`) - catches codes if Supabase redirects to root and uses a Server Action to exchange the code

If Supabase redirects to `/` with a code parameter, the home page will automatically exchange it using a Server Action, which ensures cookies are set properly.

## Common Issues

### "Link expired or invalid" Error

This error typically occurs when:

1. **Code Already Used**: The code can only be used once. If you click the link multiple times, the second attempt will fail.
2. **Code Expired**: Magic link codes expire after a certain time (usually 1 hour). Request a new magic link.
3. **Wrong Redirect URL**: If Supabase's Site URL doesn't match your app URL, the code might not work correctly.

**Solutions**:
- Request a fresh magic link
- Ensure Supabase Site URL matches your app URL exactly
- Check that you're clicking the link within the expiration window
- Clear browser cookies and try again

### Authentication Not Working After Code Exchange

If the code exchange succeeds but you're still not authenticated:

1. **Check Browser Cookies**: Ensure cookies are enabled in your browser
2. **Check Server Logs**: Look for "Successfully authenticated user" messages
3. **Clear Cookies**: Try clearing all cookies for localhost and logging in again
4. **Check Supabase Dashboard**: Verify the user was created in Authentication → Users

## Testing

After configuring Supabase:
1. Request a magic link
2. Click the link in your email **once** (don't refresh or click again)
3. Check the server console logs — you should see:
   - `Successfully authenticated user: [user-id]`
   - `Redirecting to: [path]`
4. You should be redirected to the home page (or the `next` parameter if provided)

## Debugging

Check the server logs for:
- `Successfully authenticated user: [user-id]` - confirms authentication worked
- `Created profile for user: [user-id]` - confirms profile was created
- `Redirecting to: [path]` - shows where you'll be redirected after login
- `Error exchanging code for session: [error]` - shows what went wrong

If you see errors, check:
- Supabase Site URL matches your app URL exactly
- Redirect URLs are properly configured
- Environment variables are set correctly (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- The code hasn't been used already (request a new magic link)

## Important Notes

- **Magic link codes can only be used once** - clicking the same link twice will fail
- **Codes expire** - request a new magic link if yours has expired
- **Site URL must match exactly** - `http://localhost:3000` for local, your production URL for production
- **Cookies must be enabled** - authentication requires browser cookies to work

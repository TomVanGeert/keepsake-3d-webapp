# Supabase Authentication Configuration

## Production URL Configuration

The application now automatically detects the correct URL for email confirmation links using the following priority:

1. **VERCEL_URL** (automatically set by Vercel in production)
2. **NEXT_PUBLIC_APP_URL** (if manually set)
3. **Request headers** (fallback)
4. **localhost:3000** (development fallback)

This ensures that confirmation links always use the correct production URL.

## Supabase Dashboard Configuration

### 1. Site URL Configuration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/azriosdfhdmmmroqiksx
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to your production URL:
   - **Production**: `https://keepsake-3d-webapp.vercel.app`
   - **Local Development**: `http://localhost:3000`

### 2. Redirect URLs

Add the following redirect URLs in Supabase:

**For Production:**
- `https://keepsake-3d-webapp.vercel.app/auth/callback`
- `https://keepsake-3d-webapp.vercel.app/**` (wildcard for any path)

**For Local Development:**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/**` (wildcard for any path)

## How Email Confirmation Works

1. **User Signs Up**: Account is created immediately
2. **Confirmation Email Sent**: Supabase sends email with confirmation link
3. **User Clicks Link**: 
   - Link redirects to `/auth/callback` with a code
   - Code is exchanged for a session
   - User is authenticated and redirected
4. **If Link Expired**: User sees a helpful message that account was created and can sign in

## Environment Variables

Make sure these are set in Vercel:

```env
# Production URL (optional - VERCEL_URL is automatically set)
NEXT_PUBLIC_APP_URL=https://keepsake-3d-webapp.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://azriosdfhdmmmroqiksx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: `VERCEL_URL` is automatically set by Vercel, so you don't need to configure it manually. The application will use it automatically in production.

## Troubleshooting

### Confirmation Link Redirects to Localhost

**Cause**: Supabase Site URL is set to localhost, or `NEXT_PUBLIC_APP_URL` is not set correctly.

**Solution**:
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Ensure Site URL matches your production URL
3. Verify `NEXT_PUBLIC_APP_URL` is set in Vercel (or rely on automatic `VERCEL_URL`)

### "Link expired or invalid" Error

This is normal if:
- The link was already used (one-time use)
- The link expired (usually after 1 hour)

**Solution**: The account is still created. User can sign in with email/password.

### Code Exchange Fails

If you see errors in the callback route:
1. Check server logs for specific error messages
2. Verify Supabase redirect URLs include your production domain
3. Ensure cookies are enabled in the browser
4. Try requesting a new confirmation email

## Testing

### Local Development
1. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`
2. Configure Supabase Site URL to `http://localhost:3000`
3. Sign up and check email for confirmation link

### Production
1. Ensure `VERCEL_URL` is available (automatic) or set `NEXT_PUBLIC_APP_URL`
2. Configure Supabase Site URL to your production URL
3. Sign up and verify confirmation link uses production URL

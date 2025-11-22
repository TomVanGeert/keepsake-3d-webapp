# Local Development Setup

## Prerequisites

1. Node.js 18+ installed
2. Supabase project set up
3. Environment variables configured in `.env.local`

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## Supabase Configuration for Local Development

### 1. Disable Email Confirmation (for local testing)

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", disable **"Enable email confirmations"**
3. This allows you to test authentication without needing to click email links

### 2. Configure Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (wildcard for any path)

### 3. Email Template Configuration (Optional)

If you want to test with real emails:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Edit the "Magic Link" template to include the code: `{{ .Token }}`
3. See `SUPABASE_EMAIL_SETUP.md` for details

## Running the Development Server

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing Authentication

### Without Email Confirmation (Recommended for Local Dev)

1. Request a magic link
2. Check the Supabase Dashboard → Authentication → Users
3. You should see the user created immediately
4. The magic link will work without email confirmation

### With Email Confirmation

1. Enable email confirmations in Supabase
2. Request a magic link
3. Check your email (or Supabase logs)
4. Click the magic link
5. You should be authenticated

## Troubleshooting

### "Link expired or invalid" Error

- **Cause**: The code might be expired or already used
- **Solution**: Request a new magic link
- **Check**: Supabase Dashboard → Authentication → Users → Check if user exists

### Authentication Not Working

1. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
2. Verify Supabase Site URL matches `http://localhost:3000`
3. Check browser console and server logs for errors
4. Ensure cookies are enabled in your browser

### Code Exchange Failing

- Check server logs for specific error messages
- Verify the code hasn't been used already
- Make sure the redirect URL in Supabase matches your app URL
- Try requesting a fresh magic link

## Development Tips

- Use browser DevTools to inspect cookies and network requests
- Check Supabase Dashboard → Authentication → Logs for auth events
- Server logs will show authentication flow details
- Clear browser cookies if authentication seems stuck

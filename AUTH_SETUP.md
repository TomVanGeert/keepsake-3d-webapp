# Authentication Setup Guide - Magic Link

## Overview

The authentication system uses **Supabase Magic Link** authentication. Users enter their email and receive a secure link to sign in - no passwords required! This works for both new user registration and existing user sign-in.

## How It Works

### 1. User Registration/Sign-In Flow

1. User enters their email (and optionally their name for registration)
2. Server Action `sendMagicLink` sends a magic link to the email
3. User clicks the link in their email
4. They're redirected to `/auth/callback` which exchanges the code for a session
5. Database trigger automatically creates profile in `profiles` table (if new user)
6. User is redirected to the home page, fully authenticated

### 2. Magic Link Process

- **Same flow for registration and sign-in**: Magic link works for both new and existing users
- **Email required**: Users must have access to their email to sign in
- **Secure**: Links expire after use and have time limits
- **No passwords**: Eliminates password-related security issues

### 3. Profile Creation

Profiles are automatically created via database trigger when a user first signs in. The trigger:
- Extracts `full_name` from user metadata (if provided during registration)
- Sets `is_admin` to `false`
- Handles conflicts gracefully

**Fallback**: If the trigger doesn't fire, the code has fallbacks:
- During callback: Admin client creates profile if missing
- During getCurrentUser: Profile is created if missing

## Database Trigger

The trigger is defined in `supabase/migrations/005_auto_create_profile_trigger.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Important**: This trigger must be applied to your Supabase database. Run the migration SQL in your Supabase SQL Editor.

## Local Development

### Email Settings

In local development, Supabase sends magic link emails. To test:

1. **Check Supabase Dashboard**: Go to Authentication → Logs to see magic link emails
2. **Use real email**: You'll need a real email address to receive the magic link
3. **Email templates**: Customize email templates in Supabase Dashboard → Authentication → Email Templates

### Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: `NEXT_PUBLIC_APP_URL` must match your local development URL for magic links to work correctly.

## Testing the Auth Flow

### Test Registration

1. Go to `/register`
2. Enter email (and optionally name)
3. Click "Send magic link"
4. Check your email for the magic link
5. Click the link
6. You should be redirected to `/auth/callback` then to `/` (home page)
7. You should be signed in

### Test Sign-In

1. Go to `/login`
2. Enter your email
3. Click "Send magic link"
4. Check your email for the magic link
5. Click the link
6. You should be redirected to `/auth/callback` then to `/` (home page)
7. You should be signed in

## Troubleshooting

### Magic Link Not Received

1. **Check spam folder**: Magic links might go to spam
2. **Check Supabase logs**: Go to Authentication → Logs in Supabase Dashboard
3. **Verify email settings**: Ensure email is enabled in Supabase
4. **Check email templates**: Verify templates are configured correctly

### Profile Not Created

If profiles aren't being created:

1. **Check the trigger exists**: Run this in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Manually create trigger**: Run the migration SQL from `005_auto_create_profile_trigger.sql`

3. **Check RLS policies**: Ensure the trigger function has `SECURITY DEFINER` (it does)

### Redirect Errors

The `NEXT_REDIRECT` errors are normal - they're how Next.js handles redirects. The form components ignore them.

### Callback Not Working

1. **Check `NEXT_PUBLIC_APP_URL`**: Must match your actual URL
2. **Verify callback route**: Should be `/auth/callback`
3. **Check Supabase redirect URLs**: Add your callback URL to allowed redirect URLs in Supabase Dashboard

## Production Considerations

1. **Email Configuration**: Set up proper SMTP in Supabase for production emails
2. **Redirect URLs**: Add production callback URL to Supabase allowed redirects
3. **Email Templates**: Customize email templates for your brand
4. **Rate Limiting**: Supabase handles this automatically
5. **Link Expiration**: Magic links expire after use and have time limits

## Making a User Admin

To make a user an admin, run this SQL in Supabase:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'user-uuid-here';
```

You can find the user UUID in the Supabase Dashboard → Authentication → Users.

## Benefits of Magic Link Authentication

- ✅ **No passwords to manage**: Eliminates password-related security issues
- ✅ **Better UX**: Users don't need to remember passwords
- ✅ **Secure**: Links are single-use and time-limited
- ✅ **Works for both sign-up and sign-in**: Same flow for new and existing users
- ✅ **Email verification built-in**: Users must verify their email to sign in

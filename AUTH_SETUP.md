# Authentication Setup Guide

## Overview

The authentication system uses Supabase Auth with automatic profile creation via database triggers. This ensures reliable user registration and profile management.

## How It Works

### 1. User Registration Flow

1. User fills out registration form
2. Server Action `signUp` creates user in Supabase Auth
3. Database trigger automatically creates profile in `profiles` table
4. User is redirected based on email confirmation settings:
   - If email confirmation is disabled: User is immediately signed in → redirects to `/`
   - If email confirmation is enabled: User sees "check email" message → redirects to `/register?message=check-email`

### 2. Email Confirmation (if enabled)

1. User receives confirmation email
2. Clicks link → redirects to `/auth/callback?code=...`
3. Callback route exchanges code for session
4. Profile is verified/created if needed
5. User is redirected to home page

### 3. Profile Creation

Profiles are automatically created via database trigger when a user signs up. The trigger:
- Extracts `full_name` from user metadata
- Sets `is_admin` to `false`
- Handles conflicts gracefully

**Fallback**: If the trigger doesn't fire, the code has fallbacks:
- During signup: Admin client creates profile
- During signin: Profile is created if missing
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

### Email Confirmation Settings

In local development, Supabase might require email confirmation. To disable it:

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", toggle "Enable email confirmations" OFF
3. This allows immediate sign-in after registration

### Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing the Auth Flow

### Test Registration

1. Go to `/register`
2. Fill out the form
3. Submit
4. If email confirmation is disabled: You should be immediately signed in and redirected to `/`
5. If email confirmation is enabled: You'll see "check email" message

### Test Login

1. Go to `/login`
2. Enter credentials
3. Submit
4. You should be signed in and redirected to `/`

### Test Email Confirmation (if enabled)

1. Register a new account
2. Check your email
3. Click the confirmation link
4. You should be redirected to `/auth/callback` then to `/`

## Troubleshooting

### Profile Not Created

If profiles aren't being created:

1. **Check the trigger exists**: Run this in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Manually create trigger**: Run the migration SQL from `005_auto_create_profile_trigger.sql`

3. **Check RLS policies**: Ensure the trigger function has `SECURITY DEFINER` (it does)

### "User already registered" Error

This means the email is already in use. The user should sign in instead.

### Redirect Errors

The `NEXT_REDIRECT` errors are normal - they're how Next.js handles redirects. The form components ignore them.

### Foreign Key Violations

If you see foreign key violations, the trigger might not be firing. Ensure:
1. The trigger is created
2. The trigger function has `SECURITY DEFINER`
3. The function has proper permissions

## Production Considerations

1. **Email Confirmation**: Enable it in production for security
2. **Rate Limiting**: Supabase handles this automatically
3. **Password Requirements**: Currently minimum 6 characters (consider increasing)
4. **Profile Creation**: The trigger ensures profiles are always created

## Making a User Admin

To make a user an admin, run this SQL in Supabase:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'user-uuid-here';
```

You can find the user UUID in the Supabase Dashboard → Authentication → Users.


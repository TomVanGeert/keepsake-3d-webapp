# Local Development Setup

## Email Confirmation Issue

In local development, Supabase doesn't send real emails by default. You have two options:

### Option 1: Disable Email Confirmation (Recommended for Local Dev)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/azriosdfhdmmmroqiksx
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Email Auth**
4. **Disable** "Enable email confirmations"
5. Save changes

After this, users will be immediately signed in after registration (no email needed).

### Option 2: Use Supabase Local Email Testing

1. In Supabase Dashboard → Authentication → Settings
2. Enable "Enable email confirmations"
3. Check the "Email Templates" section
4. Supabase will show you confirmation links in the dashboard logs

### Option 3: Use Magic Link (Alternative)

You can also use magic link authentication which doesn't require email confirmation in the same way.

## Current Behavior

- If email confirmation is **disabled**: Users are immediately signed in → redirected to `/`
- If email confirmation is **enabled**: Users see "check email" message → need to click link in email

## Testing Without Email

If you want to test the full flow without emails:

1. Disable email confirmation in Supabase (Option 1 above)
2. Register a new account
3. You should be immediately signed in and redirected to `/`

## Production

In production, you should:
- Enable email confirmation for security
- Configure proper email settings
- Set up custom SMTP if needed


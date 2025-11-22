import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';

  // Handle errors from Supabase (e.g., expired links)
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
        requestUrl.origin
      )
    );
  }

  if (!code) {
    // No code provided - redirect to login
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  const supabase = await createClient();
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Error exchanging code for session:', exchangeError);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(exchangeError.message || 'Failed to authenticate')}`,
        requestUrl.origin
      )
    );
  }

  if (!data.session || !data.user) {
    // No session created
    return NextResponse.redirect(
      new URL('/login?error=Failed to create session', requestUrl.origin)
    );
  }

  // Ensure profile exists after email confirmation
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist (for magic link, this is the first time user signs in)
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || null,
          is_admin: false,
        });
    }
  } catch (profileError) {
    // Profile might already exist from trigger, or there's an error
    // Log but don't fail - the trigger should handle it
    console.error('Profile creation error in callback (may be handled by trigger):', profileError);
  }

  // Successfully authenticated - redirect to home
  // The session cookies are already set by exchangeCodeForSession
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

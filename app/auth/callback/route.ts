import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';
  const type = requestUrl.searchParams.get('type'); // 'signup' or 'recovery'

  // Handle errors from Supabase (e.g., expired links)
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    
    // If the link is expired or invalid, check if we can still help the user
    if (error === 'access_denied' || errorDescription?.includes('expired') || errorDescription?.includes('invalid')) {
      // Try to extract email from the error or token if possible
      // For now, just redirect with a helpful message
      return NextResponse.redirect(
        new URL(
          `/login?message=link-expired&error=expired&error_description=${encodeURIComponent('The confirmation link has expired or has already been used. Your account has been created - please sign in with your email and password.')}`,
          requestUrl.origin
        )
      );
    }
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

  // Create response first - we'll modify it with cookies
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  // Create Supabase client for route handler with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookies in the response with proper options
            response.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          });
        },
      },
    }
  );

  // Exchange code for session
  // This works for both email confirmation and magic link codes
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Error exchanging code for session:', exchangeError);
    
    // Check if the error is about expired/invalid code
    const isExpiredOrInvalid = 
      exchangeError.message.includes('expired') || 
      exchangeError.message.includes('invalid') || 
      exchangeError.message.includes('already been used') ||
      exchangeError.message.includes('code has expired') ||
      exchangeError.message.includes('Token has expired') ||
      exchangeError.message.includes('Invalid token');

    if (isExpiredOrInvalid) {
      // The code is expired/invalid, but the account might still be created
      // Try to check if we can get any user info from the code
      // For email confirmation, the account is created immediately, so user can sign in
      console.log('Code expired/invalid, but account may exist. Redirecting to login.');
      
      return NextResponse.redirect(
        new URL(
          `/login?message=link-expired&error=expired&error_description=${encodeURIComponent('The confirmation link has expired or has already been used. Your account has been created - please sign in with your email and password.')}`,
          requestUrl.origin
        )
      );
    }
    
    // Other errors - redirect to login with error message
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(exchangeError.message || 'Failed to authenticate')}`,
        requestUrl.origin
      )
    );
  }

  if (!data.session || !data.user) {
    // No session created - but account might still be created
    // Redirect to login with message that they can sign in
    console.log('No session after code exchange, but account may exist. Redirecting to login.');
    return NextResponse.redirect(
      new URL('/login?message=link-expired', requestUrl.origin)
    );
  }

  console.log('Successfully authenticated user:', data.user.id);

  // Ensure profile exists after email confirmation
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const adminSupabase = createAdminClient();
      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || null,
          is_admin: false,
        });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log('Created profile for user:', data.user.id);
      }
    }
  } catch (profileError) {
    // Profile might already exist from trigger, or there's an error
    // Log but don't fail - the trigger should handle it
    console.error('Profile creation error in callback (may be handled by trigger):', profileError);
  }

  // Successfully authenticated - return redirect with cookies set
  // The cookies were already set in the setAll callback above
  console.log('Redirecting to:', next);
  
  // If this was a signup confirmation, show a success message
  if (type === 'signup') {
    return NextResponse.redirect(
      new URL(`/login?message=confirmed&redirect=${encodeURIComponent(next)}`, requestUrl.origin)
    );
  }
  
  return response;
}

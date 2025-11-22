'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Exchange code for session (used when code is received on home page)
 */
export async function exchangeCodeForSession(code: string, next?: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      redirect(`/login?error=${encodeURIComponent(exchangeError.message || 'Failed to authenticate')}`);
    }
    
    if (!data.session || !data.user) {
      console.error('No session or user after code exchange');
      redirect('/login?error=Failed to create session');
    }
    
    console.log('Successfully authenticated user:', data.user.id);
    
    // Ensure profile exists
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!profile) {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || null,
            is_admin: false,
          });
        console.log('Created profile for user:', data.user.id);
      }
    } catch (profileError) {
      console.error('Profile creation error (may be handled by trigger):', profileError);
    }
    
    revalidatePath('/');
    redirect(next || '/');
  } catch (error) {
    console.error('Unexpected error during code exchange:', error);
    redirect('/login?error=An unexpected error occurred');
  }
}

/**
 * Send magic link for authentication
 * Works for both new users (sign up) and existing users (sign in)
 * Supabase automatically creates the user if they don't exist
 */
export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const fullName = formData.get('fullName') as string;
  const redirectTo = formData.get('redirectTo') as string | null;

  // Validation
  if (!email) {
    throw new Error('Email is required');
  }

  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const supabase = await createClient();

    // Build redirect URL for email callback
    const callbackUrl = new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    if (redirectTo) {
      callbackUrl.searchParams.set('next', redirectTo);
    }

    // Send magic link with OTP code included
    // The shouldCreateUser option ensures new users are created
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
        emailRedirectTo: callbackUrl.toString(),
        // This ensures the code is included in the email
        shouldCreateUser: true,
      },
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        throw new Error('The magic link has expired. Please request a new one.');
      }
      throw new Error(error.message || 'Failed to send magic link');
    }

    revalidatePath('/');
    const loginUrl = redirectTo 
      ? `/login?message=check-email&redirect=${encodeURIComponent(redirectTo)}`
      : '/login?message=check-email';
    redirect(loginUrl);
  } catch (error) {
    // Re-throw to be caught by the client component
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Verify OTP code from email
 */
export async function verifyOtpCode(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;
  const redirectTo = formData.get('redirectTo') as string | null;

  // Validation
  if (!email || !code) {
    throw new Error('Email and code are required');
  }

  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const supabase = await createClient();

    // Verify the OTP code
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });

    if (error) {
      throw new Error(error.message || 'Invalid or expired code');
    }

    if (!data.user) {
      throw new Error('Failed to verify code');
    }

    // Ensure profile exists
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
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
      // Log but don't fail - the trigger should handle it
      console.error('Profile creation error (may be handled by trigger):', profileError);
    }

    revalidatePath('/');
    // Small delay to ensure session is set
    await new Promise(resolve => setTimeout(resolve, 100));
    redirect(redirectTo || '/');
  } catch (error) {
    // Re-throw to be caught by the client component
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      // Continue with redirect even if signout fails
    }

    revalidatePath('/');
    redirect('/login');
  } catch (error) {
    // Always redirect even if there's an error
    revalidatePath('/');
    redirect('/login');
  }
}

/**
 * Get the current user with profile
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it (fallback)
    if (!profile && !profileError) {
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            is_admin: false,
          });
        
        // Retry fetching profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        return {
          ...user,
          profile: newProfile,
        };
      } catch (createError) {
        console.error('Error creating profile on getCurrentUser:', createError);
      }
    }

    return {
      ...user,
      profile: profile || null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

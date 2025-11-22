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
 * Send magic link to user's email
 * Works for both new users (sign up) and existing users (sign in)
 */
export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const fullName = formData.get('fullName') as string;

  // Validation
  if (!email) {
    throw new Error('Email is required');
  }

  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const supabase = await createClient();

    // Send magic link (works for both sign up and sign in)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to send magic link');
    }

    revalidatePath('/');
    
    // Always redirect to check-email page since magic link requires email confirmation
    redirect('/login?message=check-email');
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

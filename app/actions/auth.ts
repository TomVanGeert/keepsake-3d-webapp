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
 * Sign up a new user
 * Profile will be automatically created by database trigger
 */
export async function signUp(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  // Validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const supabase = await createClient();

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to create account');
    }

    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    // Profile will be automatically created by database trigger
    // But we'll also try to create it as a fallback using admin client
    // This handles cases where the trigger might not fire immediately
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName?.trim() || null,
          is_admin: false,
        }, {
          onConflict: 'id',
        });
    } catch (profileError) {
      // If profile creation fails, log but don't fail signup
      // The trigger should handle it, or it will be created on first login
      console.error('Profile creation warning (may be handled by trigger):', profileError);
    }

    revalidatePath('/');

    // Handle email confirmation requirement
    // In local dev, Supabase might be configured to require email confirmation
    // In production, check your Supabase settings
    if (data.session) {
      // User is immediately signed in (no email confirmation required)
      redirect('/');
    } else {
      // Email confirmation required
      redirect('/register?message=check-email');
    }
  } catch (error) {
    // Re-throw to be caught by the client component
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during registration');
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and confirm your account');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to sign in');
    }

    // Ensure profile exists (fallback if trigger didn't create it)
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
      // Log but don't fail login
      console.error('Profile check warning:', profileError);
    }

    revalidatePath('/');
    redirect('/');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during sign in');
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

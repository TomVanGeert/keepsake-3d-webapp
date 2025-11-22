'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign up a new user
 */
export async function signUp(formData: FormData): Promise<void> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to create account');
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName || null,
          is_admin: false,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // If profile creation fails, try to continue anyway
        // The user can still sign in, and we can create the profile later
      }
    }

    revalidatePath('/');
    
    // Check if email confirmation is required
    // If user.email is null, Supabase requires email confirmation
    if (data.user && !data.session) {
      // Email confirmation required - redirect to a confirmation page
      redirect('/register?confirm=email');
    } else {
      // User is signed in immediately
      redirect('/');
    }
  } catch (error) {
    // Re-throw to be caught by the client component
    throw error;
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

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  redirect('/');
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/login');
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile,
  };
}


import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists after email confirmation
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!profile) {
            // Create profile if it doesn't exist
            const { createAdminClient } = await import('@/lib/supabase/admin');
            const adminSupabase = createAdminClient();
            await adminSupabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || null,
                is_admin: false,
              });
          }
        } catch (profileError) {
          console.error('Profile creation error in callback:', profileError);
        }
      }

      redirect(next);
    }
  }

  // Return to home page if there's an error
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}


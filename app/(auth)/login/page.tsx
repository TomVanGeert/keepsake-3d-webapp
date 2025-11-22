import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';
import { CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; error_description?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const showEmailMessage = params.message === 'check-email';
  const hasError = params.error || params.error_description;
  const redirectTo = params.redirect || '/';
  const redirectedFromCheckout = redirectTo === '/checkout';

  // If user is already logged in, redirect them
  const user = await getCurrentUser();
  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In / Sign Up</CardTitle>
          <CardDescription>
            {redirectedFromCheckout 
              ? 'Please sign in to proceed with checkout'
              : 'Choose your preferred authentication method'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redirectedFromCheckout && !showEmailMessage && !hasError && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <ShoppingCart className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Login Required</p>
                  <p>Please sign in or create an account to proceed to checkout.</p>
                </div>
              </div>
            </div>
          )}
          {showEmailMessage && !hasError && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Check your email</p>
                  <p>We&apos;ve sent you a magic link. Click the link in the email to sign in or create your account.</p>
                </div>
              </div>
            </div>
          )}
          {hasError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">Authentication Error</p>
                  <p>
                    {params.error_description 
                      ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
                      : params.error === 'access_denied' 
                        ? 'The magic link has expired or is invalid. Please request a new one.'
                        : 'An unexpected error occurred. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  );
}

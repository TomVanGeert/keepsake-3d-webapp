import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';
import { CheckCircle, AlertCircle, ShoppingCart, Info } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; error_description?: string; redirect?: string; confirmed?: string }>;
}) {
  const params = await searchParams;
  const showEmailMessage = params.message === 'check-email';
  const showConfirmedMessage = params.message === 'confirmed';
  const showLinkExpiredMessage = params.message === 'link-expired';
  // Only show error if it's not related to expired link (we handle that with link-expired message)
  const hasError = (params.error || params.error_description) && !showLinkExpiredMessage;
  const redirectTo = params.redirect || '/';
  const redirectedFromCheckout = redirectTo === '/checkout';
  const emailConfirmed = params.confirmed === 'true';

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
            {redirectedFromCheckout ? 'Please sign in to continue to checkout' : 'Sign in or create an account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redirectedFromCheckout && !showEmailMessage && !hasError && !emailConfirmed && !showLinkExpiredMessage && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <ShoppingCart className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Login Required</p>
                  <p>Please sign in to proceed to checkout.</p>
                </div>
              </div>
            </div>
          )}
          {showEmailMessage && !hasError && !emailConfirmed && !showLinkExpiredMessage && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Check your email</p>
                  <p>We&apos;ve sent you a confirmation link. Click the link in the email to verify your account.</p>
                  <p className="mt-2 text-xs">Note: Links expire after 1 hour. If your link expires, you can still sign in with your email and password.</p>
                </div>
              </div>
            </div>
          )}
          {emailConfirmed && !hasError && !showLinkExpiredMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-1">Email Confirmed!</p>
                  <p>Your email has been successfully confirmed. You can now sign in.</p>
                </div>
              </div>
            </div>
          )}
          {showLinkExpiredMessage && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Link Expired or Already Used</p>
                  <p>Your account has been created successfully. Please sign in below with your email and password.</p>
                  <p className="mt-2 text-xs">Confirmation links expire after 1 hour for security reasons.</p>
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
                        ? 'The confirmation link has expired or has already been used. Your account has been created - please sign in with your email and password.'
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

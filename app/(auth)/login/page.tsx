import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const showEmailMessage = params.message === 'check-email';
  const hasError = params.error || params.error_description;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In / Sign Up</CardTitle>
          <CardDescription>Enter your email to receive a magic link</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <p className="font-medium mb-1">Link expired or invalid</p>
                  <p>
                    {params.error_description 
                      ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
                      : 'The magic link has expired. Please request a new one.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

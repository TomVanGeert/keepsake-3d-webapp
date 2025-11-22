'use client';

import { useState } from 'react';
import { sendMagicLink, verifyOtpCode, signIn, signUp } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Key, Lock, UserPlus } from 'lucide-react';

type AuthMode = 'magic-link' | 'password' | 'code-entry';
type PasswordMode = 'signin' | 'signup';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('magic-link');
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('signin');
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    // Add redirectTo to formData if present
    if (redirectTo) {
      formData.append('redirectTo', redirectTo);
    }

    try {
      if (authMode === 'code-entry') {
        await verifyOtpCode(formData);
      } else if (authMode === 'password') {
        if (passwordMode === 'signin') {
          await signIn(formData);
        } else {
          await signUp(formData);
        }
      } else {
        const emailValue = formData.get('email') as string;
        setEmail(emailValue);
        await sendMagicLink(formData);
        setEmailSent(true);
        setAuthMode('code-entry');
      }
      // If successful, redirect will happen in the server action
    } catch (err) {
      // Next.js redirect() throws a special error that we should ignore
      if (
        err instanceof Error && 
        (err.message === 'NEXT_REDIRECT' || 
         err.message.includes('NEXT_REDIRECT') ||
         (err as any).digest?.startsWith('NEXT_REDIRECT'))
      ) {
        return;
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  // Code entry mode (after magic link sent)
  if (authMode === 'code-entry' && emailSent) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Magic link sent! Check your email or enter the code below.
          </p>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          <div className="space-y-2">
            <Label htmlFor="code">Enter 6-digit code from email</Label>
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="123456"
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Key className="mr-2 h-4 w-4" />
                Verifying code...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Verify code
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setEmailSent(false);
              setAuthMode('magic-link');
            }}
          >
            Request new link
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Auth mode selector */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => {
            setAuthMode('magic-link');
            setError(null);
          }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            authMode === 'magic-link'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('password');
            setError(null);
          }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            authMode === 'password'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Email & Password
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

        {/* Magic Link Mode */}
        {authMode === 'magic-link' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (Optional)</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
              />
              <p className="text-xs text-muted-foreground">
                Only needed for new accounts
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send magic link
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We&apos;ll send you a secure link to sign in or create your account. No password needed!
            </p>
          </>
        )}

        {/* Password Mode */}
        {authMode === 'password' && (
          <>
            {/* Toggle between sign in and sign up */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPasswordMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  passwordMode === 'signin'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  passwordMode === 'signup'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Sign Up
              </button>
            </div>

            {passwordMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={passwordMode === 'signup' ? 'At least 6 characters' : 'Your password'}
                required
                autoComplete={passwordMode === 'signup' ? 'new-password' : 'current-password'}
                minLength={passwordMode === 'signup' ? 6 : undefined}
              />
              {passwordMode === 'signup' && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  {passwordMode === 'signin' ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Creating account...
                    </>
                  )}
                </>
              ) : (
                <>
                  {passwordMode === 'signin' ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </>
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}

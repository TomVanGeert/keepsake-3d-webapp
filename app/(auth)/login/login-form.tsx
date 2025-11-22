'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, UserPlus } from 'lucide-react';

type PasswordMode = 'signin' | 'signup';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('signin');
  const [email, setEmail] = useState('');

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    // Add redirectTo to formData if present
    if (redirectTo) {
      formData.append('redirectTo', redirectTo);
    }

    try {
      if (passwordMode === 'signin') {
        await signIn(formData);
      } else {
        await signUp(formData);
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

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <form action={handleSubmit} className="space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

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
      </form>
    </div>
  );
}

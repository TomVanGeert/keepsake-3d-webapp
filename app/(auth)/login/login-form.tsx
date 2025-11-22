'use client';

import { useState } from 'react';
import { sendMagicLink, verifyOtpCode } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Key } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useCode, setUseCode] = useState(false);
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
      if (useCode) {
        await verifyOtpCode(formData);
      } else {
        const emailValue = formData.get('email') as string;
        setEmail(emailValue);
        await sendMagicLink(formData);
        setEmailSent(true);
      }
      // If successful, redirect will happen in the server action
    } catch (err) {
      // Next.js redirect() throws a special error that we should ignore
      // Check for redirect errors by message or digest
      if (
        err instanceof Error && 
        (err.message === 'NEXT_REDIRECT' || 
         err.message.includes('NEXT_REDIRECT') ||
         (err as any).digest?.startsWith('NEXT_REDIRECT'))
      ) {
        // This is a redirect, let it pass through - Next.js will handle it
        return;
      }
      
      // Only show actual errors, not redirects
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  if (emailSent && !useCode) {
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
            <Label htmlFor="code">Enter code from email</Label>
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="123456"
              required
              maxLength={6}
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
              setUseCode(false);
            }}
          >
            Request new link
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
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
        />
      </div>
      {useCode && (
        <div className="space-y-2">
          <Label htmlFor="code">Code from email</Label>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="123456"
            required
            maxLength={6}
            autoComplete="one-time-code"
          />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            {useCode ? (
              <>
                <Key className="mr-2 h-4 w-4" />
                Verifying code...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Sending magic link...
              </>
            )}
          </>
        ) : (
          <>
            {useCode ? (
              <>
                <Key className="mr-2 h-4 w-4" />
                Verify code
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send magic link
              </>
            )}
          </>
        )}
      </Button>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setUseCode(!useCode)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          {useCode ? 'Use magic link instead' : 'Enter code from email instead'}
        </button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        We&apos;ll send you a secure link to sign in or create your account. No password needed!
      </p>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { sendMagicLink } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    try {
      await sendMagicLink(formData);
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

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
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
        We&apos;ll send you a secure link to sign in. No password needed!
      </p>
    </form>
  );
}

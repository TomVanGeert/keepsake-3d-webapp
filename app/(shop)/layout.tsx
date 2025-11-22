import { getCurrentUser } from '@/app/actions/auth';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Keepsake 3D
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/orders" className="text-sm hover:underline">
                  My Orders
                </Link>
                <Link href="/cart" className="text-sm hover:underline">
                  Cart
                </Link>
                {user.profile?.is_admin && (
                  <Link href="/dashboard" className="text-sm hover:underline">
                    Dashboard
                  </Link>
                )}
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="sm">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Keepsake 3D. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


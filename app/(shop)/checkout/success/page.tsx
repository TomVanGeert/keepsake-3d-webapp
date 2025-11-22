import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Order Confirmed!</CardTitle>
          <CardDescription className="mb-6">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
            Your 3MF file will be generated and sent to us for printing.
          </CardDescription>
          <div className="flex gap-4 justify-center">
            <Link href="/orders">
              <Button>View Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


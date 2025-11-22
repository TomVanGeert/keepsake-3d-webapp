import { CheckoutClient } from './checkout-client';
import { getPricingConfig } from '@/app/actions/pricing';
import { createCheckoutSession } from '@/app/actions/checkout';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
  // Explicitly check authentication
  const user = await getCurrentUser();
  
  if (!user) {
    // Redirect to login with checkout as redirect destination
    redirect('/login?redirect=/checkout');
  }

  const pricingConfig = await getPricingConfig();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your order
        </p>
      </div>

      <CheckoutClient
        pricingConfig={pricingConfig}
        createCheckoutSession={createCheckoutSession}
      />
    </div>
  );
}

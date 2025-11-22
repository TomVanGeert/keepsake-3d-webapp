import { CartClient } from './cart-client';
import { getPricingConfig } from '@/app/actions/pricing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CartPage() {
  const pricingConfig = await getPricingConfig();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your items before checkout
        </p>
      </div>

      <CartClient pricingConfig={pricingConfig} />
    </div>
  );
}


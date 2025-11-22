import { getOrderById, updateOrderStatus } from '@/app/actions/admin';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderDetailsClient } from './order-details-client';
import type { OrderStatus } from '@/types';

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  
  if (!user?.profile?.is_admin) {
    redirect('/');
  }

  let order;
  try {
    order = await getOrderById(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Order Details</h1>
        <p className="text-muted-foreground">
          Order #{order.id.slice(0, 8)}
        </p>
      </div>

      <OrderDetailsClient order={order} updateOrderStatus={updateOrderStatus} />
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import type { OrderStatus } from '@/types';

interface OrderItem {
  id: string;
  size: string;
  price: number;
  quantity: number;
  original_image_url: string | null;
  converted_image_url: string | null;
  three_mf_file_url: string | null;
}

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: any;
  created_at: string;
  order_items: OrderItem[];
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

interface OrderDetailsClientProps {
  order: Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderDetailsClient({ order, updateOrderStatus }: OrderDetailsClientProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">
                {order.profiles?.full_name || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.profiles?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">
                ${Number(order.total_amount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{status}</p>
            </div>
          </div>

          {order.shipping_address && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{order.shipping_address.name}</p>
                <p>{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <Button
                  key={option}
                  variant={status === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(option)}
                  disabled={updating || status === option}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                {item.converted_image_url && (
                  <div className="relative w-24 h-24 rounded overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.converted_image_url}
                      alt="Keychain"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    Custom {item.size} Keychain
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Price: ${Number(item.price).toFixed(2)} each
                  </p>
                  {item.three_mf_file_url && (
                    <Link
                      href={item.three_mf_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="mt-2">
                        Download 3MF File
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


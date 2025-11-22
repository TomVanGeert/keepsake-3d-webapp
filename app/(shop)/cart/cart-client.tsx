'use client';

import { useState, useEffect, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem, Size } from '@/types';

interface CartItemWithId extends CartItem {
  id: string;
}

interface CartClientProps {
  pricingConfig: Array<{
    size: string;
    price: number;
    dimensions: string;
  }>;
}

export function CartClient({ pricingConfig }: CartClientProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithId[]>([]);
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    cartItems,
    (state, newState: CartItemWithId[]) => newState
  );

  useEffect(() => {
    // Load cart from sessionStorage
    const stored = sessionStorage.getItem('cart');
    if (stored) {
      try {
        const items: CartItem[] = JSON.parse(stored);
        const itemsWithIds = items.map((item, index) => ({
          ...item,
          id: `item-${index}-${Date.now()}`,
        }));
        setCartItems(itemsWithIds);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  const updateCart = (newItems: CartItemWithId[]) => {
    setCartItems(newItems);
    setOptimisticItems(newItems);
    // Update sessionStorage
    const itemsWithoutIds = newItems.map(({ id, ...item }) => item);
    sessionStorage.setItem('cart', JSON.stringify(itemsWithoutIds));
  };

  const removeItem = (id: string) => {
    const newItems = optimisticItems.filter(item => item.id !== id);
    updateCart(newItems);
  };

  const updateQuantity = (id: string, delta: number) => {
    const newItems = optimisticItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    updateCart(newItems);
  };

  const getSizeLabel = (size: Size) => {
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  const getSizeDimensions = (size: Size) => {
    const config = pricingConfig.find(c => c.size === size);
    return config?.dimensions || '';
  };

  const subtotal = optimisticItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (optimisticItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/')}>
            Start Creating
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {optimisticItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={item.convertedImageUrl}
                    alt="Keychain preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Custom {getSizeLabel(item.size)} Keychain
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {getSizeDimensions(item.size)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold mb-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-semibold">Calculated at checkout</span>
          </div>
          <div className="border-t pt-4 flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push('/checkout')}
          >
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


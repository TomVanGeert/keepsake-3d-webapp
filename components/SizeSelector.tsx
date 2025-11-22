'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Size } from '@/types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SizeOption {
  size: Size;
  label: string;
  price: number;
  dimensions: string;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: Size | null;
  onSizeSelect: (size: Size) => void;
  disabled?: boolean;
}

export function SizeSelector({ sizes, selectedSize, onSizeSelect, disabled }: SizeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Size</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sizes.map((option) => (
            <button
              key={option.size}
              type="button"
              onClick={() => !disabled && onSizeSelect(option.size)}
              disabled={disabled}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all text-left',
                selectedSize === option.size
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {selectedSize === option.size && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="font-semibold text-lg mb-1">{option.label}</div>
              <div className="text-sm text-muted-foreground mb-2">
                {option.dimensions}
              </div>
              <div className="text-lg font-bold">${option.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ImagePreview } from '@/components/ImagePreview';
import { SizeSelector } from '@/components/SizeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { convertImage, type ConvertImageResult } from '@/app/actions/convert';
import { useOptimistic } from 'react';
import type { Size } from '@/types';
import { useRouter } from 'next/navigation';

interface SizeOption {
  size: Size;
  label: string;
  price: number;
  dimensions: string;
}

interface UploadPageClientProps {
  sizes: SizeOption[];
  convertImage: (formData: FormData) => Promise<ConvertImageResult>;
}

export function UploadPageClient({ sizes, convertImage: convertImageAction }: UploadPageClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [optimisticConvertedUrl, addOptimisticConvertedUrl] = useOptimistic<string | null>(
    convertedImageUrl,
    (state, newState: string | null) => newState
  );

  const handleImageSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsConverting(true);
    setConvertedImageUrl(null);

    // Create preview URL for original
    const previewUrl = URL.createObjectURL(file);
    setOriginalImageUrl(previewUrl);

    // Convert image
    const formData = new FormData();
    formData.append('image', file);

    try {
      const result = await convertImageAction(formData);
      
      if (result.success && result.convertedImageUrl) {
        setConvertedImageUrl(result.convertedImageUrl);
        addOptimisticConvertedUrl(result.convertedImageUrl);
      } else {
        setError(result.error || 'Failed to convert image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const handleAddToCart = () => {
    if (!optimisticConvertedUrl || !selectedSize || !originalImageUrl) {
      setError('Please select a size and convert an image first');
      return;
    }

    // Store in sessionStorage for cart
    const cartItem = {
      originalImageUrl,
      convertedImageUrl: optimisticConvertedUrl,
      size: selectedSize,
      price: sizes.find(s => s.size === selectedSize)?.price || 0,
      quantity: 1,
    };

    const existingCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    existingCart.push(cartItem);
    sessionStorage.setItem('cart', JSON.stringify(existingCart));

    router.push('/cart');
  };

  return (
    <div className="space-y-6">
      {!originalImageUrl ? (
        <ImageUploader onImageSelect={handleImageSelect} disabled={isConverting} />
      ) : (
        <>
          <ImagePreview
            originalUrl={originalImageUrl}
            convertedUrl={optimisticConvertedUrl || undefined}
            isLoading={isConverting}
          />
          
          {optimisticConvertedUrl && (
            <>
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onSizeSelect={setSelectedSize}
              />
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">
                        ${selectedSize ? sizes.find(s => s.size === selectedSize)?.price.toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <Button
                      onClick={handleAddToCart}
                      disabled={!selectedSize}
                      size="lg"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface ImagePreviewProps {
  originalUrl: string;
  convertedUrl?: string;
  isLoading?: boolean;
}

export function ImagePreview({ originalUrl, convertedUrl, isLoading }: ImagePreviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Original Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={originalUrl}
              alt="Original"
              fill
              className="object-contain"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Converted (Black & White)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Converting...</p>
            </div>
          ) : convertedUrl ? (
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={convertedUrl}
                alt="Converted"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No converted image yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


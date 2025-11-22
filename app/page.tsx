import { getPricingConfig } from '@/app/actions/pricing';
import { UploadPageClient } from './upload-client';
import { redirect } from 'next/navigation';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Handle authentication callback if code is present
  // Supabase sometimes redirects to root instead of /auth/callback
  if (params.code) {
    const callbackUrl = new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    callbackUrl.searchParams.set('code', params.code as string);
    // Preserve any other query params
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'code' && value) {
        callbackUrl.searchParams.set(key, Array.isArray(value) ? value[0] : value);
      }
    });
    redirect(callbackUrl.toString());
  }

  const pricingConfig = await getPricingConfig();

  const sizes = pricingConfig.map((config) => ({
    size: config.size as 'small' | 'medium' | 'large',
    label: config.size.charAt(0).toUpperCase() + config.size.slice(1),
    price: Number(config.price),
    dimensions: config.dimensions || '',
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Custom Keychain</h1>
        <p className="text-muted-foreground">
          Upload an image and we&apos;ll convert it to a 3D printable keychain
        </p>
      </div>

      <UploadPageClient sizes={sizes} />
    </div>
  );
}

import { getPricingConfig } from '@/app/actions/pricing';
import { UploadPageClient } from './upload-client';
import { exchangeCodeForSession } from '@/app/actions/auth';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string; [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Handle authentication callback if code is present
  // Supabase sometimes redirects to root instead of /auth/callback
  if (params.code) {
    const code = params.code as string;
    const next = (params.next as string) || '/';
    // Use Server Action to exchange code - this ensures cookies are set properly
    await exchangeCodeForSession(code, next);
    // The redirect will happen in the Server Action
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

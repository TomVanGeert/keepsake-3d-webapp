import { getCurrentUser } from '@/app/actions/auth';
import { getPricingConfig } from '@/app/actions/pricing';
import { UploadPageClient } from './upload-client';

export default async function HomePage() {
  const user = await getCurrentUser();
  const pricingConfig = await getPricingConfig();

  // Don't redirect here - let middleware handle it
  // This prevents redirect loops after authentication
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Keepsake 3D</h1>
          <p className="text-muted-foreground mb-4">
            Create custom 3D printed keychains from your images
          </p>
          <p className="text-sm text-muted-foreground">
            Please sign in to continue
          </p>
        </div>
      </div>
    );
  }

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

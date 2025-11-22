import { getPricingConfig } from '@/app/actions/pricing';
import { UploadPageClient } from './upload-client';

export default async function HomePage() {
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Workaround for Next.js 15.1.8 client reference manifest issue on Vercel
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable output file tracing to work around build trace collection issue
  output: 'standalone',
};

export default nextConfig;


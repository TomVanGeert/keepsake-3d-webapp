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
  // Workaround for Next.js 15.1.8 build issue on Vercel
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;


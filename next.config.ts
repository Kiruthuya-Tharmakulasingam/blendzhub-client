import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production to avoid errors
  
  // Image optimization settings
  images: {
    // Disable image optimization caching for static images to ensure updates are reflected
    minimumCacheTTL: 0,
    // Allow images from Cloudinary
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  
  // Headers to prevent aggressive caching of static assets
  async headers() {
    return [
      {
        source: '/salon-wall-mirror-work.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

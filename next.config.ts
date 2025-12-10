import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const fallbackUrl = "https://blendz-hub-api.vercel.app";
    const localUrl = "http://localhost:5000";

    // Fix for Vercel deployment where NEXT_PUBLIC_API_URL might be set to the frontend URL
    // or missing, causing a redirect loop.
    if (isProd) {
      if (
        !apiUrl ||
        apiUrl.includes("blendzhub-client") || 
        !apiUrl.includes("http")
      ) {
        console.log(`[NextConfig] Invalid or missing API_URL in production: ${apiUrl}. Using fallback: ${fallbackUrl}`);
        apiUrl = fallbackUrl;
      }
    } else {
      // In development, default to localhost if not set
      if (!apiUrl) {
        apiUrl = localUrl;
      }
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
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

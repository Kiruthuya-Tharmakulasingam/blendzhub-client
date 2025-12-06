import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed rewrites - using direct API calls with CORS instead
  // This ensures cookies are properly sent with credentials: 'include'
};

export default nextConfig;

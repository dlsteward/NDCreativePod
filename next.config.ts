import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React's Strict Mode
  experimental: {
    externalDir: true, // For resolving paths from tsconfig.json
  },
  typescript: {
    ignoreBuildErrors: true, // If you're encountering issues with module resolution
  },
  // Other configurations can be added here
  // For example:
  // basePath: '/your-base-path',
  // assetPrefix: '/your-asset-prefix',
};

export default nextConfig;
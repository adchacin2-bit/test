import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build (can be fixed in development)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build (optional - remove if you want strict checking)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

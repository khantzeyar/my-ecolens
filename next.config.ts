import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true, // Force enable App Router support for src/app
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop')],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/v2/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/id/**',
      },
    ],
  },
};

export default nextConfig;

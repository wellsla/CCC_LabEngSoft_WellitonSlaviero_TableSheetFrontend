
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Added for placeholder images
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'https://6000-idx-studio-1746289940083.cluster-etsqrqvqyvd4erxx7qq32imrjk.cloudworkstations.dev',
    'https://9000-idx-studio-1746289940083.cluster-etsqrqvqyvd4erxx7qq32imrjk.cloudworkstations.dev',
  ],
};

export default nextConfig;

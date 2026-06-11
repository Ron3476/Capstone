import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@edu-savvy/shared'],
  output: 'export',
};

export default nextConfig;

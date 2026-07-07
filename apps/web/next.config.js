/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pizi.in' },
      { protocol: 'https', hostname: '**.pizi.in' },
    ],
  },
};
module.exports = nextConfig;

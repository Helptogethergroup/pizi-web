/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Lint locally with `npm run lint`; don't fail production builds on lint.
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

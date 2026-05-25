/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@edutech/ui',
    '@edutech/types',
    '@edutech/validation',
    '@edutech/api-client',
    '@edutech/shared-components',
  ],
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
};

module.exports = nextConfig;
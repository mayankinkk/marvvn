/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bonkerscorner.com',
      },
      {
        protocol: 'https',
        hostname: 'bonkerscorner.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
}

module.exports = nextConfig

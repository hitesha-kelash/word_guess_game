/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: { 
    unoptimized: true 
  },
  trailingSlash: true,
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
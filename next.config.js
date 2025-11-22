/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript:{
    // Set this to `false` if you don't want Next.js to automatically run `tsc` during production builds.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },
};

module.exports = nextConfig;

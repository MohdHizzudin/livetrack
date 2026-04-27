/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',     // ← Ini yang penting
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // Ini yang penting
  images: {
    unoptimized: true,        // Supaya tak error gambar
  },
  trailingSlash: true,
};

module.exports = nextConfig;

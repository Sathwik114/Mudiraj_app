/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['jsx', 'js'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevents Windows file-locking (errno -4094) on .next/server/app-paths-manifest.json during dev compilation
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
    unoptimized: true, // needed on shared hosting without sharp/image optimizer
  },
  compiler: {
    removeConsole: false, // ponytail: re-enable after debug login issue
  },
};

export default nextConfig;

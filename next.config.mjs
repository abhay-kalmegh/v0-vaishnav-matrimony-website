/** @type {import('next').NextConfig} */
const nextConfig = {
  // Capacitor loads the app from ./out, so the site must be a static export.
  output: 'export',
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;

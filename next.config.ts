import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // output:'export' is only for production build — dev needs a real server for the admin proxy
  ...(!isDev && { output: "export" }),
  images: { unoptimized: true },
  trailingSlash: false,
  ...(isDev && {
    async rewrites() {
      return [
        // Proxy /admin/* to the Vite dev server (port 3001)
        { source: '/admin', destination: 'http://localhost:3001/admin' },
        { source: '/admin/:path*', destination: 'http://localhost:3001/admin/:path*' },
      ];
    },
  }),
};

export default nextConfig;

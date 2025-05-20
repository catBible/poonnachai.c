import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing configurations:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https', // <--- แก้ไขตรงนี้ จาก 'httpshttps' เป็น 'https'
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // เปิดใช้งาน Static Export
  output: 'export',
};

export default nextConfig;
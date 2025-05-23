/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  eslint: {
    // ESLint 검사를 빌드 시 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript 검사를 빌드 시 무시
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 
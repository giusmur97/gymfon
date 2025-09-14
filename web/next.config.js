/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for Vercel
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

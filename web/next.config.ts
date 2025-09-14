import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "instagram.f**.fbcdn.net" as unknown as string },
      { protocol: "https", hostname: "scontent-*" as unknown as string },
      { protocol: "https", hostname: "cdninstagram.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" as unknown as string },
    ],
  },
};

export default nextConfig;

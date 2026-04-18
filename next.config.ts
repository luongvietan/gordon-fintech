import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses for faster delivery
  compress: true,

  // Power header removed for cleaner response
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Sanity CDN — used for blog cover images.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  // Strict mode for better React error detection
  reactStrictMode: true,
};

export default nextConfig;

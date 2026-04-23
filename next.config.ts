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

  /**
   * Canonical URLs are singular (`/specialty/...`) — matching the
   * sitemap, every internal `<Link>` href, and the per-page metadata
   * `canonical` values. External links that try the plural form get a
   * permanent 301 redirect so old bookmarks and any off-site references
   * never land on a 404.
   */
  async redirects() {
    return [
      {
        source: '/specialties',
        destination: '/specialty',
        permanent: true,
      },
      {
        source: '/specialties/:slug',
        destination: '/specialty/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

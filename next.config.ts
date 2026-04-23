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
      // The canonical slug for Orthopedic Surgery is `orthopedics`
      // (matches the ACGME-style specialty label). External writers and
      // SEO tools frequently guess `orthopedic-surgery`, so redirect both
      // the singular and plural bases to the canonical page.
      {
        source: '/specialty/orthopedic-surgery',
        destination: '/specialty/orthopedics',
        permanent: true,
      },
      {
        source: '/specialties/orthopedic-surgery',
        destination: '/specialty/orthopedics',
        permanent: true,
      },
      {
        source: '/specialties/:slug',
        destination: '/specialty/:slug',
        permanent: true,
      },
      // `/guides` never existed as a route, but the nav used to link
      // there before being renamed to `/blog`. Redirect direct hits so
      // old bookmarks and any off-site references never 404.
      {
        source: '/guides',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/guides/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

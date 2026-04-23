import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { SPECIALTIES } from '@/lib/specialties';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medschooldebtcalculator.com';

/**
 * Sitemap covers:
 * 1. Homepage (priority 1.0) — the calculator and primary entry point.
 * 2. Blog index (priority 0.8) — content hub.
 * 3. Static informational pages (priority 0.5) — methodology, privacy, terms.
 * 4. Each blog post (priority 0.7).
 *
 * `lastModified` uses the post `date` so search engines see real freshness signals.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { path: '/calculator', priority: 0.9 },
    { path: '/specialty', priority: 0.85 },
    { path: '/methodology', priority: 0.6 },
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
  ].map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority,
  }));

  // Every specialty profile gets its own SEO surface. These are the
  // long-tail entry points ("dermatology student loan repayment"), so
  // they get a higher priority than the static info pages.
  const specialtyEntries: MetadataRoute.Sitemap = SPECIALTIES.map((s) => ({
    url: `${BASE_URL}/specialty/${s.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...staticPages,
    ...specialtyEntries,
    ...blogEntries,
  ];
}

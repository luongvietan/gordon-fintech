import { createClient } from 'next-sanity';
import { apiToken, apiVersion, dataset, projectId, useCdn } from '@/sanity/env';

/**
 * Shared Sanity client for server-side data fetching in the Next.js app.
 *
 * - `useCdn: false` → always reads fresh from the API so publishes appear
 *   instantly during revalidation. Flip to `true` if/when traffic scales
 *   and stale-by-a-minute is acceptable.
 * - `perspective: 'published'` → excludes drafts from the public site.
 * - `token` → set `SANITY_API_READ_TOKEN` or `SANITY_API_WRITE_TOKEN` in `.env.local`
 *   when the dataset is **private**, or when you authenticate reads for other reasons.
 *   Never use `NEXT_PUBLIC_*` for tokens.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token: apiToken,
  perspective: 'published',
});

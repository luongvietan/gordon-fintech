import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, useCdn } from '@/sanity/env';

/**
 * Shared Sanity client for server-side data fetching in the Next.js app.
 *
 * - `useCdn: false` → always reads fresh from the API so publishes appear
 *   instantly during revalidation. Flip to `true` if/when traffic scales
 *   and stale-by-a-minute is acceptable.
 * - `perspective: 'published'` → excludes drafts from the public site.
 *   Previews (drafts visible) would use a separate client with a token.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
});

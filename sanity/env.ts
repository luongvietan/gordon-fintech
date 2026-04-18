/**
 * Sanity environment variables.
 *
 * These are read by both the embedded Studio (/studio) and the Next.js
 * data-fetching layer (lib/sanity.client.ts). Keep everything public —
 * dataset names, project IDs, and API versions are not secrets.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
);

/** Optional — only needed for draft previews / write access from Next.js. */
export const token = process.env.SANITY_API_READ_TOKEN;

export const useCdn = false;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

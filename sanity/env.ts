/**
 * Sanity environment variables.
 *
 * These are read by both the embedded Studio (/studio) and the Next.js
 * data-fetching layer (`lib/sanity.client.ts`). Project ID, dataset name,
 * and API version are safe to expose via `NEXT_PUBLIC_*`. API tokens must
 * stay server-only (never `NEXT_PUBLIC_`).
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

/**
 * Optional API token for server-side GROQ fetches (never expose to the browser).
 *
 * - Use a **Viewer** token if the dataset is private or you only need reads.
 * - A **write (Editor)** token also works for reads but has broader permissions —
 *   prefer a read-only token when possible.
 *
 * Resolution order: read token → write token.
 */
export const apiToken =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN ||
  undefined;

export const useCdn = false;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { dataset, projectId } from '@/sanity/env';

/**
 * Thin wrapper around `@sanity/image-url` configured with the site's
 * project. Use on the server to resolve Sanity image assets to CDN URLs.
 *
 *   const src = urlFor(post.coverImage).width(800).height(450).url();
 */
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export function coverImageUrl(source: SanityImageSource | null | undefined): string | null {
  if (!source) return null;
  try {
    return builder.image(source).width(800).height(450).fit('crop').auto('format').url();
  } catch {
    return null;
  }
}

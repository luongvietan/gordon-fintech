import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog';
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  loadOgFonts,
  renderOgCard,
} from '@/lib/og';

/**
 * Per-article Open Graph image. Resolved at `/blog/<slug>/opengraph-image`.
 *
 * - Pulls the article title, description, primary category, and reading
 *   time from Sanity. The route inherits `generateStaticParams` from the
 *   sibling `page.tsx`, so every published article gets a prerendered
 *   image at build time.
 * - Uses the shared `renderOgCard` template so every article gets the
 *   same dark-brand layout — no per-post tuning needed.
 * - Falls back to a generic "Doctor finance guide" eyebrow when the
 *   post has no category yet (back-fill safety for older posts).
 *
 * Note: Next 16 made `params` a Promise — see the version-history table
 * in `node_modules/next/dist/docs/.../opengraph-image.md`.
 */

export const alt = 'MedDebt Calculator — guide for doctors';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    // Fallback so the route never 404s — share previews still render
    // a branded card even if the slug was just unpublished.
    const fonts = await loadOgFonts();
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0e0f0c',
            color: 'white',
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: 900,
          }}
        >
          MedDebt Calculator
        </div>
      ),
      { ...size, fonts },
    );
  }

  const eyebrow = post.categories?.[0]?.title ?? 'Doctor finance guide';
  const meta = [
    post.readingTime,
    post.date
      ? new Date(post.date).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : null,
  ].filter((v): v is string => Boolean(v));

  return renderOgCard({
    eyebrow,
    title: post.title,
    subtitle: post.description,
    meta,
  });
}

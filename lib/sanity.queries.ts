/**
 * GROQ queries for blog content.
 *
 * Kept as plain strings (no query-builder) for transparency and so the
 * Vision tool (/studio/vision) can run them verbatim for debugging.
 */

/** All published posts — metadata only, newest first. */
export const allPostsQuery = /* groq */ `
  *[_type == "post" && defined(slug.current) && defined(date)] | order(date desc) {
    "slug": slug.current,
    title,
    description,
    "date": date,
    readingTime,
    keyword
  }
`;

/** Single post by slug — full body + FAQs. */
export const postBySlugQuery = /* groq */ `
  *[_type == "post" && slug.current == $slug][0]{
    "slug": slug.current,
    title,
    description,
    "date": date,
    readingTime,
    keyword,
    body,
    faqs[]{ q, a }
  }
`;

/** All slugs — used by `generateStaticParams`. */
export const allSlugsQuery = /* groq */ `
  *[_type == "post" && defined(slug.current)][].slug.current
`;

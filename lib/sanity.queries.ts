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
    keyword,
    featured,
    "categories": categories[]->{ "slug": slug.current, title },
    "coverImage": coverImage{ asset, alt, hotspot, crop }
  }
`;

/** Single post by slug — full body + FAQs + categories. */
export const postBySlugQuery = /* groq */ `
  *[_type == "post" && slug.current == $slug][0]{
    "slug": slug.current,
    title,
    description,
    "date": date,
    readingTime,
    keyword,
    body,
    faqs[]{ q, a },
    "categories": categories[]->{ "slug": slug.current, title },
    "coverImage": coverImage{ asset, alt, hotspot, crop }
  }
`;

/** Posts that share at least one category with `$slug`, newest first. */
export const relatedPostsQuery = /* groq */ `
  *[
    _type == "post"
    && slug.current != $slug
    && defined(slug.current)
    && defined(date)
    && count(categories[@._ref in *[_type == "post" && slug.current == $slug][0].categories[]._ref]) > 0
  ] | order(date desc) [0...3] {
    "slug": slug.current,
    title,
    description,
    "date": date,
    readingTime,
    "categories": categories[]->{ "slug": slug.current, title },
    "coverImage": coverImage{ asset, alt, hotspot, crop }
  }
`;

/** All categories, sorted. */
export const allCategoriesQuery = /* groq */ `
  *[_type == "category" && defined(slug.current)] | order(coalesce(sortOrder, 100) asc, title asc) {
    "slug": slug.current,
    title,
    description
  }
`;

/** All slugs — used by `generateStaticParams`. */
export const allSlugsQuery = /* groq */ `
  *[_type == "post" && defined(slug.current)][].slug.current
`;

import type { SanityImageSource } from '@sanity/image-url';
import { sanityClient } from './sanity.client';
import { coverImageUrl } from './sanity.image';
import {
  allCategoriesQuery,
  allPostsQuery,
  allSlugsQuery,
  postBySlugQuery,
  relatedPostsQuery,
} from './sanity.queries';

export interface FaqItem {
  q: string;
  a: string;
}

export interface CategoryRef {
  slug: string;
  title: string;
}

export interface Category extends CategoryRef {
  description?: string | null;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  /** Optional focus keyword (used for light SEO metadata). */
  keyword?: string;
  /** When true, this post is pinned as the lead article on the blog index. */
  featured?: boolean;
  /** Categories the post belongs to (denormalized references). */
  categories?: CategoryRef[];
  /** Optional cover image URL resolved from Sanity. Null when the post has no cover. */
  coverImageUrl?: string | null;
  /** Alt text for the cover image, when present. */
  coverImageAlt?: string | null;
}

export interface Post extends PostMeta {
  /** Markdown body — rendered through next-mdx-remote. */
  content: string;
  /** Optional FAQ items — emitted as FAQPage JSON-LD when present. */
  faqs?: FaqItem[];
}

/**
 * Keep a revalidation window so publishes from the Studio appear on the
 * live site without a full redeploy. 60s is a reasonable default — bump
 * down for faster editorial turnaround or up to ease load.
 */
const REVALIDATE_SECONDS = 60;

interface SanityCoverImage {
  asset?: { _ref?: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}

interface PostMetaRaw extends Omit<PostMeta, 'coverImageUrl' | 'coverImageAlt'> {
  coverImage?: SanityCoverImage | null;
}

function hydrateCover<T extends PostMetaRaw>(raw: T): PostMeta {
  const cover = raw.coverImage;
  const { coverImage: _omit, ...rest } = raw;
  void _omit;
  return {
    ...rest,
    categories: raw.categories ?? [],
    coverImageUrl: cover ? coverImageUrl(cover as SanityImageSource) : null,
    coverImageAlt: cover?.alt ?? null,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await sanityClient.fetch<PostMetaRaw[]>(
    allPostsQuery,
    {},
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['post'] } },
  );
  return (posts ?? []).map(hydrateCover);
}

interface PostRaw extends PostMetaRaw {
  body: string;
  faqs?: FaqItem[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await sanityClient.fetch<PostRaw | null>(
    postBySlugQuery,
    { slug },
    { next: { revalidate: REVALIDATE_SECONDS, tags: [`post:${slug}`, 'post'] } },
  );

  if (!post) return null;

  const hydrated = hydrateCover(post);
  return {
    ...hydrated,
    content: post.body ?? '',
    faqs: post.faqs,
  };
}

export async function getRelatedPosts(slug: string): Promise<PostMeta[]> {
  const posts = await sanityClient.fetch<PostMetaRaw[]>(
    relatedPostsQuery,
    { slug },
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['post', `post:${slug}`] } },
  );
  return (posts ?? []).map(hydrateCover);
}

export async function getAllCategories(): Promise<Category[]> {
  const cats = await sanityClient.fetch<Category[]>(
    allCategoriesQuery,
    {},
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['category'] } },
  );
  return cats ?? [];
}

export async function getAllSlugs(): Promise<string[]> {
  const slugs = await sanityClient.fetch<string[]>(
    allSlugsQuery,
    {},
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['post'] } },
  );
  return slugs ?? [];
}

import { sanityClient } from './sanity.client';
import {
  allPostsQuery,
  allSlugsQuery,
  postBySlugQuery,
} from './sanity.queries';

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  /** Optional focus keyword (used for light SEO metadata). */
  keyword?: string;
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

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await sanityClient.fetch<PostMeta[]>(
    allPostsQuery,
    {},
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['post'] } },
  );
  return posts ?? [];
}

interface PostRaw extends PostMeta {
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

  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    readingTime: post.readingTime,
    keyword: post.keyword,
    content: post.body ?? '',
    faqs: post.faqs,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const slugs = await sanityClient.fetch<string[]>(
    allSlugsQuery,
    {},
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['post'] } },
  );
  return slugs ?? [];
}

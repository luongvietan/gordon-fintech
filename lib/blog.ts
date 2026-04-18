import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
  /** Optional FAQ items — emitted as FAQPage schema when present. */
  faqs?: FaqItem[];
}

export interface Post extends PostMeta {
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function ensureDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

function parseMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug: (data.slug as string) ?? slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    date: (data.date as string) ?? '',
    readingTime: (data.readingTime as string) ?? '5 min read',
    keyword: data.keyword as string | undefined,
    faqs: Array.isArray(data.faqs) ? (data.faqs as FaqItem[]) : undefined,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  ensureDir();
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data } = matter(raw);
    return parseMeta(slug, data);
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  ensureDir();
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    ...parseMeta(slug, data),
    content,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  ensureDir();
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
  return files.map((f) => f.replace(/\.mdx$/, ''));
}

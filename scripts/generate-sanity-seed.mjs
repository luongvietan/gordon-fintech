#!/usr/bin/env node
/**
 * Generate `sanity-seed.ndjson` from the existing MDX blog posts.
 *
 * Reads every `content/blog/*.mdx` file, parses frontmatter, and emits
 * one JSON document per line in the format expected by Sanity's
 * dataset importer.
 *
 * Usage:
 *   node scripts/generate-sanity-seed.mjs
 *
 * Then import into your Sanity dataset:
 *   npx sanity dataset import sanity-seed.ndjson production
 *
 * The NDJSON file is checked in (see package.json) so anyone can
 * re-import it without running this script.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const OUT_FILE = path.join(ROOT, 'sanity-seed.ndjson');

// Deterministic document IDs so re-running the script is idempotent:
// the importer will update existing docs rather than create duplicates.
function idForSlug(slug) {
  return `post-${slug}`;
}

function toDocument(slug, frontmatter, body) {
  return {
    _id: idForSlug(slug),
    _type: 'post',
    title: frontmatter.title ?? slug,
    slug: { _type: 'slug', current: frontmatter.slug ?? slug },
    description: frontmatter.description ?? '',
    date: frontmatter.date ?? new Date().toISOString().slice(0, 10),
    readingTime: frontmatter.readingTime ?? '5 min read',
    ...(frontmatter.keyword ? { keyword: frontmatter.keyword } : {}),
    body: body.trimStart(),
    ...(Array.isArray(frontmatter.faqs) && frontmatter.faqs.length > 0
      ? {
          faqs: frontmatter.faqs.map((f, i) => ({
            _key: `faq-${i}`,
            _type: 'faq',
            q: f.q,
            a: f.a,
          })),
        }
      : {}),
  };
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`No MDX source directory found at ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  if (files.length === 0) {
    console.error('No .mdx files found under content/blog/');
    process.exit(1);
  }

  const lines = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const doc = toDocument(slug, data, content);
    lines.push(JSON.stringify(doc));
  }

  fs.writeFileSync(OUT_FILE, lines.join('\n') + '\n', 'utf-8');
  console.log(`✓ Wrote ${lines.length} documents to ${path.relative(ROOT, OUT_FILE)}`);
  console.log('  Import with: npx sanity dataset import sanity-seed.ndjson production');
}

main();

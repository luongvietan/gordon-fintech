import { defineField, defineType } from 'sanity';

/**
 * Blog post.
 *
 * Body is stored as raw Markdown (with GitHub-flavored-markdown extensions:
 * tables, links, lists). The Next.js site renders it via `next-mdx-remote`
 * so all existing MDX articles display identically.
 *
 * Using markdown (rather than Portable Text) keeps tables + internal links
 * lossless across the MDX → Sanity → rendered-HTML pipeline, which matters
 * a lot for SEO pages where tables carry the comparison data.
 */
export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'Used as H1, meta title, OpenGraph title.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'content',
      description: 'The `/blog/<slug>` segment. Keep it lowercase with dashes.',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 96),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'Meta description + OpenGraph description. Aim for 150–160 characters.',
      validation: (rule) => rule.required().min(80).max(200),
    }),
    defineField({
      name: 'date',
      title: 'Published date',
      type: 'date',
      group: 'content',
      description: 'Used for sorting on the blog index and `datePublished` in Article schema.',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading time',
      type: 'string',
      group: 'content',
      description: 'Free text, e.g. "8 min read".',
      validation: (rule) => rule.required(),
      initialValue: '8 min read',
    }),
    defineField({
      name: 'keyword',
      title: 'Focus keyword',
      type: 'string',
      group: 'seo',
      description: 'Optional — your target keyword for internal tracking.',
    }),
    defineField({
      name: 'body',
      title: 'Body (Markdown)',
      type: 'markdown',
      group: 'content',
      description:
        'Markdown with GFM support: headings (##, ###), links, tables, lists, code fences. Internal links like `[text](/#calculator)` are encouraged.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [{ type: 'faq' }],
      group: 'content',
      description:
        'Optional — when present, renders a collapsible section on the article page and emits FAQPage JSON-LD.',
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Title, A–Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'date', media: 'keyword' },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('en-US') : 'Unscheduled',
      };
    },
  },
});

import { defineField, defineType } from 'sanity';

/**
 * Blog category. Lightweight on purpose — just a label, slug, and short
 * description used to group posts on the index page (and, later, on
 * dedicated /blog/category/<slug> archive pages).
 *
 * Categories live as their own documents (not a hard-coded enum) so the
 * editorial team can introduce a new bucket like "Disability Insurance"
 * without a code deploy.
 */
export const category = defineType({
  name: 'category',
  title: 'Blog category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Display name, e.g. "PSLF" or "Refinancing".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'Used for the archive page URL — keep it lowercase with dashes.',
      options: {
        source: 'title',
        maxLength: 40,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 40),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 2,
      description:
        'One-sentence summary used on the blog index pill row and the future category archive header.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first in category lists. Defaults to 100.',
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: 'Sort order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
});

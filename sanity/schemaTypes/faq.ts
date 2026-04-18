import { defineField, defineType } from 'sanity';

/**
 * Reusable FAQ item — one question + answer.
 * Used inside `post.faqs` array. Rendered on article pages and emitted
 * as FAQPage JSON-LD schema.
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ item',
  type: 'object',
  fields: [
    defineField({
      name: 'q',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'a',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'q', subtitle: 'a' },
  },
});

import type { StructureResolver } from 'sanity/structure';

/**
 * Custom Studio structure — puts "Blog posts" at the root, ordered
 * newest-first by default. Everything else falls back to the generic list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog posts')
        .child(
          S.documentTypeList('post')
            .title('Blog posts')
            .defaultOrdering([{ field: 'date', direction: 'desc' }]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'post'),
    ]);

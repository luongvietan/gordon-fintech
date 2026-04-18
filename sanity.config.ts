/**
 * Sanity Studio configuration.
 *
 * The Studio is embedded in the Next.js app at `/studio`
 * (see `app/studio/[[...tool]]/page.tsx`). Editors can create / edit / publish
 * blog posts from `https://your-domain.com/studio` with no code required.
 *
 * To run the Studio locally for one-off ops like dataset imports:
 *   npx sanity dev            — runs the standalone Studio on :3333
 *   npx sanity dataset import sanity-seed.ndjson production
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { markdownSchema } from 'sanity-plugin-markdown';

import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

export default defineConfig({
  name: 'default',
  title: 'MedDebt Calculator — CMS',

  projectId,
  dataset,
  basePath: '/studio',

  plugins: [
    structureTool({ structure }),
    markdownSchema(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
});

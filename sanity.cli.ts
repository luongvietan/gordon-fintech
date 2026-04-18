/**
 * Sanity CLI configuration — read by `npx sanity <command>`.
 * Tells the CLI which project + dataset to target for dataset imports,
 * deploys, migrations, etc.
 */

import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: true,
});

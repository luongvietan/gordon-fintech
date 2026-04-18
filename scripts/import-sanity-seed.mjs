#!/usr/bin/env node
/**
 * Import sanity-seed.ndjson using a token from .env.local — no `sanity login`.
 *
 * Reads:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  (required)
 *   NEXT_PUBLIC_SANITY_DATASET     (default: production)
 *   Token (first match wins):
 *     SANITY_IMPORT_TOKEN
 *     SANITY_API_WRITE_TOKEN
 *     SANITY_API_READ_TOKEN
 *
 * Usage:
 *   npm run sanity:seed:import
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token =
  process.env.SANITY_IMPORT_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN ||
  process.env.SANITY_API_READ_TOKEN;

if (!projectId) {
  console.error('Thiếu NEXT_PUBLIC_SANITY_PROJECT_ID trong .env.local');
  process.exit(1);
}
if (!token) {
  console.error(
    'Thiếu token. Thêm vào .env.local một trong các biến:\n' +
      '  SANITY_IMPORT_TOKEN=sk...\n' +
      '  hoặc SANITY_API_WRITE_TOKEN / SANITY_API_READ_TOKEN',
  );
  process.exit(1);
}

const ndjson = path.join(root, 'sanity-seed.ndjson');
if (!fs.existsSync(ndjson)) {
  console.error('Chưa có sanity-seed.ndjson — chạy: npm run sanity:seed:generate');
  process.exit(1);
}

const args = [
  'sanity',
  'dataset',
  'import',
  ndjson,
  dataset,
  '--replace',
  '--project-id',
  projectId,
  '--token',
  token,
];

const result = spawnSync('npx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

process.exit(result.status ?? 1);

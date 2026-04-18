'use client';

/**
 * Embedded Sanity Studio — served at /studio.
 *
 * Editors get the full Sanity authoring experience at
 * `https://your-site.com/studio` — no separate hosting required.
 *
 * The catch-all `[[...tool]]` segment lets Studio own its sub-routes
 * (e.g. /studio/vision, /studio/desk/post;<id>).
 *
 * Must be a Client Component: the Studio UI relies on React Context,
 * styled-components, and interactive state throughout.
 */

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}

/**
 * Studio layout — overrides the root Header/Footer chrome so the
 * embedded Sanity Studio fills the full viewport like a native app.
 */

import { NextStudioLayout } from 'next-sanity/studio';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}

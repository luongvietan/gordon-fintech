'use client';

import { useEffect, useRef } from 'react';
import {
  track,
  trackBlogArticleViewed,
  trackSpecialtyPageViewed,
  type AnalyticsEvent,
} from '@/lib/analytics';

interface Props {
  event: AnalyticsEvent;
  params?: Record<string, unknown>;
}

/**
 * Fire-once client component that emits a GA4 event on mount. Used by
 * server-rendered pages (e.g. `/specialty/[slug]`) that want analytics
 * instrumentation without turning the whole route into a client
 * component. The `useRef` gate is the usual safeguard against Strict
 * Mode double-mount in dev.
 */
export default function TrackPageView({ event, params }: Props) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (
      event === 'blog_article_viewed' &&
      typeof params?.article === 'string'
    ) {
      trackBlogArticleViewed(params.article);
      return;
    }
    if (
      event === 'specialty_page_viewed' &&
      typeof params?.specialty_name === 'string'
    ) {
      trackSpecialtyPageViewed(params.specialty_name);
      return;
    }
    track(event, params);
  }, [event, params]);
  return null;
}

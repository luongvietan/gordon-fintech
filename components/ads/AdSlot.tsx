'use client';

import { useEffect, useRef } from 'react';

type Variant = 'banner' | 'sidebar' | 'inline';

interface AdSlotProps {
  /** Visual slot size. */
  variant?: Variant;
  /** AdSense slot ID (from your AdSense dashboard). Required for live ads. */
  slot?: string;
  /** Extra className for layout. */
  className?: string;
}

/**
 * Ad placement that renders a real AdSense `<ins class="adsbygoogle">` unit
 * when `NEXT_PUBLIC_ADSENSE_CLIENT` + a `slot` are both provided. When no
 * ad is configured we render NOTHING — no "Advertisement" placeholder
 * shipped to production. Empty placeholders read as broken-product to
 * first-time visitors and torch credibility.
 */
export default function AdSlot({
  variant = 'banner',
  slot,
  className = '',
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const enabled = Boolean(client && slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      // Silently ignore — AdSense init failures shouldn't break the page.
    }
  }, [enabled]);

  if (!enabled) return null;

  const slotClass =
    variant === 'banner'
      ? 'ad-slot ad-slot--banner'
      : variant === 'sidebar'
      ? 'ad-slot ad-slot--sidebar'
      : 'ad-slot ad-slot--inline';

  return (
    <div className={`${slotClass} ${className}`} aria-label="Advertisement">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

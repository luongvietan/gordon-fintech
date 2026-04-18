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
  /** Label shown in placeholder mode. */
  label?: string;
}

/**
 * Ad placement that renders a real AdSense `<ins class="adsbygoogle">` unit
 * when `NEXT_PUBLIC_ADSENSE_CLIENT` + a `slot` are both provided; otherwise
 * renders a neutral placeholder with the Wise ring-shadow style.
 *
 * The `<Script>` loader for AdSense lives in `app/layout.tsx` (also gated on
 * the env var) so we only initialise if it's actually available.
 */
export default function AdSlot({
  variant = 'banner',
  slot,
  className = '',
  label = 'Advertisement',
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

  const slotClass =
    variant === 'banner'
      ? 'ad-slot ad-slot--banner'
      : variant === 'sidebar'
      ? 'ad-slot ad-slot--sidebar'
      : 'ad-slot ad-slot--inline';

  if (!enabled) {
    return (
      <div className={`${slotClass} ${className}`} aria-hidden="true">
        {label}
      </div>
    );
  }

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

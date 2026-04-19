import { BRAND, DATA_SOURCES } from '@/lib/trust-content';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Brand-led credibility strip rendered just below the stats row.
 *
 * Three things we want a first-time visitor to absorb in <3 seconds:
 *   1. Who built this (an independent brand, not a lender)
 *   2. We use real, named data sources you can verify
 *   3. There is a link to a full methodology page if they want to dig in
 *
 * Critically — we never put a fake "Founder Name CFP®" badge here. If/when
 * a real, named, credentialed person attaches their name we can swap this
 * back to a personal-byline shape.
 */
export default function CredentialsStrip() {
  // Show the four most important sources inline — the rest live on /methodology.
  const inlineSources = DATA_SOURCES.slice(0, 4);

  return (
    <section
      className="py-10 md:py-14 border-y border-[color:var(--border-subtle)]"
      style={{ background: 'var(--color-off-white)' }}
      aria-label="What this tool is and where its numbers come from"
    >
      <div className="container">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8 md:gap-12 items-start">
          {/* Brand identity — replaces the old fake-founder block */}
          <div className="flex items-start gap-4">
            <div
              aria-hidden
              className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-[14px] bg-[color:var(--color-near-black)] text-[color:var(--color-wise-green)] flex items-center justify-center"
              style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em' }}
            >
              M
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                Built &amp; maintained by
              </p>
              <p
                className="mt-1 text-[17px] md:text-lg text-[color:var(--color-near-black)] leading-tight tracking-[-0.01em]"
                style={{ fontWeight: 900 }}
              >
                {BRAND.name}
              </p>
              <p className="text-sm text-[color:var(--text-secondary)] font-medium leading-snug mt-1.5 max-w-sm">
                {BRAND.blurb}
              </p>
              <Link
                href="/methodology"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-dark-green)] hover:text-[color:var(--color-near-black)] transition-colors"
              >
                Read the full methodology
                <ArrowRight aria-hidden="true" className="w-2.5 h-2.5" strokeWidth={2} />
              </Link>
            </div>
          </div>

          {/* Data sources column — concrete, verifiable, linkable */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-3">
              Numbers traced to
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {inlineSources.map((src) => {
                const inner = (
                  <span className="flex items-baseline gap-2 min-w-0">
                    <Check
                      aria-hidden="true"
                      className="flex-shrink-0 mt-1 text-[color:var(--color-dark-green)] w-2.5 h-2.5"
                      strokeWidth={2.5}
                    />
                    <span className="min-w-0">
                      <span className="text-sm font-bold text-[color:var(--color-near-black)] block leading-snug">
                        {src.name}
                        {src.year ? (
                          <span className="font-semibold text-[color:var(--text-muted)] ml-1.5">
                            {src.year}
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-[12.5px] text-[color:var(--text-secondary)] font-medium leading-snug mt-0.5">
                        {src.use}
                      </span>
                    </span>
                  </span>
                );

                return (
                  <li key={src.name}>
                    {src.url ? (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-white rounded-lg -mx-1.5 px-1.5 py-1 transition-colors"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="px-1.5 py-1">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

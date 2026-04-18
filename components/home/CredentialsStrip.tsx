import Image from 'next/image';
import { FOUNDER, REVIEWED_BY } from '@/lib/trust-content';

/**
 * Trust strip rendered just below the stat cards. Surfaces:
 *  1. Who built the tool + their credential (left)
 *  2. Who has reviewed / vouched for it (right, optional)
 *
 * Both sides gracefully degrade:
 *  - no `FOUNDER.photoUrl` → monogram initial
 *  - empty `REVIEWED_BY`   → column hidden, left side takes the row
 */
export default function CredentialsStrip() {
  const hasReviewers = REVIEWED_BY.length > 0;
  const initial = FOUNDER.name.replace(/[^A-Za-z]/g, '').charAt(0) || 'M';

  return (
    <section
      className="py-8 md:py-10 border-y border-[color:var(--border-subtle)]"
      style={{ background: 'var(--color-off-white)' }}
      aria-label="Who built and reviewed this tool"
    >
      <div className="container">
        <div
          className={`flex flex-col ${
            hasReviewers ? 'md:flex-row md:items-center md:justify-between' : ''
          } gap-6 md:gap-10`}
        >
          {/* Founder */}
          <div className="flex items-center gap-4">
            {FOUNDER.photoUrl ? (
              <Image
                src={FOUNDER.photoUrl}
                alt={FOUNDER.name}
                width={56}
                height={56}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                aria-hidden
                className="flex-shrink-0 w-14 h-14 rounded-full bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] flex items-center justify-center"
                style={{ fontWeight: 900, fontSize: '1.5rem' }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                Built by
              </p>
              <p className="mt-0.5 text-[15px] md:text-base font-bold text-[color:var(--color-near-black)] leading-snug">
                {FOUNDER.name}
                <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)] align-middle">
                  {FOUNDER.credential}
                </span>
                {FOUNDER.linkedin && (
                  <a
                    href={FOUNDER.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex align-middle text-[color:var(--text-muted)] hover:text-[color:var(--color-near-black)] transition-colors"
                    aria-label={`${FOUNDER.name} on LinkedIn`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                    </svg>
                  </a>
                )}
              </p>
              <p className="text-sm text-[color:var(--text-secondary)] font-medium leading-snug mt-0.5">
                {FOUNDER.blurb}
              </p>
            </div>
          </div>

          {/* Reviewed by */}
          {hasReviewers && (
            <div className="flex items-center gap-4 md:gap-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] whitespace-nowrap">
                Reviewed by
              </p>
              <ul className="flex items-center gap-4 md:gap-6 flex-wrap">
                {REVIEWED_BY.map((org) => {
                  const inner = (
                    <Image
                      src={org.logoUrl}
                      alt={org.name}
                      width={100}
                      height={28}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: '24px', width: 'auto' }}
                    />
                  );
                  return (
                    <li key={org.name}>
                      {org.url ? (
                        <a href={org.url} target="_blank" rel="noopener noreferrer">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

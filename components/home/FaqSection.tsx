'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type FaqCategory = 'pslf' | 'refi' | 'tax' | 'general';

export interface FaqItem {
  q: string;
  a: string;
  category: FaqCategory;
  /** Optional in-depth guide. Renders a "Read the full guide" link inline. */
  learnMore?: { href: string; label: string };
}

interface Props {
  items: FaqItem[];
}

const CATEGORIES: { id: FaqCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pslf', label: 'PSLF' },
  { id: 'refi', label: 'Refinancing' },
  { id: 'tax', label: 'Tax' },
  { id: 'general', label: 'General' },
];

function CategoryIcon({ category }: { category: FaqCategory }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (category) {
    case 'pslf':
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 4.5-3.2 8.5-8 9-4.8-.5-8-4.5-8-9V7l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'refi':
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      );
    case 'tax':
      return (
        <svg {...common}>
          <path d="M6 3h9l5 5v13a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3z" />
          <path d="M14 3v6h6" />
          <path d="M9 14h6M9 18h4" />
        </svg>
      );
    case 'general':
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1.5 1-1.5 2.2" />
          <path d="M11.5 17h.01" />
        </svg>
      );
  }
}

function labelFor(category: FaqCategory) {
  return CATEGORIES.find((c) => c.id === category)?.label ?? 'General';
}

export default function FaqSection({ items }: Props) {
  const [active, setActive] = useState<FaqCategory | 'all'>('all');

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((i) => i.category === active)),
    [items, active],
  );

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16">
          <div>
            <p className="eyebrow mb-4">FAQ</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              The questions doctors ask.
            </h2>
            <p className="mt-4 text-base text-[color:var(--text-secondary)] max-w-sm font-medium">
              Quick answers on PSLF, IDR, refinancing, and the numbers that
              actually matter.
            </p>
          </div>

          <div>
            <div
              role="tablist"
              aria-label="FAQ categories"
              className="flex flex-wrap gap-2 mb-5"
            >
              {CATEGORIES.map((c) => {
                const isActive = active === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(c.id)}
                    className={`
                      px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold
                      transition-transform duration-200
                      hover:scale-[1.04] active:scale-[0.96]
                      ${isActive
                        ? 'bg-[color:var(--color-near-black)] text-white'
                        : 'bg-[color:var(--color-near-black)]/[0.06] text-[color:var(--color-near-black)] hover:bg-[color:var(--color-near-black)]/[0.10]'}
                    `}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              {filtered.length === 0 && (
                <p className="text-sm text-[color:var(--text-muted)] font-medium py-4">
                  No questions in this category yet.
                </p>
              )}
              {filtered.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-[var(--r-card-sm)] bg-white p-5 md:p-6 transition-colors"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-label={labelFor(f.category)}
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)] flex items-center justify-center"
                      >
                        <CategoryIcon category={f.category} />
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-[color:var(--color-near-black)] leading-snug tracking-[-0.005em]">
                        {f.q}
                      </h3>
                    </div>
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[color:var(--color-near-black)]/[0.06] group-open:bg-[color:var(--color-wise-green)] transition-colors">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        className="transition-transform duration-200 group-open:rotate-45"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 1v8M1 5h8"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-[15px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
                    {f.a}
                  </p>
                  {f.learnMore && (
                    <Link
                      href={f.learnMore.href}
                      className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[color:var(--color-dark-green)] hover:text-[color:var(--color-near-black)] transition-colors"
                    >
                      {f.learnMore.label}
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M2.5 7h9m-4-4.5L11.5 7 7.5 11.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  )}
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

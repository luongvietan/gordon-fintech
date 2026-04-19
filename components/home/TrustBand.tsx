import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TRUST_PILLARS } from '@/lib/trust-content';

/**
 * Compact trust block rendered immediately above the calculator. The job
 * of this strip is to remove every reasonable "wait, can I trust the
 * numbers from this random site?" objection in three short pillars before
 * the user touches a slider.
 */
export default function TrustBand() {
  return (
    <section
      aria-label="Why you can trust these projections"
      className="container -mt-2 md:-mt-4 mb-6 md:mb-8"
    >
      <div
        className="rounded-[var(--r-card)] md:rounded-[var(--r-card-lg)] bg-white p-5 md:p-7"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5 md:mb-6">
          <p className="eyebrow">Why these numbers are honest</p>
          <Link
            href="/methodology"
            className="text-xs font-semibold text-[color:var(--color-dark-green)] hover:text-[color:var(--color-near-black)] transition-colors inline-flex items-center gap-1.5"
          >
            Full methodology
            <ArrowRight aria-hidden="true" className="w-2.5 h-2.5" strokeWidth={2} />
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {TRUST_PILLARS.map((pillar) => (
            <li
              key={pillar.title}
              className="flex flex-col gap-2 p-4 md:p-5 rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)]"
            >
              {pillar.metric && (
                <span className="self-start inline-flex items-center px-2 py-0.5 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
                  {pillar.metric}
                </span>
              )}
              <h3 className="text-[15px] font-bold text-[color:var(--color-near-black)] leading-snug tracking-[-0.005em] mt-1">
                {pillar.title}
              </h3>
              <p className="text-[13px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
                {pillar.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

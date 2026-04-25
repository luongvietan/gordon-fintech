import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SPECIALTIES } from '@/lib/specialties';

/**
 * Featured specialty grid for the homepage.
 *
 * Eight curated IDs are pulled from `lib/specialties.ts` so cards stay
 * in sync with the canonical salary/training data the calculator and
 * the `/specialty/[slug]` profiles already share. The eight covers
 * the full income spectrum (primary care → neurosurgery) so a visitor
 * can find a card close to their own scenario without scrolling.
 *
 * Static server component — no client interactivity, no data fetching;
 * just a presentational shell that links into the existing profile
 * pages.
 */
const FEATURED_SPECIALTY_IDS = [
  'primary-care',
  'internal-medicine',
  'emergency-medicine',
  'anesthesiology',
  'radiology',
  'general-surgery',
  'orthopedics',
  'neurosurgery',
] as const;

const FEATURED = FEATURED_SPECIALTY_IDS.map((id) => {
  const s = SPECIALTIES.find((sp) => sp.id === id);
  if (!s) {
    throw new Error(
      `SpecialtySection: featured id "${id}" not found in SPECIALTIES`,
    );
  }
  return s;
});

export default function SpecialtySection() {
  return (
    <section
      aria-labelledby="home-specialty-heading"
      className="py-14 md:py-20 bg-white"
    >
      <div className="container">
        <div className="max-w-2xl mb-10 md:mb-12">
          <p className="eyebrow mb-4">Browse by specialty</p>
          <h2
            id="home-specialty-heading"
            className="display-section text-[color:var(--color-near-black)]"
            style={{ fontWeight: 900 }}
          >
            Salary, training length, and PSLF fit{' '}
            <span className="text-[color:var(--color-dark-green)]">
              for every common specialty.
            </span>
          </h2>
          <p className="mt-5 text-lg text-[color:var(--text-secondary)] leading-relaxed font-medium">
            Each profile pre-fills the calculator with the correct salary
            and residency length so you can model your specific path in
            seconds &mdash; no typing, no guessing.
          </p>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {FEATURED.map((s) => {
            const trainingLabel = s.trainingLabel ?? `${s.residencyYears}y`;
            const salaryLabel = `$${Math.round(s.attendingSalary / 1000)}K`;
            return (
              <li key={s.id}>
                <Link
                  href={`/specialty/${s.id}`}
                  className="group flex flex-col gap-2 h-full p-4 md:p-5 rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)] transition-all duration-150 hover:ring-[color:var(--color-dark-green)]/40 hover:bg-[color:var(--color-light-mint)]/40 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
                >
                  <span
                    className="text-[14px] md:text-[15px] tracking-[-0.005em] text-[color:var(--color-near-black)] leading-tight"
                    style={{ fontWeight: 900 }}
                  >
                    {s.label}
                  </span>
                  <span className="text-[12px] font-bold text-[color:var(--color-dark-green)] tabular-nums">
                    {salaryLabel}{' '}
                    <span className="font-semibold text-[color:var(--text-muted)]">
                      median &middot; {trainingLabel}
                    </span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-[color:var(--color-dark-green)] group-hover:underline">
                    See profile
                    <ArrowRight
                      aria-hidden="true"
                      className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 md:mt-10">
          <Link
            href="/specialty"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-dark-green)] hover:underline"
          >
            See all {SPECIALTIES.length} specialties
            <ArrowRight
              aria-hidden="true"
              className="w-3.5 h-3.5"
              strokeWidth={2.25}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

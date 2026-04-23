import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { listSpecialtyProfiles } from '@/lib/specialty-profiles';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medschooldebtcalculator.com';

export const metadata: Metadata = {
  title: 'Student Loan Repayment by Specialty — 16 Specialty Profiles',
  description:
    'Specialty-specific repayment guidance for medical residents and attendings. Salary bands, PSLF fit, and the calculator pre-seeded for all 16 specialties.',
  alternates: { canonical: '/specialty' },
  openGraph: {
    title: 'Student Loan Repayment by Specialty',
    description:
      'PSLF fit, salary bands, and repayment strategy for all 16 specialties.',
    type: 'website',
    url: `${SITE_URL}/specialty`,
  },
};

/**
 * /specialty — index of all 16 specialty profile pages.
 *
 * This is the parent of the dynamic `/specialty/[slug]` route. It exists
 * as its own SEO surface for the "list of specialties" query shape
 * (common from long-tail searches like "which specialty has the most
 * student debt"), and as a human nav landing from the blog / footer.
 */
export default function SpecialtyIndexPage() {
  const entries = listSpecialtyProfiles();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Specialties',
        item: `${SITE_URL}/specialty`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section
        className="pt-8 md:pt-10 pb-14 md:pb-20"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container container-wide">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)] mb-5 md:mb-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[color:var(--color-near-black)] transition-colors"
            >
              <ArrowLeft aria-hidden className="w-3 h-3" strokeWidth={2} />
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[color:var(--color-near-black)]">Specialties</span>
          </nav>

          <header className="mb-8 md:mb-10 max-w-3xl">
            <p className="eyebrow mb-3">Specialty guides</p>
            <h1
              className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] text-[color:var(--color-near-black)] tracking-[-0.025em] leading-[1]"
              style={{ fontWeight: 900 }}
            >
              Repayment is a different math problem for each specialty.
            </h1>
            <p className="mt-3 md:mt-4 text-[14px] md:text-[15px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
              Pediatrics optimizes for PSLF. Dermatology optimizes for speed.
              Pick your specialty to open the calculator pre-seeded with its
              salary band, training length, and repayment strategy notes.
            </p>
          </header>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {entries.map(({ specialty, profile }) => (
              <li key={specialty.id}>
                <Link
                  href={`/specialty/${specialty.id}`}
                  className="group block h-full p-4 md:p-5 rounded-[var(--r-card)] bg-white ring-1 ring-inset ring-[color:var(--border-subtle)] hover:ring-[color:var(--color-dark-green)] transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h2 className="text-[15px] md:text-[16px] font-bold text-[color:var(--color-near-black)] tracking-tight">
                      {specialty.label}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                      ${Math.round(specialty.attendingSalary / 1000)}K ·{' '}
                      {specialty.trainingLabel ?? `${specialty.residencyYears}y`}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[color:var(--text-secondary)] leading-snug mb-3">
                    Best strategy: <span className="font-bold text-[color:var(--color-near-black)]">{profile.strategyPick.label}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[color:var(--color-dark-green)] group-hover:gap-1.5 transition-all">
                    Open guide
                    <ArrowRight aria-hidden className="w-3 h-3" strokeWidth={2.25} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import TrackPageView from '@/components/analytics/TrackPageView';
import { SPECIALTIES, RESIDENT_SALARY, getSpecialtyById, type Specialty } from '@/lib/specialties';
import {
  getSpecialtyProfile,
  SPECIALTY_PROFILES,
  type SpecialtyProfile,
} from '@/lib/specialty-profiles';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medschooldebtcalculator.com';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render every specialty slug at build time. Rooted in SPECIALTIES
 * rather than the profiles map so we don't ship a page without math
 * defaults; a missing profile for a valid specialty is treated as a
 * build-time miss (`notFound()`), not a silent empty page.
 */
export function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = getSpecialtyProfile(slug);
  const specialty = getSpecialtyById(slug);
  if (!profile || !specialty) return {};
  return {
    title: profile.h1,
    description: profile.metaDescription,
    alternates: { canonical: `/specialty/${slug}` },
    openGraph: {
      title: profile.h1,
      description: profile.metaDescription,
      type: 'article',
      url: `${SITE_URL}/specialty/${slug}`,
    },
  };
}

/**
 * Pick 3 specialties to surface in the "Related" grid at the bottom.
 * Deterministic (stride through the SPECIALTIES list) so pages stay
 * cacheable and HTML is stable between builds.
 */
function pickRelated(
  currentId: string,
  count = 3,
): Array<{ specialty: Specialty; profile: SpecialtyProfile }> {
  const pool: Array<{ specialty: Specialty; profile: SpecialtyProfile }> = [];
  const idx = SPECIALTIES.findIndex((s) => s.id === currentId);
  const startFrom = idx >= 0 ? idx : 0;
  for (let i = 1; pool.length < count && i < SPECIALTIES.length; i++) {
    const spec = SPECIALTIES[(startFrom + i) % SPECIALTIES.length];
    const profile = SPECIALTY_PROFILES[spec.id];
    if (!profile || spec.id === currentId) continue;
    pool.push({ specialty: spec, profile });
  }
  return pool;
}

export default async function SpecialtyProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = getSpecialtyProfile(slug);
  const specialty = getSpecialtyById(slug);
  if (!profile || !specialty) notFound();

  // Resolve long-form copy with short-form fallbacks so every specialty
  // renders correctly before the content team fills in the optional
  // fields on `SpecialtyProfile`.
  const overview = profile.overview ?? profile.intro;
  const salaryBreakdown = profile.salaryBreakdown;
  const pslfStrategy = profile.pslfStrategy ?? profile.pslfNote;
  const repaymentRecommendation =
    profile.repaymentRecommendation ?? profile.strategyPick.reason;
  const keyTakeaways =
    profile.keyTakeaways && profile.keyTakeaways.length > 0
      ? profile.keyTakeaways
      : profile.bullets;
  const salarySource = profile.salarySource ?? 'MGMA 2025 / Doximity 2025';
  const salaryAttribution = 'via MGMA 2025 · Medscape 2024';
  const pgy1Salary = profile.pgy1Salary ?? RESIDENT_SALARY;
  const growthPct = (profile.residencyAnnualGrowth ?? 0.02) * 100;

  // Fellowship tile is only rendered when the specialty actually has a
  // fellowship baked into its training timeline. For specialties whose
  // published training duration is pure residency (Dermatology, Peds,
  // EM) the tile is suppressed entirely.
  const hasFellowship = (specialty.fellowshipYears ?? 0) > 0;
  const fellowshipYears = specialty.fellowshipYears ?? 0;
  const fellowshipSalary = profile.fellowshipSalary ?? 80000;

  const related = pickRelated(specialty.id, 3);
  const calcHref = `/calculator?specialty=${specialty.id}`;

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
      {
        '@type': 'ListItem',
        position: 3,
        name: specialty.label,
        item: `${SITE_URL}/specialty/${slug}`,
      },
    ],
  };

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: profile.h1,
    description: profile.metaDescription,
    author: { '@type': 'Organization', name: 'MedDebt Calculator' },
    publisher: { '@type': 'Organization', name: 'MedDebt Calculator' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/specialty/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <TrackPageView
        event="specialty_page_viewed"
        params={{ specialty_name: specialty.id }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="pt-10 md:pt-14 pb-12 md:pb-16 text-white"
        style={{
          background:
            'linear-gradient(120deg, var(--color-near-black) 0%, #163f33 100%)',
        }}
      >
        <div className="container container-wide">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] font-semibold text-white/60 mb-6 flex-wrap"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft aria-hidden className="w-3 h-3" strokeWidth={2} />
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/specialty" className="hover:text-white transition-colors">
              Specialties
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{specialty.label}</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-pill)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] text-[10px] font-black uppercase tracking-[0.14em] mb-4">
              Specialty Profile
            </span>
            <h1
              className="text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] tracking-[-0.025em] leading-[1]"
              style={{ fontWeight: 900 }}
            >
              {profile.h1}
            </h1>
            <p className="mt-4 md:mt-5 text-[15px] md:text-[17px] text-white/80 font-medium leading-relaxed">
              Realistic salary data, training timeline, and repayment strategy
              for {specialty.label}.
            </p>
            <Link
              href={calcHref}
              className="mt-6 md:mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-[var(--r-pill)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] text-[13px] font-black tracking-[-0.01em] transition-transform hover:scale-[1.03]"
            >
              Model your scenario
              <ArrowRight aria-hidden className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────── */}
      <section
        className="pt-12 md:pt-16 pb-14 md:pb-20"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container container-wide">
          <article className="max-w-4xl mx-auto flex flex-col gap-10 md:gap-12">
            {/* Overview */}
            <div>
              <h2
                className="text-[1.5rem] md:text-[1.875rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[1.05] mb-3"
                style={{ fontWeight: 900 }}
              >
                Overview
              </h2>
              <p className="text-[15px] md:text-[16px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
                {overview}
              </p>
            </div>

            {/* Salary & Compensation card */}
            <div
              className="rounded-[var(--r-card)] p-6 md:p-8 bg-[color:var(--color-light-mint)] ring-1 ring-inset ring-[color:var(--color-wise-green)]/40"
              style={{ boxShadow: 'var(--shadow-ring)' }}
            >
              <h2
                className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-dark-green)] tracking-[-0.02em] leading-[1.05] mb-5"
                style={{ fontWeight: 900 }}
              >
                Physician salary &amp; compensation
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-5">
                <Metric
                  label="Median salary"
                  value={`$${Math.round(profile.salaryBand.median / 1000)}K`}
                  sub={salaryAttribution}
                  valueClass="text-[2rem] md:text-[2.25rem] text-[color:var(--color-dark-green)]"
                />
                <Metric
                  label="Range"
                  value={`$${Math.round(profile.salaryBand.low / 1000)}K – $${Math.round(profile.salaryBand.high / 1000)}K`}
                  sub={salaryAttribution}
                  valueClass="text-[1.125rem] md:text-[1.25rem] text-[color:var(--color-near-black)]"
                />
                <Metric
                  label="Source"
                  value={salarySource}
                  valueClass="text-[13px] md:text-[14px] text-[color:var(--color-near-black)] font-bold normal-case"
                />
              </div>

              {salaryBreakdown && (
                <p className="text-[14px] md:text-[15px] text-[color:var(--color-near-black)]/90 leading-relaxed font-medium">
                  {salaryBreakdown}
                </p>
              )}
            </div>

            {/* Residency training timeline */}
            <div>
              <h2
                className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[1.05] mb-4"
                style={{ fontWeight: 900 }}
              >
                Residency training timeline
              </h2>

              <div
                className="rounded-[var(--r-card)] p-6 md:p-7 bg-white ring-1 ring-inset ring-[color:var(--border-subtle)] grid grid-cols-2 md:grid-cols-4 gap-5"
                style={{ boxShadow: 'var(--shadow-ring)' }}
              >
                <Metric
                  label="Training years"
                  value={specialty.trainingLabel ?? `${specialty.residencyYears}y`}
                  valueClass="text-[2rem] md:text-[2.25rem] text-[color:var(--color-near-black)]"
                />
                <Metric
                  label="PGY-1 salary"
                  value={`$${Math.round(pgy1Salary / 1000)}K`}
                  valueClass="text-[1.5rem] md:text-[1.75rem] text-[color:var(--color-near-black)]"
                />
                <Metric
                  label="Annual growth"
                  value={`${growthPct.toFixed(1)}%`}
                  valueClass="text-[1.5rem] md:text-[1.75rem] text-[color:var(--color-near-black)]"
                />
                {hasFellowship ? (
                  <Metric
                    label="Fellowship"
                    value={`${fellowshipYears}y · $${Math.round(fellowshipSalary / 1000)}K`}
                    valueClass="text-[15px] text-[color:var(--color-near-black)] font-bold"
                  />
                ) : (
                  <Metric
                    label="Fellowship"
                    value="Optional"
                    sub="Not baked into training"
                    valueClass="text-[15px] text-[color:var(--text-muted)] font-bold"
                  />
                )}
              </div>

              <p className="mt-4 text-[14px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
                Most {specialty.label.toLowerCase()} trainees follow a{' '}
                {specialty.trainingLabel ?? `${specialty.residencyYears}-year`}{' '}
                track. PGY-1 pay starts around ${Math.round(pgy1Salary / 1000)}K
                with roughly {growthPct.toFixed(1)}% annual raises.
                {hasFellowship && (
                  <>
                    {' '}
                    An additional {fellowshipYears}-year fellowship extends
                    training and affects payoff timing.
                  </>
                )}
              </p>
            </div>

            {/* PSLF & forgiveness strategy */}
            <div
              className="rounded-[var(--r-card)] p-6 md:p-8 bg-[#fff8ea] border-l-4 border-amber-500"
              style={{ boxShadow: 'var(--shadow-ring)' }}
            >
              <h2
                className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[1.05] mb-3"
                style={{ fontWeight: 900 }}
              >
                PSLF &amp; forgiveness strategy
              </h2>
              <p className="text-[14px] md:text-[15px] text-[color:var(--color-near-black)]/90 leading-relaxed font-medium">
                {pslfStrategy}
              </p>
            </div>

            {/* Repayment recommendation */}
            <div
              className="rounded-[var(--r-card)] p-6 md:p-8 bg-white ring-1 ring-inset ring-[color:var(--border-subtle)]"
              style={{ boxShadow: 'var(--shadow-ring)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-2">
                Our pick · {profile.strategyPick.label}
              </p>
              <h2
                className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[1.05] mb-3"
                style={{ fontWeight: 900 }}
              >
                Repayment recommendation
              </h2>
              <p className="text-[14px] md:text-[15px] text-[color:var(--text-secondary)] leading-relaxed font-medium mb-5">
                {repaymentRecommendation}
              </p>
              <Link
                href={calcHref}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-pill)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] text-[12.5px] font-black tracking-[-0.01em] transition-transform hover:scale-[1.03]"
              >
                Run your numbers for {specialty.label}
                <ArrowRight aria-hidden className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Key takeaways */}
            <div>
              <h2
                className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[1.05] mb-5"
                style={{ fontWeight: 900 }}
              >
                Key takeaways
              </h2>
              <ul className="flex flex-col gap-3">
                {keyTakeaways.map((takeaway, i) => (
                  <li
                    key={`takeaway-${i}`}
                    className="flex gap-3 items-start text-[14px] md:text-[15px] text-[color:var(--color-near-black)] leading-relaxed font-medium"
                  >
                    <span
                      aria-hidden
                      className="mt-[3px] flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]"
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Green CTA banner */}
            <div className="rounded-[var(--r-card)] p-8 md:p-10 bg-[color:var(--color-dark-green)] text-white text-center">
              <h2
                className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.02em] leading-[1.1] mb-3"
                style={{ fontWeight: 900 }}
              >
                Ready to model your debt strategy?
              </h2>
              <p className="text-[14px] md:text-[15px] text-white/80 leading-relaxed font-medium max-w-xl mx-auto mb-6">
                Compare PSLF, refinancing, and aggressive payoff for your{' '}
                {specialty.label} scenario — pre-filled with the salary and
                training defaults from this page.
              </p>
              <Link
                href={calcHref}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--r-pill)] bg-white text-[color:var(--color-dark-green)] text-[13px] font-black tracking-[-0.01em] transition-transform hover:scale-[1.03]"
              >
                Open the calculator
                <ArrowRight aria-hidden className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ── Related specialties grid ─────────────────────────── */}
      {related.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-t border-[color:var(--border-subtle)]">
          <div className="container container-wide">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[1.05] mb-6"
                style={{ fontWeight: 900 }}
              >
                Related specialties
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map(({ specialty: spec, profile: prof }) => (
                  <Link
                    key={spec.id}
                    href={`/specialty/${spec.id}`}
                    className="group p-5 rounded-[var(--r-card)] bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)] hover:ring-[color:var(--color-dark-green)] transition-colors"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-1.5">
                      {prof.eyebrow}
                    </p>
                    <h3 className="text-[16px] font-black text-[color:var(--color-near-black)] tracking-tight mb-2">
                      {spec.label}
                    </h3>
                    <p className="text-[12.5px] text-[color:var(--text-secondary)] font-medium leading-snug mb-3">
                      ${Math.round(prof.salaryBand.median / 1000)}K median ·{' '}
                      {spec.trainingLabel ?? `${spec.residencyYears}y`} training
                    </p>
                    <span className="inline-flex items-center gap-1 text-[12px] font-black text-[color:var(--color-dark-green)] group-hover:gap-1.5 transition-all">
                      View profile
                      <ArrowRight aria-hidden className="w-3 h-3" strokeWidth={2.5} />
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-[color:var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11.5px] text-[color:var(--text-muted)] font-medium">
                  All figures median estimates. Sources: MGMA 2025, AAMC GQ
                  2025, Doximity 2025.
                </p>
                <Link
                  href="/specialty"
                  className="text-[12.5px] font-black text-[color:var(--color-dark-green)] hover:underline"
                >
                  See all 16 specialties →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/**
 * Consistent metric tile for salary + training cards. Keeps label /
 * value / sub sizing uniform across the two grids without pulling in
 * one-off classnames at each call site.
 */
function Metric({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-1.5">
        {label}
      </p>
      <p
        className={`${valueClass} leading-none tabular-nums tracking-[-0.02em]`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-[color:var(--text-muted)] font-medium mt-1.5">
          {sub}
        </p>
      )}
    </div>
  );
}

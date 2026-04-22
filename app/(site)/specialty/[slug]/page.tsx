import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, MinusCircle, Star } from 'lucide-react';
import Calculator from '@/components/calculator/Calculator';
import TrackPageView from '@/components/analytics/TrackPageView';
import type { CalculatorInputs } from '@/lib/calculator';
import { SPECIALTIES, RESIDENT_SALARY, getSpecialtyById } from '@/lib/specialties';
import { getSpecialtyProfile } from '@/lib/specialty-profiles';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medschooldebtcalculator.com';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render every specialty slug at build time. Rooted in SPECIALTIES
 * rather than the profiles map so we don't ship a page without math
 * defaults. A missing profile for a valid specialty is treated as a
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
    title: `${profile.h1} — MedDebt Calculator`,
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
 * Build CalculatorInputs seed values from a Specialty. We only override
 * the fields the specialty profile actually drives — everything else
 * stays at the app-wide default, so toggling PSLF or spouse still works
 * as users expect.
 *
 * Fellowship behavior: when a specialty lists `fellowshipYears`, we keep
 * the total training duration (`residencyYears`) intact on the base spec
 * and ALSO split out the fellowship tail explicitly, so the UI shows
 * "residency + fellowship" correctly. For specialties with no explicit
 * fellowship split (e.g. Dermatology), we leave fellowshipYears at 0.
 */
function seedFromSpecialty(slug: string): Partial<CalculatorInputs> | undefined {
  const s = getSpecialtyById(slug);
  if (!s) return undefined;
  const fellowshipYears = s.fellowshipYears ?? 0;
  const residencyOnly = Math.max(1, s.residencyYears - fellowshipYears);
  return {
    attendingSalary: s.attendingSalary,
    residencyYears: residencyOnly,
    fellowshipYears,
    residencyStartingSalary: RESIDENT_SALARY,
  };
}

function fitBadge(fit: 'often' | 'mixed' | 'rarely') {
  if (fit === 'often') {
    return {
      icon: CheckCircle2,
      label: 'PSLF: strong fit',
      color: 'text-[color:var(--color-dark-green)]',
      bg: 'bg-[color:var(--color-light-mint)]',
    };
  }
  if (fit === 'mixed') {
    return {
      icon: Circle,
      label: 'PSLF: mixed',
      color: 'text-[#b5651d]',
      bg: 'bg-[#fff4e6]',
    };
  }
  return {
    icon: MinusCircle,
    label: 'PSLF: rarely wins',
    color: 'text-[#7a3f0a]',
    bg: 'bg-[#fff4e6]',
  };
}

function fitRating(fit: 'often' | 'mixed' | 'rarely') {
  if (fit === 'often') return 5;
  if (fit === 'mixed') return 3;
  return 1;
}

const RELATED_GUIDES = [
  { href: '/blog/pslf-explained-for-doctors', label: 'PSLF explained for doctors' },
  { href: '/blog/when-to-refinance-medical-school-loans', label: 'When to refinance: a decision guide' },
  { href: '/blog/idr-plans-for-doctors-paye-save-ibr', label: 'SAVE vs PAYE vs IBR for doctors' },
  { href: '/blog/doctor-salary-by-specialty', label: 'Doctor salary by specialty' },
];

export default async function SpecialtyProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = getSpecialtyProfile(slug);
  const specialty = getSpecialtyById(slug);
  if (!profile || !specialty) notFound();

  const seed = seedFromSpecialty(slug);
  const fit = fitBadge(profile.pslfFit);
  const rating = fitRating(profile.pslfFit);
  const FitIcon = fit.icon;
  const debtToIncome = profile.typicalDebt.median / profile.salaryBand.median;

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
        params={{ specialty_id: specialty.id }}
      />

      <section
        className="pt-8 md:pt-10 pb-14 md:pb-20"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container container-wide">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)] mb-5 md:mb-6 flex-wrap"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[color:var(--color-near-black)] transition-colors"
            >
              <ArrowLeft aria-hidden className="w-3 h-3" strokeWidth={2} />
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link
              href="/specialty"
              className="hover:text-[color:var(--color-near-black)] transition-colors"
            >
              Specialties
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[color:var(--color-near-black)]">
              {specialty.label}
            </span>
          </nav>

          <header className="mb-8 md:mb-10 max-w-3xl">
            <p className="eyebrow mb-3">{profile.eyebrow}</p>
            <h1
              className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] text-[color:var(--color-near-black)] tracking-[-0.025em] leading-[1]"
              style={{ fontWeight: 900 }}
            >
              {profile.h1}
            </h1>
            <p className="mt-3 md:mt-4 text-[14px] md:text-[15px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
              {profile.intro}
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <StatTile
                label="Typical attending salary"
                value={`$${Math.round(profile.salaryBand.median / 1000)}K`}
                sub={`$${Math.round(profile.salaryBand.low / 1000)}K – $${Math.round(profile.salaryBand.high / 1000)}K`}
              />
              <StatTile
                label="Typical debt at graduation"
                value={`$${Math.round(profile.typicalDebt.median / 1000)}K`}
                sub={`$${Math.round(profile.typicalDebt.low / 1000)}K – $${Math.round(profile.typicalDebt.high / 1000)}K`}
              />
              <StatTile
                label="Training"
                value={specialty.trainingLabel ?? `${specialty.residencyYears}y`}
                sub={
                  specialty.fellowshipYears
                    ? `incl. ${specialty.fellowshipYears}y fellowship`
                    : 'residency only'
                }
              />
              <StatTile
                label="Debt-to-income"
                value={`${debtToIncome.toFixed(2)}x`}
                sub="Median debt / median attending salary"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mb-8 md:mb-10">
            <aside className="lg:col-span-1 flex flex-col gap-4">
              <div
                className={`p-4 rounded-[var(--r-card)] ring-1 ring-inset ring-[color:var(--border-subtle)] ${fit.bg}`}
              >
                <div className={`inline-flex items-center gap-1.5 mb-2 ${fit.color}`}>
                  <FitIcon aria-hidden className="w-3.5 h-3.5" strokeWidth={2.25} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    {fit.label}
                  </span>
                </div>
                <p className="text-[12.5px] text-[color:var(--color-near-black)] leading-snug font-medium">
                  {profile.pslfNote}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={`star-${i}`}
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 ${
                        i < rating ? 'fill-current' : 'opacity-25'
                      }`}
                      strokeWidth={2}
                    />
                  ))}
                  <span className="text-[11px] font-bold uppercase tracking-[0.10em]">
                    {rating}/5 viability
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-[var(--r-card)] bg-white ring-1 ring-inset ring-[color:var(--border-subtle)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-1.5">
                  Best strategy
                </p>
                <p className="text-[14px] font-bold text-[color:var(--color-near-black)] mb-2 tracking-tight">
                  {profile.strategyPick.label}
                </p>
                <p className="text-[12.5px] text-[color:var(--text-secondary)] leading-snug">
                  {profile.strategyPick.reason}
                </p>
              </div>

              <div className="p-4 rounded-[var(--r-card)] bg-white ring-1 ring-inset ring-[color:var(--border-subtle)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-2">
                  What changes for this specialty
                </p>
                <ul className="flex flex-col gap-1.5 text-[12.5px] leading-snug text-[color:var(--color-near-black)]">
                  {profile.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span
                        aria-hidden
                        className="mt-[6px] w-1 h-1 rounded-full flex-shrink-0 bg-[color:var(--color-dark-green)]"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[var(--r-card)] bg-white ring-1 ring-inset ring-[color:var(--border-subtle)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-2">
                  Related guides
                </p>
                <ul className="flex flex-col gap-2">
                  {RELATED_GUIDES.map((guide) => (
                    <li key={guide.href}>
                      <Link
                        href={guide.href}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[color:var(--color-dark-green)] hover:underline"
                      >
                        {guide.label}
                        <ArrowRight aria-hidden className="w-3 h-3" strokeWidth={2} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-[color:var(--text-muted)] font-medium">
                  Calculator prefilled with {specialty.label} salary and training defaults.
                </p>
                <a
                  href="#specialty-calculator"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-pill)] text-[12px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform hover:scale-[1.03]"
                >
                  Jump to prefilled calculator
                  <ArrowRight aria-hidden className="w-3 h-3" strokeWidth={2} />
                </a>
              </div>
              <div id="specialty-calculator">
              <Calculator initialInputs={seed} />
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-[color:var(--border-subtle)]">
            <p className="text-[12px] text-[color:var(--text-muted)] font-medium">
              All figures median estimates. Sources: MGMA 2025, AAMC GQ 2025, Doximity 2025.
            </p>
            <Link
              href="/specialty"
              className="text-[12.5px] font-bold text-[color:var(--color-dark-green)] hover:underline"
            >
              See all specialties →
            </Link>
          </footer>
        </div>
      </section>
    </>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-3.5 rounded-[var(--r-card-sm)] bg-white ring-1 ring-inset ring-[color:var(--border-subtle)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-1">
        {label}
      </p>
      <p className="text-[20px] font-black tracking-tight text-[color:var(--color-near-black)] leading-none">
        {value}
      </p>
      <p className="text-[11px] text-[color:var(--text-secondary)] font-medium mt-1">
        {sub}
      </p>
    </div>
  );
}

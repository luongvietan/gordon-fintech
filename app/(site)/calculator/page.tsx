import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import Calculator from '@/components/calculator/Calculator';
import { seedFromSpecialty } from '@/lib/specialty-seed';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medschooldebtcalculator.com';

interface PageProps {
  searchParams: Promise<{ specialty?: string }>;
}

export const metadata: Metadata = {
  title: 'Med School Debt Calculator — Run Your Numbers',
  description:
    'Direct-access calculator for medical school debt. PSLF vs refinance vs aggressive payoff, 16 specialty presets, net-worth crossover — no marketing, just the tool.',
  alternates: { canonical: '/calculator' },
  openGraph: {
    title: 'Med School Debt Calculator — Run Your Numbers',
    description:
      'Direct-access calculator for medical school debt. PSLF, refinance, aggressive payoff, side-by-side.',
    type: 'website',
    url: `${SITE_URL}/calculator`,
  },
};

/**
 * /calculator — a dedicated, minimal route that loads the calculator
 * tool directly, without any of the homepage's marketing chrome (hero,
 * stats grid, "Why these numbers are honest", FAQ, etc.).
 *
 * Who this is for:
 *   • Return visitors who already know what the tool is.
 *   • Blog readers arriving from article CTAs ("Open the calculator").
 *   • Anyone linked to the tool from another site.
 *
 * The homepage remains the primary landing experience for new
 * visitors; this route is purely a shortcut into the running tool.
 */
export default async function CalculatorPage({ searchParams }: PageProps) {
  // Specialty pre-fill: `/calculator?specialty=<id>` seeds the same
  // salary + training defaults that the /specialty/[slug] CTA button
  // uses. Unknown or missing slugs fall back to the calculator's app-
  // wide defaults — we never 404 the tool because of a bad query param.
  const { specialty: specialtyParam } = await searchParams;
  const initialInputs = specialtyParam ? seedFromSpecialty(specialtyParam) : undefined;

  const applicationLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MedDebt Calculator',
    applicationCategory: 'FinanceApplication',
    description:
      'Interactive medical school debt calculator with PSLF comparison, 16 specialty salary presets, and net-worth projections.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    operatingSystem: 'Web',
    url: `${SITE_URL}/calculator`,
  };

  // BreadcrumbList mirrors the visible nav above. Kept in sync with the
  // visual breadcrumb so Google doesn't flag a schema-vs-content mismatch.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Calculator',
        item: `${SITE_URL}/calculator`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section
        className="pt-8 md:pt-10 pb-14 md:pb-24"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container container-wide">
          {/* Minimal breadcrumb — gives returning users a clear escape
              hatch back to the full home experience without pulling any
              marketing content onto this page. */}
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
            <span className="text-[color:var(--color-near-black)]">Calculator</span>
          </nav>

          {/* Minimal page header — one line of context, no upsell. */}
          <header className="mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 max-w-2xl">
              <p className="eyebrow mb-3">The tool</p>
              <h1
                className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] text-[color:var(--color-near-black)] tracking-[-0.025em] leading-[0.98]"
                style={{ fontWeight: 900 }}
              >
                Run your numbers.
              </h1>
              <p className="mt-3 md:mt-4 text-[14px] md:text-[15px] text-[color:var(--text-secondary)] font-medium leading-relaxed max-w-xl">
                PSLF vs refinance vs aggressive payoff, side-by-side. 16
                specialty presets. Charts redraw the moment a number changes.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-pill)] bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
              <Lock aria-hidden className="w-3 h-3" strokeWidth={2.25} />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                Runs in your browser
              </span>
            </div>
          </header>

          <Calculator initialInputs={initialInputs} />
        </div>
      </section>
    </>
  );
}

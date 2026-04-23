import type { Metadata } from 'next';
import Link from 'next/link';
import ResidentBudgetCalculator from '@/components/budget/ResidentBudgetCalculator';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medschooldebtcalculator.com';

export const metadata: Metadata = {
  title: 'Resident Budget Calculator — After-Tax Income & Savings | MedDebt Calculator',
  description:
    'Enter your PGY year and location to see after-tax income, estimated living expenses, student loan payment, and savings potential as a medical resident.',
  alternates: { canonical: '/budget' },
  openGraph: {
    title: 'Resident Budget Calculator',
    description:
      'After-tax income, living expenses, and loan payment estimates for medical residents by PGY year and city.',
    type: 'website',
    url: `${SITE_URL}/budget`,
  },
};

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Resident Budget Calculator',
      item: `${SITE_URL}/budget`,
    },
  ],
};

export default function BudgetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <section
        className="pt-8 md:pt-10 pb-14 md:pb-20"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container container-wide">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)] mb-5 flex-wrap"
          >
            <Link
              href="/"
              className="hover:text-[color:var(--color-near-black)] transition-colors"
            >
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[color:var(--color-near-black)]">Resident Budget</span>
          </nav>

          <header className="mb-8 md:mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Resident Finance</p>
            <h1
              className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] text-[color:var(--color-near-black)] tracking-[-0.025em] leading-[1]"
              style={{ fontWeight: 900 }}
            >
              Resident budget calculator.
            </h1>
            <p className="mt-3 md:mt-4 text-[14px] md:text-[15px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
              Enter your PGY year, gross stipend, and location cost-of-living tier to
              see a realistic after-tax budget breakdown — including your estimated
              IDR student loan payment.
            </p>
          </header>

          <ResidentBudgetCalculator />

          <div className="mt-8 pt-6 border-t border-[color:var(--border-subtle)]">
            <p className="text-[13px] text-[color:var(--text-muted)] font-medium mb-3">
              Ready to model your full loan repayment over your entire career?
            </p>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--r-pill)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] font-bold text-[14px] transition-transform hover:scale-[1.02]"
            >
              Open the full MedDebt Calculator →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

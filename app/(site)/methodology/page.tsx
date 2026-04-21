import type { Metadata } from 'next';
import LegalPageShell from '@/components/layout/LegalPageShell';

export const metadata: Metadata = {
  title: 'Methodology — How We Calculate | MedDebt Calculator',
  description:
    'Data sources, assumptions, and formulas behind the Med School Debt Calculator. AAMC debt stats, MGMA/Medscape specialty salaries, PSLF rules, and interest capitalization logic.',
  alternates: { canonical: '/methodology' },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medschooldebtcalculator.com';

// Methodology is an authoritative "how we compute" reference — good
// candidate for rich-result surfacing when Google indexes "PSLF formula"
// / "IDR capitalization" queries.
const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Methodology',
      item: `${SITE_URL}/methodology`,
    },
  ],
};

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <LegalPageShell
        eyebrow="Methodology"
        title="How we compute the numbers."
        description="Every default in the calculator traces back to a published source. Here is exactly what we use, where it comes from, and the assumptions baked into the projections."
        lastUpdated="April 2026"
      >
      <h2>Specialty salaries</h2>
      <p>
        The 16 built-in specialty presets use attending-compensation figures
        triangulated from the{' '}
        <a href="https://www.mgma.com/" target="_blank" rel="noopener noreferrer">
          MGMA Provider Compensation Survey
        </a>
        , the{' '}
        <a
          href="https://www.medscape.com/sites/public/physician-compensation"
          target="_blank"
          rel="noopener noreferrer"
        >
          Medscape Physician Compensation Report
        </a>
        , and{' '}
        <a href="https://www.aamc.org/" target="_blank" rel="noopener noreferrer">
          AAMC
        </a>{' '}
        academic-salary benchmarks. We use the median (not the mean) to avoid
        tails from a small number of very high earners.
      </p>
      <p>
        Residency stipend defaults to the national PGY-1 median (~$63K) with a
        2% annual growth rate across training years — roughly in line with CPI.
        Fellowship salary defaults can be overridden per scenario.
      </p>

      <h2>Debt and interest</h2>
      <p>
        Default debt of $250,000 reflects the 2024–2025 AAMC graduation survey
        for MD students with debt (DO graduates typically carry slightly more).
        Default federal interest rate of 6.5% matches the 2024 Direct Unsubsidized
        rate for graduate students; private refinance rates are modeled
        separately and do not carry federal protections.
      </p>
      <p>
        Interest capitalization follows federal rules: unpaid accrued interest
        is added to principal only at defined events (end of grace, end of
        forbearance, leaving an IDR plan, loss of PSLF eligibility). The default
        scenario assumes capitalization only at the end of training — toggle
        available in the advanced panel.
      </p>

      <h2>PSLF</h2>
      <p>
        Public Service Loan Forgiveness requires 120 qualifying monthly payments
        while working full-time for a 501(c)(3) non-profit or government
        employer. We count residency payments when PSLF-eligible, which
        substantially changes the math for primary-care and academic specialties.
        The forgiven balance is modeled as tax-free at the federal level, per
        current IRS guidance.
      </p>

      <h2>Net-worth projection</h2>
      <p>
        Net worth is computed as cumulative after-tax income minus living
        expenses minus loan payments, plus investment growth on any remaining
        discretionary income. Defaults:
      </p>
      <ul>
        <li>Effective tax rate: 32% (federal + state blended for attendings)</li>
        <li>Investment return: 7% annualized (long-run S&amp;P 500 real return is closer to 6–7%)</li>
        <li>Inflation (CPI): 2.5%</li>
        <li>Living expenses: $3,000/month residency, $5,500/month attending</li>
      </ul>
      <p>
        The &ldquo;net-worth crossover&rdquo; is the first year in which
        projected net worth first reaches zero — i.e. debt-minus-assets flips
        positive. This is the single most useful framing of payoff progress for
        most borrowers.
      </p>

      <h2>What the calculator does not model</h2>
      <p>
        To keep the tool fast and predictable, we intentionally omit:
      </p>
      <ul>
        <li>Marriage / spousal income (affects IDR calculations materially)</li>
        <li>State income-tax variation beyond the blended default</li>
        <li>Variable-rate private loans or loan refinance ladders</li>
        <li>Employer loan repayment benefits, signing bonuses, moonlighting</li>
        <li>Specific tax treatment of IDR forgiveness (non-PSLF)</li>
      </ul>

      <h2>Disclaimer</h2>
      <p>
        This is an educational projection, not personalized advice. Your real
        numbers will differ. If you&apos;re making a six-figure decision (PSLF vs
        refinance, public vs private employer), consult a fiduciary advisor who
        specializes in physician finance.
      </p>
      </LegalPageShell>
    </>
  );
}

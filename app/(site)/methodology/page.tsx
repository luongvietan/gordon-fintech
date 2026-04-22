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
        Residency stipend defaults to the national PGY-1 median (~$65K) with a
        2% annual growth rate across training years — roughly in line with CPI.
        Fellowship salary defaults can be overridden per scenario.
      </p>

      <h2>Debt and interest</h2>
      <p>
        Default debt of $250,000 reflects the 2025 AAMC graduation survey
        for MD students with debt (DO graduates typically carry slightly more).
        Default federal interest rate of 6.5% matches the 2025 Direct Unsubsidized
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

      <h2>Private refinancing</h2>
      <p>
        When the refinancing option is enabled, the calculator models a private
        refinance that takes effect at the start of the attending phase — after
        residency and fellowship. The training-phase balance (already accounting
        for interest capitalization rules) becomes the refi principal. Key
        assumptions:
      </p>
      <ul>
        <li>Standard amortization formula at the user-entered rate over the chosen term</li>
        <li>Origination fee (if any) is rolled into the principal</li>
        <li>No income-based payment flexibility — fixed monthly payment throughout</li>
        <li>Refinancing converts federal loans to private, permanently forfeiting PSLF,
          IDR plans, federal forbearance, and death/disability discharge protections</li>
        <li>Actual rates vary by credit score, debt-to-income ratio, and lender;
          the user is responsible for verifying current market rates</li>
      </ul>
      <p>
        The breakeven analysis compares true total cost (payments only — no federal
        forgiveness) between PSLF and refinancing for the user&apos;s scenario. It
        is a directional indicator, not a guarantee.
      </p>

      <h2>Spouse and household income</h2>
      <p>
        The calculator&rsquo;s Expert Mode includes full dual-income modeling:
        spouse income, spouse debt, Married Filing Jointly vs.&nbsp;Married
        Filing Separately filing status, and household-size-aware IDR
        calculations. When filing jointly, spouse income raises the borrower&rsquo;s
        AGI for IDR purposes; when filing separately, it is excluded but the
        borrower incurs an MFS tax-drag penalty (adjustable in advanced
        settings).
      </p>
      <p>
        Spouse debt is modeled at a simplified level (minimum, standard, or
        aggressive repayment) for household net-worth projections but does not
        receive its own month-by-month interest + forgiveness simulation. For
        married couples where both spouses carry complex federal debt, consult
        a fiduciary advisor.
      </p>

      <h2>Job-change modeling</h2>
      <p>
        Expert Mode also supports mid-attending job changes. Users can specify a
        year (1-indexed from the start of the attending phase) at which their
        salary steps to a new value and — critically — whether the new employer
        qualifies for PSLF. When the new employer does not qualify, the
        120-qualifying-payment counter freezes from that year onward while
        IDR payments continue, modeling the real-world cost of losing PSLF
        eligibility mid-career.
      </p>

      <h2>What the calculator does not model</h2>
      <p>
        To keep the tool fast and predictable, we intentionally omit:
      </p>
      <ul>
        <li>State income-tax variation beyond the blended default</li>
        <li>Variable-rate private loans or refinance rate ladders</li>
        <li>Employer loan repayment benefits, signing bonuses, moonlighting</li>
        <li>
          Specific tax treatment of IDR forgiveness (non-PSLF) &mdash; the
          Tax Bomb Card provides a directional estimate using IRS brackets,
          but state-level treatment is intentionally omitted
        </li>
        <li>Partial-year disruption scenarios (PSLF stress test uses whole years)</li>
        <li>
          Spouse-specific forgiveness simulation &mdash; spouse debt uses a
          simplified fixed-repayment model rather than a full month-by-month
          IDR + PSLF engine
        </li>
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

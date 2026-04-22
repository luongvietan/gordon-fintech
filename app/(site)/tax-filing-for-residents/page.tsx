import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageShell from '@/components/layout/LegalPageShell';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medschooldebtcalculator.com';

export const metadata: Metadata = {
  title: 'Tax Filing Strategies for Medical Residents | MedDebt Calculator',
  description:
    'MFJ vs MFS, estimated quarterly payments, state income tax, and how your filing status affects IDR student loan payments. A practical guide for resident physicians.',
  alternates: { canonical: '/tax-filing-for-residents' },
  openGraph: {
    title: 'Tax Filing Strategies for Medical Residents',
    description:
      'How your filing status affects IDR student loan payments — plus quarterly taxes, state tax impact, and MFJ vs MFS analysis.',
    type: 'article',
    url: `${SITE_URL}/tax-filing-for-residents`,
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
      name: 'Tax Filing for Residents',
      item: `${SITE_URL}/tax-filing-for-residents`,
    },
  ],
};

export default function TaxFilingForResidentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <LegalPageShell
        eyebrow="Resident Finance"
        title="Tax filing strategies for medical residents."
        description="Your filing status has an outsized effect on your student loan payments during training. Here is what every resident needs to know before filing."
        lastUpdated="April 2026"
      >
        <h2>Why filing status matters more for residents than anyone else</h2>
        <p>
          Most residents are on Income-Driven Repayment (IDR) — meaning your monthly
          student loan payment is a percentage of your discretionary income. The IRS
          formula for discretionary income uses your Adjusted Gross Income (AGI),
          and your AGI depends entirely on how you file.
        </p>
        <p>
          If you are married, filing Jointly (MFJ) combines your income and your
          spouse&rsquo;s income into a single AGI. Filing Separately (MFS) shields
          your spouse&rsquo;s income from the IDR calculation — your payment is
          based on your income alone.
        </p>
        <p>
          The difference can be thousands of dollars per year in loan payments
          during residency.
        </p>

        <h2>Married Filing Jointly (MFJ) vs Married Filing Separately (MFS)</h2>
        <p>
          <strong>MFJ:</strong> Your IDR payment is based on combined household AGI.
          If your spouse earns $80K and you earn $65K as a PGY-1, your IDR payment
          is computed on ~$145K of income. This significantly increases your minimum
          required IDR payment.
        </p>
        <p>
          <strong>MFS:</strong> Your IDR payment is based on your income only (~$65K).
          This dramatically lowers your payment floor. However, MFS has a tax cost:
          you lose access to many deductions and credits (student loan interest
          deduction, IRA contribution deductibility, some credits for children).
          The IRS penalizes MFS in its bracket structure — MFS brackets are exactly
          half the MFJ brackets, which can push you into a higher effective rate.
        </p>
        <p>
          <strong>Rule of thumb:</strong> If your spouse earns more than about
          $40,000/year, running the MFS calculation is usually worth it. The loan
          payment savings often outweigh the tax penalty, especially during 3–7 years
          of residency/fellowship. Run both scenarios in the{' '}
          <Link href="/calculator" className="text-[color:var(--color-dark-green)] font-semibold hover:underline">
            MedDebt Calculator
          </Link>{' '}
          using the Household section to compare.
        </p>

        <h2>How to model MFJ vs MFS in the calculator</h2>
        <ol>
          <li>Enable Expert Mode in the calculator (toggle at the top of the inputs)</li>
          <li>Open the <strong>Household</strong> section and enable spouse income</li>
          <li>Enter your spouse&rsquo;s income and your family size</li>
          <li>Toggle between <strong>MFJ</strong> and <strong>MFS</strong> filing status</li>
          <li>
            The Household Filing Comparison card in the results will show your
            IDR payment under each scenario and the estimated net savings
          </li>
        </ol>

        <h2>Estimated quarterly tax payments (residents with side income)</h2>
        <p>
          If you receive any income beyond your W-2 residency stipend — moonlighting,
          medical consulting, research stipends, locums — you likely owe quarterly
          estimated taxes to the IRS and your state.
        </p>
        <p>
          The IRS &ldquo;safe harbor&rdquo; rule: pay at least 100% of last
          year&rsquo;s total tax liability (or 90% of this year&rsquo;s) to avoid
          underpayment penalties. Quarterly deadlines are April 15, June 15,
          September 15, and January 15.
        </p>
        <p>
          As a rough estimate: if you earned $10,000 moonlighting this quarter
          and your marginal federal rate is 22%, set aside roughly $2,500 for
          federal + self-employment taxes (~15.3% SE tax on top of income tax,
          minus the deduction for half of SE tax). Most states add another 3–8%.
        </p>

        <h2>How IDR and filing status interact</h2>
        <p>
          Your IDR payment formula (PAYE / SAVE / IBR) is:
        </p>
        <pre style={{ background: 'var(--color-off-white)', borderRadius: 8, padding: '12px 16px', fontSize: 13, overflowX: 'auto' }}>
          {'Monthly payment = max(0, AGI − 150% × federal poverty line) × 10% ÷ 12'}
        </pre>
        <p>
          The federal poverty line (150% threshold) for a single person is
          ~$22,590/year (2025). For a family of 2 it&rsquo;s ~$30,660. Larger
          households have higher thresholds, which lowers your effective payment.
        </p>
        <p>
          Under MFS, your AGI is your income alone. Under MFJ, your spouse&rsquo;s
          income is added. This is the core mechanism that makes MFS valuable during
          training when one spouse earns significantly more.
        </p>

        <h2>State income tax impact</h2>
        <p>
          Nine states have no income tax (Alaska, Florida, Nevada, New Hampshire,
          South Dakota, Tennessee, Texas, Washington, Wyoming). If you are training
          in one of these states, your MFJ vs MFS decision simplifies significantly
          because the state tax penalty for MFS disappears.
        </p>
        <p>
          High-tax states like California (up to 13.3%), New York (up to 10.9%),
          and New Jersey (up to 10.75%) amplify the MFS tax cost. Residents in
          these states may find MFJ is more favorable even with a high-earning
          spouse — the state tax penalty can exceed the loan payment savings.
        </p>
        <p>
          The MedDebt Calculator uses a blended federal + state effective rate.
          You can override this in the Advanced Settings if your state tax
          situation differs significantly.
        </p>

        <h2>Filing as dependent vs independent</h2>
        <p>
          Most medical residents file as independent — you are no longer eligible
          to be claimed as a dependent on your parents&rsquo; return once you
          have sufficient self-support income (~$4,700/year threshold for 2025).
          After starting residency, you almost always file independently.
        </p>
        <p>
          If you have significant assets or investment income from before medical
          school, consult a tax professional about whether the &ldquo;kiddie
          tax&rdquo; rules apply to your situation (typically only relevant for
          younger trainees with investment accounts).
        </p>

        <h2>Checklist: tax decisions every resident should make</h2>
        <ul>
          <li>
            <strong>Filing status:</strong> Run MFJ vs MFS comparison before
            filing, especially if married and spouse has meaningful income
          </li>
          <li>
            <strong>IDR certification:</strong> Recertify income annually —
            use last year&rsquo;s AGI, not current income, to get the lowest
            possible payment during low-income training years
          </li>
          <li>
            <strong>Quarterly taxes:</strong> Set aside ~25–35% of side income
            for federal + state + SE taxes; pay quarterly to avoid penalties
          </li>
          <li>
            <strong>Retirement contributions:</strong> Contribute to your
            employer&rsquo;s 403(b) or 401(k) — pre-tax contributions lower
            your AGI, which lowers your IDR payment and your tax bill simultaneously
          </li>
          <li>
            <strong>HSA contributions:</strong> If enrolled in a high-deductible
            health plan, maximize HSA — also pre-tax, also reduces IDR-relevant AGI
          </li>
          <li>
            <strong>Student loan interest deduction:</strong> Up to $2,500/year
            deductible for income under ~$85K (2025). Not available under MFS filing.
          </li>
        </ul>

        <h2>Run your own numbers</h2>
        <p>
          The best way to understand your specific tax + loan payment interaction is
          to model it directly. The MedDebt Calculator&rsquo;s Household section
          lets you enter your spouse&rsquo;s income and switch between MFJ and MFS
          to see the real impact on your IDR payments over your full training timeline.
        </p>

        <div style={{ marginTop: 24 }}>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--r-pill)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] font-bold text-[14px] transition-transform hover:scale-[1.02]"
          >
            Model your filing strategy in the calculator →
          </Link>
        </div>

        <h2>Disclaimer</h2>
        <p>
          This guide is educational and reflects general rules as of 2026. Tax law
          changes frequently, and your situation may have factors not covered here.
          For personalized tax advice, consult a CPA or enrolled agent who works
          with physician clients.
        </p>
      </LegalPageShell>
    </>
  );
}

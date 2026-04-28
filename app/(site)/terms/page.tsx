import type { Metadata } from 'next';
import LegalPageShell from '@/components/layout/LegalPageShell';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of use for the Med School Debt Calculator. Educational tool only, not financial advice.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms of use."
      description="This site is a free educational tool. Using it means you agree to these terms. They're short on purpose."
      lastUpdated="April 2026"
    >
      <h2>Educational tool only</h2>
      <p>
        The Med School Debt Calculator produces projections based on the inputs
        you provide and the assumptions documented on our{' '}
        <a href="/methodology">Methodology</a> page. Output is{' '}
        <strong>not financial, tax, or legal advice</strong>. It is not a
        recommendation to take, refinance, or forgive any loan. It does not
        create a fiduciary relationship between you and us.
      </p>
      <p>
        Before making any six-figure financial decision (PSLF vs refinance,
        choice of IDR plan, aggressive payoff timing), consult a licensed
        financial advisor who specializes in physician finance.
      </p>

      <h2>No warranties</h2>
      <p>
        The tool is provided &ldquo;as is.&rdquo; We try to keep the formulas
        accurate and the defaults current, but salary data, interest rates, tax
        rules, and PSLF eligibility change. We do not warrant that any
        projection will match your actual outcome.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any
        financial loss, missed opportunity, or damages arising from your use of
        the site, the calculator, or any guide on this site.
      </p>

      <h2>Your conduct</h2>
      <p>
        You agree not to:
      </p>
      <ul>
        <li>Scrape the site at a rate that degrades service for others.</li>
        <li>Reverse-engineer the tool to rehost it as your own.</li>
        <li>Use the content to mislead patients, students, or colleagues.</li>
      </ul>

      <h2>Third-party content</h2>
      <p>
        Ads are served by Google AdSense and are subject to Google&apos;s terms.
        Links to external sites (AAMC, MGMA, Medscape, studentaid.gov, etc.)
        lead to pages we do not control.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:hello@medschooldebtcalculator.com">
          hello@medschooldebtcalculator.com
        </a>
        .
      </p>
    </LegalPageShell>
  );
}

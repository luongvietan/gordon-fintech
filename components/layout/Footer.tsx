import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LAST_UPDATED = 'April 2026';

export default function Footer() {
  return (
    <footer className="bg-[color:var(--color-off-white)] border-t border-[color:var(--border-subtle)] mt-12 md:mt-20">
      <div className="container py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2 max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] font-black text-sm"
              >
                M
              </span>
              <span
                className="text-lg text-[color:var(--color-near-black)] tracking-[-0.02em]"
                style={{ fontWeight: 900 }}
              >
                MedDebt Calculator
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-[color:var(--text-secondary)] font-medium mb-5">
              Free financial tools for medical students and doctors. Understand your debt,
              compare repayment strategies, and plan your path to financial freedom.
            </p>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-dark-green)] hover:underline"
            >
              How we compute the numbers
              <ArrowRight aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--text-muted)] mb-4">
              Tools
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/calculator', label: 'Debt Calculator' },
                { href: '/calculator', label: 'PSLF Comparison' },
                { href: '/#crossover', label: 'Net Worth Crossover' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--text-muted)] mb-4">
              Guides
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/blog/average-medical-school-debt', label: 'Average Med School Debt' },
                { href: '/blog/pslf-explained-for-doctors', label: 'PSLF Explained' },
                { href: '/blog/doctor-salary-by-specialty', label: 'Doctor Salaries' },
                { href: '/blog', label: 'All articles' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--text-muted)] mb-4">
              Legal
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/about', label: 'About' },
                { href: '/methodology', label: 'Methodology' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Use' },
                { href: 'mailto:hello@medschooldebtcalculator.com', label: 'Contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer block */}
        <div className="mt-14 pt-8 border-t border-[color:var(--border-subtle)]">
          <h4 className="text-xs font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-3">
            Disclaimer
          </h4>
          <div className="max-w-4xl flex flex-col gap-3 text-xs text-[color:var(--text-muted)] leading-relaxed">
            <p>
              <strong className="text-[color:var(--text-secondary)] font-semibold">
                Not financial, tax, or legal advice.
              </strong>{' '}
              The calculator produces projections from the inputs you provide
              against the assumptions documented on our{' '}
              <Link href="/methodology" className="underline underline-offset-2 hover:text-[color:var(--text-primary)]">
                Methodology page
              </Link>
              . Use it as a planning tool, not a verdict. For a six-figure
              decision like PSLF vs refinance, talk to a CFP or CPA.
            </p>
            <p>
              <strong className="text-[color:var(--text-secondary)] font-semibold">
                Sources.
              </strong>{' '}
              Salary presets triangulated from AAMC, MGMA Provider Compensation
              Survey, and Medscape Physician Compensation Report. Debt averages
              from AAMC annual graduation surveys. PSLF and IDR rules from{' '}
              <a
                href="https://studentaid.gov"
                className="underline underline-offset-2 hover:text-[color:var(--text-primary)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                studentaid.gov
              </a>
              . Tax assumptions reflect current IRS guidance.
            </p>
            <p>
              <strong className="text-[color:var(--text-secondary)] font-semibold">
                Independently built.
              </strong>{' '}
              No lender partnerships, no affiliate codes, no commissions. Not
              affiliated with AAMC, MGMA, Medscape, the U.S. Department of
              Education, or any loan servicer.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[color:var(--border-subtle)]">
          <p className="text-xs font-semibold text-[color:var(--text-muted)]">
            © {new Date().getFullYear()} MedDebt Calculator · Last updated {LAST_UPDATED}
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/methodology"
              className="text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Methodology
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

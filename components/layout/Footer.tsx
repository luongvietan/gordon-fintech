import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[color:var(--color-off-white)] border-t border-[color:var(--border-subtle)] mt-12 md:mt-20">
      <div className="container py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
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
            <p className="text-xs text-[color:var(--text-muted)] leading-relaxed">
              Educational tool only. Not financial advice. Consult a licensed student-loan advisor
              for personalized guidance.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--text-muted)] mb-4">
              Tools
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/#calculator', label: 'Debt Calculator' },
                { href: '/#calculator', label: 'PSLF Comparison' },
                { href: '/#calculator', label: 'Net Worth Projection' },
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
        </div>

        <div className="mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[color:var(--border-subtle)]">
          <p className="text-xs font-semibold text-[color:var(--text-muted)]">
            © {new Date().getFullYear()} MedDebt Calculator
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/blog"
              className="text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Blog
            </Link>
            <a
              href="mailto:hello@medschooldebtcalculator.com"
              className="text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

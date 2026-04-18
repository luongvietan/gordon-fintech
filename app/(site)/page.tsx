import type { Metadata } from 'next';
import Link from 'next/link';
import Calculator from '@/components/calculator/Calculator';
import NewsletterSignup from '@/components/layout/NewsletterSignup';
import AdSlot from '@/components/ads/AdSlot';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Med School Debt Calculator | Free Tool for Doctors & Medical Students',
  description:
    'Calculate exactly how long it takes to pay off medical school debt. Compare PSLF vs standard repayment, get specialty salary presets, and visualize your net worth over time. Free interactive tool.',
  openGraph: {
    title: 'Med School Debt Calculator — Free Tool for Doctors',
    description:
      'Interactive debt calculator with PSLF comparison and specialty salary presets. Built for medical students and doctors.',
    type: 'website',
  },
};

const STATS = [
  { value: '$250K+', label: 'Average med school debt' },
  { value: '10–15 yrs', label: 'Average payoff timeline' },
  { value: '$87K+', label: 'PSLF savings potential' },
  { value: '90%', label: 'Doctors with student debt' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter your details',
    description:
      'Input total debt, interest rate, and specialty. Salary and residency length auto-fill from 16 specialty presets.',
  },
  {
    step: '02',
    title: 'See your projections',
    description:
      'Real-time charts show loan balance, net-worth trajectory, and the first year you turn the corner back into the black.',
    accent: true,
  },
  {
    step: '03',
    title: 'Compare strategies',
    description:
      'Switch between aggressive payoff, PSLF-optimized, or minimum payment — side-by-side, in one click.',
  },
];

const FAQS = [
  {
    q: 'How long does it take doctors to pay off med school debt?',
    a: 'Most doctors take 10–15 years to fully repay medical school loans using a standard 10-year repayment plan or income-driven plan followed by aggressive payoff once they hit attending salary. The exact timeline depends on specialty, total debt, interest rate, and chosen strategy (PSLF vs. refinance vs. aggressive payoff).',
  },
  {
    q: 'Is PSLF (Public Service Loan Forgiveness) worth it for doctors?',
    a: 'PSLF can save $100K+ for doctors who work at non-profit hospitals, the VA, or academic medical centers. It forgives the remaining federal loan balance tax-free after 120 qualifying monthly payments (10 years). The math is most favorable for high-debt borrowers in lower-paying specialties like primary care, pediatrics, and family medicine.',
  },
  {
    q: 'What is the average medical school debt in 2025?',
    a: 'The average medical school debt for a graduating MD in the US is approximately $250,000–$260,000 as of 2024–2025 per AAMC data, with about 73% of graduates carrying education debt. DO graduates often owe slightly more. Interest accrues during residency, so the balance at attending-hood can be 15–25% higher.',
  },
  {
    q: 'Can I refinance my federal student loans during residency?',
    a: 'Yes — but doing so gives up access to PSLF, income-driven repayment (IDR), and federal forbearance/forgiveness protections. Most doctors are better off waiting until they have confirmed their long-term employer isn\'t PSLF-eligible before refinancing.',
  },
  {
    q: 'Do I have to pay taxes on PSLF forgiveness?',
    a: 'No. PSLF forgiveness is tax-free at the federal level. This is different from 20- or 25-year IDR forgiveness (taxable as ordinary income in the year forgiven, sometimes called the "tax bomb").',
  },
];

export default async function HomePage() {
  const posts = await getAllPosts();
  const previewPosts = posts.slice(0, 3);

  const applicationLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MedDebt Calculator',
    applicationCategory: 'FinanceApplication',
    description:
      'Interactive medical school debt calculator with PSLF comparison, specialty salary presets, and net-worth projections for doctors and medical students.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    operatingSystem: 'Web',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--color-near-black)' }}
      >
        <div
          aria-hidden
          className="absolute -right-40 -top-40 w-[36rem] h-[36rem] rounded-full opacity-[0.18] blur-3xl"
          style={{ background: 'var(--color-wise-green)' }}
        />
        <div
          aria-hidden
          className="absolute -left-32 -bottom-32 w-[28rem] h-[28rem] rounded-full opacity-[0.12] blur-3xl"
          style={{ background: 'var(--color-wise-green)' }}
        />

        <div className="container relative pt-16 md:pt-28 pb-20 md:pb-28">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold bg-white/10 text-white/80 mb-6 md:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)] animate-pulse inline-block" />
              Free · no signup · runs in your browser
            </div>

            <h1
              className="text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(3rem, 8vw, 7.875rem)',
                lineHeight: 0.85,
                letterSpacing: '-0.03em',
              }}
            >
              The debt calculator{' '}
              <span style={{ color: 'var(--color-wise-green)' }}>
                built for doctors.
              </span>
            </h1>

            <p
              className="mt-6 md:mt-8 text-lg md:text-xl max-w-2xl leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Stop guessing. See exactly when you&apos;ll be debt-free — by specialty,
              residency length, and strategy. PSLF comparison + net-worth crossover
              included.
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--r-pill)] text-base font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95]"
              >
                Run my numbers
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <Link
                href="/blog/pslf-explained-for-doctors"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--r-pill)] text-base font-semibold text-white ring-1 ring-inset ring-white/25 hover:ring-white/60 hover:bg-white/5 transition-all"
              >
                Learn about PSLF
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP / STATS ─────────────────────────────── */}
      <section
        className="py-10 md:py-14"
        style={{ background: 'var(--color-light-mint)' }}
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--r-card-sm)] bg-white p-5 md:p-6"
                style={{ boxShadow: 'var(--shadow-ring)' }}
              >
                <p
                  className="text-[color:var(--color-near-black)] tracking-[-0.02em] leading-none tabular-nums"
                  style={{
                    fontFamily: 'var(--font-numbers)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)',
                  }}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[color:var(--text-secondary)] mt-2 leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AD SLOT ─────────────────────────────────────────── */}
      <div className="container pt-8 md:pt-10">
        <AdSlot variant="banner" slot={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT} />
      </div>

      {/* ─── CALCULATOR ──────────────────────────────────────── */}
      <section id="calculator" className="py-14 md:py-20">
        <div className="container">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="eyebrow mb-4">The tool</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Calculate your payoff.
            </h2>
            <p className="mt-4 text-lg text-[color:var(--text-secondary)] max-w-xl font-medium">
              Drag the sliders. Flip PSLF on and off. The charts update the
              moment you change a number — no recalculate button needed.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Calculator />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-14 md:py-20"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="eyebrow mb-4">How it works</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Three steps. Sixty seconds.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className={`
                  rounded-[var(--r-card)] p-7 md:p-8 flex flex-col gap-5
                  ${item.accent
                    ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
                    : 'bg-white'}
                `}
                style={!item.accent ? { boxShadow: 'var(--shadow-ring)' } : undefined}
              >
                <span
                  className={`text-xs font-bold tabular-nums ${
                    item.accent ? 'text-[color:var(--color-dark-green)]/70' : 'text-[color:var(--text-muted)]'
                  }`}
                  style={{ fontFamily: 'var(--font-numbers)' }}
                >
                  {item.step}
                </span>
                <h3
                  className="text-[1.75rem] leading-[0.95] tracking-[-0.015em]"
                  style={{ fontWeight: 900 }}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-[15px] leading-relaxed font-medium ${
                    item.accent ? 'text-[color:var(--color-dark-green)]/80' : 'text-[color:var(--text-secondary)]'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16">
            <div>
              <p className="eyebrow mb-4">FAQ</p>
              <h2
                className="display-section text-[color:var(--color-near-black)]"
                style={{ fontWeight: 900 }}
              >
                The questions doctors ask.
              </h2>
              <p className="mt-4 text-base text-[color:var(--text-secondary)] max-w-sm font-medium">
                Quick answers on PSLF, IDR, refinancing, and the numbers that
                actually matter.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-[var(--r-card-sm)] bg-white p-5 md:p-6 transition-colors"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                    <h3 className="text-base md:text-lg font-bold text-[color:var(--color-near-black)] leading-snug tracking-[-0.005em]">
                      {f.q}
                    </h3>
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[color:var(--color-near-black)]/[0.06] group-open:bg-[color:var(--color-wise-green)] transition-colors">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        className="transition-transform duration-200 group-open:rotate-45"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 1v8M1 5h8"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-[15px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG PREVIEW ────────────────────────────────────── */}
      {previewPosts.length > 0 && (
        <section
          className="py-14 md:py-20"
          style={{ background: 'var(--color-off-white)' }}
        >
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10 md:mb-14">
              <div>
                <p className="eyebrow mb-4">Guides</p>
                <h2
                  className="display-section text-[color:var(--color-near-black)]"
                  style={{ fontWeight: 900 }}
                >
                  Doctor finance, explained.
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-near-black)] hover:text-[color:var(--color-dark-green)] transition-colors"
              >
                View all guides
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 7h9m-4-4.5L11.5 7 7.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {previewPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 p-6 md:p-7 rounded-[var(--r-card)] bg-white transition-transform duration-200 hover:scale-[1.01]"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <span className="inline-flex self-start px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
                    {post.readingTime}
                  </span>
                  <h3
                    className="text-xl text-[color:var(--color-near-black)] leading-[1.05] tracking-[-0.01em]"
                    style={{ fontWeight: 900 }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed line-clamp-3 font-medium">
                    {post.description}
                  </p>
                  <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-dark-green)]">
                    Read article
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 7h9m-4-4.5L11.5 7 7.5 11.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── NEWSLETTER ──────────────────────────────────────── */}
      <NewsletterSignup />
    </>
  );
}

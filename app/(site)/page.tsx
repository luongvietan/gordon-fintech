import type { Metadata } from 'next';
import Link from 'next/link';
import Calculator from '@/components/calculator/Calculator';
import NewsletterSignup from '@/components/layout/NewsletterSignup';
import AdSlot from '@/components/ads/AdSlot';
import { getAllPosts } from '@/lib/blog';
import HeroChart from '@/components/home/HeroChart';
import CredentialsStrip from '@/components/home/CredentialsStrip';
import CrossoverUspSection from '@/components/home/CrossoverUspSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FaqSection, { type FaqItem as FaqCategoryItem } from '@/components/home/FaqSection';
import ArticleCard from '@/components/blog/ArticleCard';
import TrustBand from '@/components/home/TrustBand';

export const metadata: Metadata = {
  title:
    'Med School Debt Calculator | Free PSLF Tool for Doctors & Medical Students',
  description:
    'The most complete medical school debt calculator. Built for medical students, residents, and attendings. Compare PSLF vs standard repayment, model 16 specialty salary presets, and see the year your net worth turns positive — all in your browser, free.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Med School Debt Calculator — Built for Doctors',
    description:
      'PSLF vs refinance vs aggressive payoff, side-by-side. 16 specialty presets. Net-worth crossover charts. Built for med students, residents, and doctors.',
    type: 'website',
  },
};

/**
 * Headline stats. Every figure is sourced — the AAMC GQ for debt + share
 * of borrowers, an MGMA / academic-residency stipend median for income
 * during training, and a conservative Department of Education estimate
 * for typical PSLF forgiveness on physician balances.
 *
 * If a number ever moves more than a few percent against its source, swap
 * it here AND on /methodology — they should always agree.
 */
const STATS = [
  {
    value: '$236K',
    label: 'Median MD debt at graduation',
    source: 'AAMC GQ, 2024',
  },
  {
    value: '~73%',
    label: 'MD graduates with student debt',
    source: 'AAMC GQ, 2024',
  },
  {
    value: '$67K',
    label: 'Median PGY-1 stipend',
    source: 'AAMC Resident Survey',
  },
  {
    value: '10 yrs',
    label: 'Of qualifying payments for PSLF',
    source: 'studentaid.gov',
  },
];

/**
 * Tiny green check mark used inside the hero trust strip.
 * Inline SVG to avoid pulling an icon library for a single glyph.
 */
function CheckDot() {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[color:var(--color-wise-green)]/20 text-[color:var(--color-wise-green)]"
    >
      <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
        <path
          d="M2.5 7 5.5 10l6-7"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * Tiny inline SVG used in the Step 02 card to preview what the charts
 * look like. Decorative — not tied to calculator output.
 */
function Step02Preview() {
  return (
    <svg
      viewBox="0 0 160 72"
      width="160"
      height="72"
      fill="none"
      aria-hidden="true"
      className="mt-1"
    >
      <line x1="0" x2="160" y1="40" y2="40" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 4" />
      <path
        d="M4 58 L28 52 L52 44 L76 32 L100 20 L124 14 L156 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14 L28 22 L52 30 L76 38 L100 48 L124 56 L156 60"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 4"
      />
      <circle cx="76" cy="40" r="4.5" fill="currentColor" />
      <circle cx="76" cy="40" r="8" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  accent?: boolean;
  preview?: React.ReactNode;
}

const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Pick your specialty',
    description:
      'Choose from 16 presets — IM, EM, surgery, peds, cardio and more. Salary, residency length, and fellowship years auto-fill from MGMA + Medscape medians.',
  },
  {
    step: '02',
    title: 'See your projections',
    description:
      'Real-time charts show loan balance, after-tax net worth, and the year your trajectory finally crosses back into positive territory.',
    accent: true,
    preview: <Step02Preview />,
  },
  {
    step: '03',
    title: 'Compare strategies',
    description:
      'Toggle PSLF on and off. Try aggressive payoff vs IDR floor. Side-by-side totals — interest paid, forgiven balance, true cost — in one click.',
  },
];

const FAQS: FaqCategoryItem[] = [
  {
    q: 'How long does it take doctors to pay off med school debt?',
    a: 'Most physicians take 10–15 years to fully repay medical school loans. The exact timeline depends on specialty, total debt, interest rate, and chosen strategy (PSLF vs refinance vs aggressive payoff). Primary-care doctors at PSLF-eligible employers can often get to a positive net worth in under a decade; surgical specialists who refinance and pay aggressively can do it in 5–7 years.',
    category: 'general',
    learnMore: { href: '/#calculator', label: 'Run your own payoff scenario' },
  },
  {
    q: 'Is PSLF (Public Service Loan Forgiveness) worth it for doctors?',
    a: 'PSLF can save six figures for doctors who work full-time at non-profit hospitals, the VA, or academic medical centers. It forgives the remaining federal loan balance tax-free after 120 qualifying monthly payments (10 years), with payments during residency counting if your training employer is PSLF-qualified. The math is most favorable for high-debt borrowers in lower-paying specialties (primary care, pediatrics, family medicine, psychiatry).',
    category: 'pslf',
    learnMore: { href: '/blog/pslf-explained-for-doctors', label: 'Read the full PSLF guide' },
  },
  {
    q: 'What is the average medical school debt in 2025?',
    a: 'Per the most recent AAMC Graduation Questionnaire, the median MD graduate carries roughly $236K in education debt, and about 73% of MD graduates have any student debt at all. DO graduates typically owe slightly more. Because federal grad-school loans accrue interest from day one, the balance at the end of residency is usually 15–25% higher than the day-of-graduation number.',
    category: 'general',
    learnMore: { href: '/methodology', label: 'See our data sources' },
  },
  {
    q: 'Should I refinance my federal student loans during residency?',
    a: 'Usually not. Refinancing converts federal loans to private and permanently gives up access to PSLF, IDR, federal forbearance, and federal forgiveness protections. Most residents are better off staying on an IDR plan (SAVE/PAYE/IBR) until they have confirmed their long-term employer is NOT PSLF-eligible. The calculator shows the dollar cost of that decision both ways.',
    category: 'refi',
    learnMore: { href: '/#calculator', label: 'Compare refinance vs PSLF' },
  },
  {
    q: 'Do I have to pay taxes on PSLF forgiveness?',
    a: 'No — PSLF forgiveness is tax-free at the federal level under current IRS guidance. This is different from the 20- or 25-year IDR forgiveness, which is generally taxable as ordinary income in the year forgiven (the so-called "tax bomb"). The calculator models PSLF as tax-free; if Congress changes that rule, the math will have to be re-run.',
    category: 'tax',
    learnMore: { href: '/blog/pslf-explained-for-doctors', label: 'Learn how PSLF qualifying payments work' },
  },
  {
    q: 'Is this calculator actually built for medical students?',
    a: 'Yes. Every default — debt size, interest rate, residency length, attending salary, fellowship modeling — is calibrated to physician training paths, not generic student loans. The 16 specialty presets handle variable training lengths (e.g. 3–4yr EM, 5–7yr general surgery, 6–8yr cardiology) and split residency from fellowship phases automatically.',
    category: 'general',
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
      'Interactive medical school debt calculator with PSLF comparison, 16 specialty salary presets, and net-worth projections for doctors and medical students.',
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
      {/*
        Hero is sized to fit within a single viewport on first load.
        - Header is sticky at h-16 (4rem); we subtract that from `100svh`
          so the hero never forces an immediate scroll.
        - `svh` (small viewport height) avoids the iOS Safari address-bar
          jump that `vh` causes.
        - On very short laptops (<640px tall) we fall back to natural
          height so the CTA never gets clipped.
      */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          background: 'var(--color-near-black)',
          minHeight: 'calc(100svh - 4rem)',
        }}
      >
        <div
          aria-hidden
          className="absolute -right-40 -top-40 w-[36rem] h-[36rem] rounded-full opacity-[0.18] blur-3xl"
          style={{ background: 'var(--color-wise-green)' }}
        />
        <div
          aria-hidden
          className="absolute -left-32 -bottom-32 w-[28rem] h-[28rem] rounded-full opacity-[0.10] blur-3xl"
          style={{ background: 'var(--color-wise-green)' }}
        />

        <div className="container relative w-full py-10 md:py-12 lg:py-14">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 xl:gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-pill)] text-[11px] font-bold bg-[color:var(--color-wise-green)]/15 text-[color:var(--color-wise-green)] ring-1 ring-inset ring-[color:var(--color-wise-green)]/30 uppercase tracking-[0.06em]">
                  Built for med students · residents · doctors
                </span>
              </div>

              <h1
                className="text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  // Smaller top end so the headline never alone fills the viewport on big monitors.
                  fontSize: 'clamp(2.5rem, 6vw, 5.25rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                }}
              >
                The med school debt calculator{' '}
                <span style={{ color: 'var(--color-wise-green)' }}>
                  doctors actually use.
                </span>
              </h1>

              <p
                className="mt-5 md:mt-6 text-base md:text-lg max-w-xl leading-relaxed font-medium"
                style={{ color: 'rgba(255,255,255,0.72)' }}
              >
                See exactly when you&apos;ll be debt-free — by specialty, residency
                length, and repayment strategy. PSLF vs refinance vs aggressive
                payoff, side-by-side.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--r-pill)] text-[15px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] shadow-[0_8px_30px_-8px_rgba(159,232,112,0.55)] transition-all duration-200 hover:scale-[1.04] hover:bg-[color:var(--color-pastel-green)] active:scale-[0.97]"
                >
                  Run my numbers — free
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--r-pill)] text-[15px] font-semibold text-white ring-1 ring-inset ring-white/25 hover:ring-white/60 hover:bg-white/5 transition-all"
                >
                  Read the PSLF guide
                </Link>
              </div>

              <ul
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/60 font-semibold"
                aria-label="Reasons to trust this tool"
              >
                <li className="inline-flex items-center gap-1.5">
                  <CheckDot />
                  100% in your browser
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckDot />
                  No login or email
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckDot />
                  No affiliate links
                </li>
              </ul>
            </div>

            {/* Visual anchor — desktop only so mobile hero stays compact. */}
            <div className="hidden lg:flex items-center justify-center">
              <HeroChart />
            </div>
          </div>

          {/* Subtle scroll cue — anchors the eye toward the calculator. */}
          <a
            href="#calculator"
            aria-label="Scroll to the calculator"
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-5 lg:bottom-6 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 hover:text-white/85 transition-colors"
          >
            Scroll
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="animate-bounce-slow">
              <path
                d="M7 2v9m-4-4 4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* ─── STAT BAND ─────────────────────────────────────────── */}
      <section
        className="py-10 md:py-14"
        style={{ background: 'var(--color-light-mint)' }}
        aria-label="Headline statistics on US medical school debt"
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--r-card-sm)] bg-white p-5 md:p-6 flex flex-col gap-2"
                style={{ boxShadow: 'var(--shadow-ring)' }}
              >
                <p
                  className="text-[color:var(--color-near-black)] tracking-[-0.025em] leading-none tabular-nums"
                  style={{
                    fontFamily: 'var(--font-numbers)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  }}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[color:var(--text-primary)] leading-snug mt-1">
                  {stat.label}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mt-auto pt-1">
                  {stat.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CREDENTIALS STRIP ───────────────────────────────── */}
      <CredentialsStrip />

      {/* ─── CALCULATOR ──────────────────────────────────────── */}
      <section
        id="calculator"
        className="pt-14 md:pt-20 pb-14 md:pb-24"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container">
          <div className="max-w-3xl mb-10 md:mb-12">
            <p className="eyebrow mb-4">The tool</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Calculate your payoff.
            </h2>
            <p className="mt-4 text-lg text-[color:var(--text-secondary)] max-w-xl font-medium">
              Drag a slider, flip PSLF on, switch specialty — the charts redraw
              the moment you change a number. No recalculate button, no sign-up.
            </p>
          </div>

          <TrustBand />

          <Calculator />
        </div>
      </section>

      {/* ─── NET-WORTH CROSSOVER USP ─────────────────────────── */}
      <CrossoverUspSection />

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-14 md:py-20"
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
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      item.accent ? 'text-[color:var(--color-dark-green)]/70' : 'text-[color:var(--text-muted)]'
                    }`}
                    style={{ fontFamily: 'var(--font-numbers)' }}
                  >
                    {item.step}
                  </span>
                  {item.accent && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-[var(--r-pill)] bg-[color:var(--color-dark-green)] text-[color:var(--color-wise-green)]">
                      The aha moment
                    </span>
                  )}
                </div>
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
                {item.preview && (
                  <div className="mt-auto pt-2 text-[color:var(--color-dark-green)]">
                    {item.preview}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (hidden when no real quotes configured) ─── */}
      <TestimonialsSection />

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <FaqSection items={FAQS} />

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
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── NEWSLETTER ──────────────────────────────────────── */}
      <NewsletterSignup />

      {/* AdSlot only renders if a real AdSense slot is configured. */}
      <div className="container pb-10">
        <AdSlot variant="banner" slot={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT} />
      </div>
    </>
  );
}

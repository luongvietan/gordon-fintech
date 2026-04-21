import type { Metadata } from 'next';
import Link from 'next/link';
import TrackedLink from '@/components/analytics/TrackedLink';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { DATA_SOURCES } from '@/lib/trust-content';

export const metadata: Metadata = {
  title: 'About | MedDebt Calculator',
  description:
    'Why this medical school debt calculator exists, who built it, and how every number traces back to a published source. Independently built, no lender affiliations.',
  alternates: { canonical: '/about' },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medschooldebtcalculator.com';

// BreadcrumbList keeps this page discoverable as a Home > About path in
// Google search results. Mirrors the visual breadcrumb in the hero.
const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About',
      item: `${SITE_URL}/about`,
    },
  ],
};

// ── Manifesto stats shown in the hero side-card. Each entry is a single,
// concrete number we can defend — no vibes, no marketing fluff.
const MANIFESTO_STATS = [
  { value: '16', label: 'Specialty presets', sub: 'AAMC + MGMA + Medscape' },
  { value: '0', label: 'Lender partnerships', sub: 'No refi affiliates, ever' },
  { value: '100%', label: 'In your browser', sub: 'No data leaves your device' },
];

// ── "What this is / what it isn't" — the trust-defining contrast block
// that replaces the older abstract "three pillars" section.
const IS_LIST = [
  {
    title: 'A medical-debt simulator',
    body: 'PSLF, IDR, refinance, and aggressive payoff modeled with real federal mechanics.',
  },
  {
    title: 'Sourced from public datasets',
    body: 'AAMC graduation surveys, MGMA + Medscape compensation reports, studentaid.gov rules.',
  },
  {
    title: 'Free, forever',
    body: 'No paywall, no premium tier, no upsell screen blocking your results.',
  },
];

const ISNT_LIST = [
  {
    title: 'A refi-affiliate funnel',
    body: 'No commissions, no lead-gen, no sponsored "recommended lender" list at the bottom.',
  },
  {
    title: 'Personal financial advice',
    body: 'It models your numbers — for a real plan, take the output to a fiduciary CFP or CPA.',
  },
  {
    title: 'Backed by a loan servicer',
    body: 'Not affiliated with AAMC, MGMA, Medscape, the Department of Education, or any lender.',
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />

      {/* ── Hero ─────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden pt-12 md:pt-16 lg:pt-20 pb-14 md:pb-20 lg:pb-24"
        style={{ background: 'var(--color-near-black)' }}
      >
        {/* Decorative dot grid + glow — same visual language as the homepage hero. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 90%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 90%)',
          }}
        />
        <div
          aria-hidden
          className="absolute -right-32 -top-24 w-[36rem] h-[36rem] rounded-full opacity-[0.16] blur-[120px] pointer-events-none"
          style={{ background: 'var(--color-wise-green)' }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(159,232,112,0.25), transparent)',
          }}
        />

        <div className="container relative">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-white/45 mb-7"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">About</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* Left column — eyebrow + headline + manifesto + CTAs */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 mb-6">
                <span className="relative flex w-1.5 h-1.5" aria-hidden>
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                    style={{ background: 'var(--color-wise-green)' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: 'var(--color-wise-green)' }}
                  />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                  About this tool
                </span>
              </div>

              <h1
                className="text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                  textWrap: 'balance',
                }}
              >
                No agenda.{' '}
                <span style={{ color: 'var(--color-wise-green)' }}>
                  Just the math.
                </span>
              </h1>

              <p className="mt-6 md:mt-7 text-base md:text-lg max-w-xl leading-relaxed font-medium text-white/65">
                We built a free, transparent calculator for medical students,
                residents, and attendings making six-figure financial
                decisions. Not a refi ad in disguise.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <TrackedLink
                  href="/calculator"
                  event="calculator_cta_clicked"
                  params={{ location: 'about_hero', target: 'calculator' }}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[var(--r-pill)] text-[15px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] shadow-[0_10px_40px_-12px_rgba(159,232,112,0.7)] transition-all duration-200 hover:bg-[color:var(--color-pastel-green)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  Open the calculator
                  <ArrowRight
                    aria-hidden="true"
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </TrackedLink>
                <Link
                  href="/methodology"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[var(--r-pill)] text-[15px] font-semibold text-white/85 ring-1 ring-inset ring-white/15 hover:ring-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  Read the methodology
                </Link>
              </div>
            </div>

            {/* Right column — manifesto stats card.
                Acts as the visual anchor of the hero, the way the chart
                does on the homepage. Plain numbers, no marketing copy. */}
            <aside
              aria-label="What this tool is"
              className="lg:justify-self-end w-full max-w-md lg:max-w-none"
            >
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-x-5 -inset-y-5 rounded-[var(--r-card-lg)] ring-1 ring-white/[0.06] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent"
                />
                <div className="relative rounded-[var(--r-card)] bg-white/[0.04] ring-1 ring-inset ring-white/10 backdrop-blur-sm p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      What this is
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-wise-green)]/85">
                      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)]" />
                      Free
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {MANIFESTO_STATS.map((stat) => (
                      <li
                        key={stat.label}
                        className="rounded-[var(--r-card-sm)] bg-white/[0.04] ring-1 ring-inset ring-white/[0.07] px-4 py-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-white tracking-[-0.005em] truncate">
                            {stat.label}
                          </p>
                          <p className="text-[11.5px] text-white/50 font-medium leading-snug mt-0.5 truncate">
                            {stat.sub}
                          </p>
                        </div>
                        <p
                          className="text-[1.625rem] md:text-[1.875rem] text-[color:var(--color-wise-green)] tabular-nums tracking-[-0.025em] leading-none flex-shrink-0"
                          style={{
                            fontWeight: 900,
                            fontFamily: 'var(--font-numbers)',
                          }}
                        >
                          {stat.value}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Founder note ─────────────────────────────── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Why this exists</p>
            <h2
              className="display-section text-[color:var(--color-near-black)] mb-8 md:mb-10"
              style={{ fontWeight: 900 }}
            >
              Every other calculator was selling something.
            </h2>

            <figure className="relative">
              {/* Big lime quote mark — purely decorative. */}
              <span
                aria-hidden
                className="absolute -left-2 -top-8 md:-left-4 md:-top-10 text-[7rem] md:text-[9rem] leading-none text-[color:var(--color-wise-green)]/45 select-none pointer-events-none"
                style={{ fontWeight: 900, fontFamily: 'var(--font-display)' }}
              >
                &ldquo;
              </span>

              <blockquote
                className="relative pl-5 md:pl-8 border-l-[3px] border-[color:var(--color-wise-green)]"
              >
                <p
                  className="text-[1.25rem] md:text-[1.5rem] lg:text-[1.75rem] text-[color:var(--color-near-black)] leading-[1.35] tracking-[-0.012em] max-w-2xl"
                  style={{ fontWeight: 700 }}
                >
                  Every calculator we found was either too generic or buried
                  inside a site trying to sell you a refinancing product. So we
                  built one that wasn&rsquo;t.
                </p>

                <div className="mt-7 md:mt-8 space-y-4 text-[15px] md:text-[16px] text-[color:var(--text-secondary)] leading-relaxed font-medium max-w-2xl">
                  <p>
                    We&rsquo;re two premed students who became obsessed with
                    the medical school debt problem after seeing how little
                    clarity existed for doctors making six-figure financial
                    decisions. We built this tool because every calculator we
                    found was either too generic or buried inside a site trying
                    to sell you a refinancing product.
                  </p>
                  <p>
                    Every number here traces to a published source. We have no
                    affiliate links, no lender partnerships, and no upsells.
                    This tool has no agenda &mdash; it&rsquo;s just the math.
                  </p>
                </div>

                <figcaption className="mt-7 md:mt-8 flex items-center gap-3 text-[12px] font-semibold text-[color:var(--text-muted)] tracking-[-0.005em]">
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[color:var(--color-near-black)] text-[color:var(--color-wise-green)] text-[11px] tabular-nums"
                    style={{ fontWeight: 900 }}
                  >
                    SN
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[color:var(--color-near-black)] font-bold tracking-[-0.005em]">
                      Suhin Nallagatla &amp; Kevin Ren
                    </span>
                    <span className="text-[11.5px] text-[color:var(--text-muted)] font-medium">
                      Built independently by two premed students
                    </span>
                  </span>
                </figcaption>
              </blockquote>
            </figure>
          </div>
        </div>
      </section>

      {/* ── What this IS / ISN'T ─────────────────────── */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="eyebrow mb-4">Scope</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              What this is. <br className="hidden md:inline" />
              <span className="text-[color:var(--text-muted)]">
                And what it isn&rsquo;t.
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-[color:var(--text-secondary)] max-w-xl font-medium leading-relaxed">
              Setting expectations up front is the cheapest way to earn trust.
              Here&rsquo;s the honest scope of what this tool does and the lines
              we deliberately don&rsquo;t cross.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* IS — lime-mint surface, checkmarks */}
            <div
              className="rounded-[var(--r-card-lg)] bg-[color:var(--color-light-mint)] p-7 md:p-9 lg:p-10 flex flex-col"
            >
              <div className="flex items-center gap-2.5 mb-7">
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[12px] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={2.25} aria-hidden />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-dark-green)]">
                  What this is
                </p>
              </div>
              <ul className="flex flex-col gap-5 md:gap-6">
                {IS_LIST.map((item) => (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] mt-0.5"
                    >
                      <Check className="w-3 h-3" strokeWidth={3} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[15px] md:text-[16px] text-[color:var(--color-near-black)] tracking-[-0.005em] leading-snug"
                        style={{ fontWeight: 900 }}
                      >
                        {item.title}
                      </p>
                      <p className="text-[13.5px] text-[color:var(--color-dark-green)]/80 font-medium leading-relaxed mt-1">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-[color:var(--color-dark-green)]/10">
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-dark-green)] hover:underline"
                >
                  See the full methodology
                  <ArrowUpRight aria-hidden className="w-3.5 h-3.5" strokeWidth={2.25} />
                </Link>
              </div>
            </div>

            {/* ISN'T — soft white surface, neutral X marks */}
            <div
              className="rounded-[var(--r-card-lg)] bg-white p-7 md:p-9 lg:p-10 flex flex-col"
              style={{ boxShadow: 'var(--shadow-ring)' }}
            >
              <div className="flex items-center gap-2.5 mb-7">
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[12px] bg-[color:var(--color-near-black)] text-white"
                >
                  <Scale className="w-4 h-4" strokeWidth={2.25} aria-hidden />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  What it isn&rsquo;t
                </p>
              </div>
              <ul className="flex flex-col gap-5 md:gap-6">
                {ISNT_LIST.map((item) => (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--color-near-black)]/[0.08] text-[color:var(--color-near-black)] mt-0.5"
                    >
                      <X className="w-3 h-3" strokeWidth={3} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[15px] md:text-[16px] text-[color:var(--color-near-black)] tracking-[-0.005em] leading-snug"
                        style={{ fontWeight: 900 }}
                      >
                        {item.title}
                      </p>
                      <p className="text-[13.5px] text-[color:var(--text-secondary)] font-medium leading-relaxed mt-1">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-[color:var(--border-subtle)] flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)]">
                <Lock aria-hidden className="w-3 h-3" strokeWidth={2} />
                Your data never leaves your device.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources ──────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              <p className="eyebrow mb-4">Sources, in plain sight</p>
              <h2
                className="display-section text-[color:var(--color-near-black)]"
                style={{ fontWeight: 900 }}
              >
                Where the numbers come from.
              </h2>
              <p className="mt-5 text-base md:text-lg text-[color:var(--text-secondary)] font-medium leading-relaxed max-w-md">
                Every calculator default is triangulated from one of these
                public datasets. If a source updates, we update.
              </p>
              <Link
                href="/methodology"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-dark-green)] hover:underline"
              >
                <Sparkles aria-hidden className="w-3.5 h-3.5" strokeWidth={2.25} />
                See how every number is computed
                <ArrowRight aria-hidden className="w-3 h-3" strokeWidth={2} />
              </Link>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {DATA_SOURCES.map((source) => (
                <li
                  key={source.name}
                  className="group relative rounded-[var(--r-card)] bg-[color:var(--color-off-white)] p-5 md:p-6 flex flex-col gap-3 transition-all duration-200 hover:bg-white hover:shadow-[var(--shadow-ring),var(--shadow-float)]"
                >
                  {source.year && (
                    <span className="self-start inline-flex items-center px-2 py-0.5 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-near-black)] text-white tabular-nums">
                      {source.year}
                    </span>
                  )}
                  <p
                    className="text-[15px] md:text-[16px] text-[color:var(--color-near-black)] tracking-[-0.012em] leading-[1.2]"
                    style={{ fontWeight: 900 }}
                  >
                    {source.name}
                  </p>
                  <p className="text-[13px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
                    {source.use}
                  </p>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--color-dark-green)] hover:underline"
                    >
                      Visit source
                      <ExternalLink aria-hidden className="w-3 h-3" strokeWidth={2} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section
        className="pb-20 md:pb-28"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="container">
          <div
            className="relative overflow-hidden rounded-[var(--r-card-lg)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] p-8 md:p-12 lg:p-16 mt-16 md:mt-20"
          >
            <div
              aria-hidden
              className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full blur-3xl opacity-30"
              style={{ background: 'var(--color-pastel-green)' }}
            />
            <div className="relative grid grid-cols-1 md:grid-cols-[1.4fr_auto] items-end gap-8">
              <div className="max-w-2xl">
                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-dark-green)]/65 mb-4">
                  Ready to run your numbers?
                </p>
                <h3
                  className="text-[2rem] md:text-[3rem] lg:text-[3.5rem] leading-[0.95] tracking-[-0.03em]"
                  style={{ fontWeight: 900 }}
                >
                  The tool is free.
                  <br />
                  Always will be.
                </h3>
                <p className="mt-5 text-[14.5px] md:text-base text-[color:var(--color-dark-green)]/80 font-medium leading-relaxed max-w-md">
                  No login. No email gate. No premium tier. Open it, run your
                  scenario, share the link with your spouse or financial
                  advisor.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 md:min-w-[220px]">
                <TrackedLink
                  href="/calculator"
                  event="calculator_cta_clicked"
                  params={{ location: 'about_bottom_cta', target: 'calculator' }}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[var(--r-pill)] text-[15px] font-bold bg-[color:var(--color-near-black)] text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.96]"
                >
                  Open the calculator
                  <ArrowRight
                    aria-hidden
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </TrackedLink>
                <Link
                  href="/methodology"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--r-pill)] text-[14px] font-semibold text-[color:var(--color-dark-green)] ring-1 ring-inset ring-[color:var(--color-dark-green)]/25 hover:ring-[color:var(--color-dark-green)]/55 hover:bg-white/35 transition-all"
                >
                  View methodology
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

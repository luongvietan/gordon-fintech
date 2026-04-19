import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Shield, BookOpen, Calculator } from 'lucide-react';
import { DATA_SOURCES } from '@/lib/trust-content';

export const metadata: Metadata = {
  title: 'About | MedDebt Calculator',
  description:
    'Why this medical school debt calculator exists, who built it, and how every number traces back to a published source. Independently built, no lender affiliations.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-12 md:pt-20 pb-10 md:pb-14 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)] mb-6"
            >
              <Link href="/" className="hover:text-[color:var(--color-near-black)] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[color:var(--color-near-black)]">About</span>
            </nav>

            <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)] mb-5">
              About
            </span>

            <h1
              className="text-[color:var(--color-near-black)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.025em',
              }}
            >
              No agenda. Just the math.
            </h1>

            <p className="mt-5 text-lg md:text-xl text-[color:var(--text-secondary)] leading-relaxed font-medium">
              A free, transparent calculator built for medical students, residents,
              and attendings making six-figure financial decisions. Not a refi
              ad in disguise.
            </p>
          </div>
        </div>
      </section>

      {/* ── Founder note ─────────────────────────────── */}
      <section className="pb-12 md:pb-16 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <div
              className="rounded-[var(--r-card-lg)] bg-[color:var(--color-near-black)] text-white p-7 md:p-10 lg:p-12 relative overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl opacity-25"
                style={{ background: 'var(--color-wise-green)' }}
              />
              <div className="relative">
                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-wise-green)] mb-4">
                  Why this exists
                </p>
                <p
                  className="text-[1.5rem] md:text-[1.875rem] lg:text-[2.25rem] leading-[1.15] tracking-[-0.018em] text-white max-w-2xl"
                  style={{ fontWeight: 900 }}
                >
                  &ldquo;Every calculator I found was either too generic or buried
                  inside a site trying to sell you a refinancing product.&rdquo;
                </p>
                <div className="mt-6 md:mt-8 space-y-4 text-[15px] md:text-base text-white/75 leading-relaxed font-medium max-w-2xl">
                  <p>
                    I&apos;m a current premed student. I became obsessed with the
                    medical school debt problem after seeing how little clarity
                    existed for doctors making six-figure financial decisions.
                  </p>
                  <p>
                    So I built this. Every number traces to a published source.
                    There are no affiliate links, no lender partnerships, and no
                    upsells. The tool exists to model your scenario &mdash; not
                    to sell you one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars ────────────────────────────── */}
      <section className="pb-16 md:pb-20" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="max-w-3xl mb-10 md:mb-12 pt-12 md:pt-16">
            <p className="eyebrow mb-4">Mission</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Make the math visible.
            </h2>
            <p className="mt-4 text-lg text-[color:var(--text-secondary)] max-w-xl font-medium">
              Three commitments shape every line of code on this site.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <PillarCard
              icon={<Calculator className="w-5 h-5" strokeWidth={2} aria-hidden />}
              title="Sourced, not invented"
              body="Every default — debt amount, salary by specialty, residency length, PSLF mechanics — traces to AAMC, MGMA, Medscape, or studentaid.gov. No made-up numbers."
              footer={
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-dark-green)] hover:underline"
                >
                  See the full methodology
                  <ArrowRight aria-hidden className="w-3 h-3" strokeWidth={2} />
                </Link>
              }
            />
            <PillarCard
              icon={<Shield className="w-5 h-5" strokeWidth={2} aria-hidden />}
              title="No lender affiliations"
              body="No refi partnerships. No commissions. No affiliate codes. Independently built by one person who cares about getting the math right, not closing a sale."
            />
            <PillarCard
              icon={<BookOpen className="w-5 h-5" strokeWidth={2} aria-hidden />}
              title="Your data never leaves your device"
              body="The calculator runs entirely client-side. There is no server endpoint to send your debt, salary, or specialty to. Refresh the page and everything is gone — by design."
            />
          </div>
        </div>
      </section>

      {/* ── Sources ──────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Where the numbers come from</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Sources, in plain sight.
            </h2>
            <p className="mt-4 text-base md:text-lg text-[color:var(--text-secondary)] font-medium leading-relaxed">
              Every calculator default is triangulated from one of these public
              datasets. If a source updates, we update.
            </p>

            <ul className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DATA_SOURCES.map((source) => (
                <li
                  key={source.name}
                  className="rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-5"
                >
                  <p className="text-[14px] font-bold text-[color:var(--color-near-black)] tracking-[-0.005em]">
                    {source.name}
                    {source.year && (
                      <span className="text-[color:var(--text-muted)] font-medium ml-1.5">
                        ({source.year})
                      </span>
                    )}
                  </p>
                  <p className="text-[13px] text-[color:var(--text-secondary)] font-medium mt-1.5 leading-relaxed">
                    {source.use}
                  </p>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--color-dark-green)] hover:underline mt-3"
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
      <section className="pb-20 md:pb-28" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div
            className="rounded-[var(--r-card-lg)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] p-8 md:p-12 lg:p-14 max-w-3xl mt-16 md:mt-20"
          >
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-dark-green)]/70 mb-4">
              Ready to run your numbers?
            </p>
            <h3
              className="text-[1.875rem] md:text-[2.5rem] lg:text-[3rem] leading-[0.95] tracking-[-0.025em]"
              style={{ fontWeight: 900 }}
            >
              The tool is free. Always.
            </h3>
            <Link
              href="/#calculator"
              className="mt-7 md:mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-[var(--r-pill)] text-[15px] font-bold bg-[color:var(--color-near-black)] text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.96]"
            >
              Open the calculator
              <ArrowRight aria-hidden className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  footer?: React.ReactNode;
}

function PillarCard({ icon, title, body, footer }: PillarCardProps) {
  return (
    <div
      className="bg-white rounded-[var(--r-card)] p-6 md:p-7 flex flex-col gap-4"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]"
      >
        {icon}
      </span>
      <h3
        className="text-[1.25rem] md:text-[1.375rem] text-[color:var(--color-near-black)] tracking-[-0.012em] leading-[1.1]"
        style={{ fontWeight: 900 }}
      >
        {title}
      </h3>
      <p className="text-[14px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
        {body}
      </p>
      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </div>
  );
}

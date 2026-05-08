import { ArrowRight, TrendingUp } from 'lucide-react';
import TrackedLink from '@/components/analytics/TrackedLink';
import CrossoverChart from './CrossoverChart';

/**
 * The USP section — your actual financial turning point.
 *
 * This is what makes the tool different from the stack of generic loan
 * calculators — it shows the year your net worth turns positive, not just
 * the month your balance hits zero.
 */
export default function CrossoverUspSection() {
  return (
    <section
      className="py-14 md:py-20"
      style={{ background: 'var(--color-light-mint)' }}
      id="crossover"
    >
      <div className="container">
        {/* Section intro */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--color-dark-green)] text-[color:var(--color-wise-green)]"
            >
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
            <p className="eyebrow">Our unfair advantage</p>
          </div>
          <h2
            className="display-section text-[color:var(--color-near-black)]"
            style={{ fontWeight: 900 }}
          >
            Your Actual{' '}
            <span className="text-[color:var(--color-dark-green)]">
              Financial Turning Point
            </span>
          </h2>
          <p className="mt-5 text-lg text-[color:var(--text-secondary)] leading-relaxed font-medium max-w-2xl">
            Most loan calculators stop at &ldquo;months to payoff.&rdquo; That number
            is useless in isolation. What matters is the{' '}
            <strong className="text-[color:var(--color-near-black)]">net-worth crossover year</strong>
            {' '}— the moment your accumulated wealth first turns positive.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-start">
          <div>
            {/* Why it matters callout */}
            <div
              className="rounded-[var(--r-card)] p-5 md:p-6 mb-6"
              style={{ background: 'var(--color-near-black)' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 mb-2">
                Why it matters
              </p>
              <p className="text-[15px] text-white/90 leading-relaxed font-medium">
                Most doctors focus on months to payoff. But the real question is:{' '}
                <em className="not-italic font-bold text-[color:var(--color-wise-green)]">
                  when does your financial situation actually turn around?
                </em>{' '}
                The crossover year accounts for taxes, living expenses, and
                investment opportunity costs — giving you the full picture.
              </p>
            </div>

            {/* Example comparison */}
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
                Example
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-[var(--r-card-sm)] bg-white p-4"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-dark-green)] mb-2">
                    PSLF path
                  </p>
                  <p
                    className="text-[2rem] text-[color:var(--color-near-black)] leading-none tabular-nums"
                    style={{ fontWeight: 900 }}
                  >
                    Yr 7
                  </p>
                  <p className="text-[12px] font-medium text-[color:var(--text-muted)] mt-1">
                    crossover when forgiveness hits
                  </p>
                </div>
                <div
                  className="rounded-[var(--r-card-sm)] bg-white p-4"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)] mb-2">
                    Aggressive payoff
                  </p>
                  <p
                    className="text-[2rem] text-[color:var(--color-near-black)] leading-none tabular-nums"
                    style={{ fontWeight: 900 }}
                  >
                    Yr 5
                  </p>
                  <p className="text-[12px] font-medium text-[color:var(--text-muted)] mt-1">
                    crossover after high payments
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
                The 2-year difference shapes your entire career trajectory — how
                much house you can afford, when you start investing seriously,
                and how resilient your finances are to a job change.
              </p>
            </div>

            <p className="text-base text-[color:var(--text-secondary)] leading-relaxed font-medium mb-6">
              Move the sliders in the calculator — the crossover year updates
              live. It&apos;s the one insight most doctors miss and the difference
              between a reasonable strategy and the optimal one.
            </p>

            <TrackedLink
              href="/calculator"
              event="calculator_cta_clicked"
              params={{ location: 'home_crossover_section', target: 'calculator' }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-near-black)] text-white transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96]"
            >
              Find your crossover year →
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
            </TrackedLink>
          </div>

          <div
            className="rounded-[var(--r-card-lg)] bg-white p-5 md:p-7"
            style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] mb-1">
              Live preview · Net-worth crossover
            </p>
            <p className="text-[13px] font-semibold text-[color:var(--text-secondary)] mb-4">
              The line crossing zero is your turning point.
            </p>
            <CrossoverChart />
          </div>
        </div>
      </div>
    </section>
  );
}

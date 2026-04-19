import { ArrowRight } from 'lucide-react';
import CrossoverChart from './CrossoverChart';

/**
 * The USP section. This is what makes the tool different from the stack of
 * generic loan calculators — it shows the year when paying off aggressively
 * starts winning (or losing) against investing instead.
 */
export default function CrossoverUspSection() {
  return (
    <section
      className="py-14 md:py-20"
      style={{ background: 'var(--color-light-mint)' }}
      id="crossover"
    >
      <div className="container">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-center">
          <div>
            <p className="eyebrow mb-4">Our unfair advantage</p>
            <h2
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              The only calculator that tells you{' '}
              <span className="text-[color:var(--color-dark-green)]">
                when paying off beats investing.
              </span>
            </h2>
            <p className="mt-5 text-lg text-[color:var(--text-secondary)] leading-relaxed font-medium">
              Most loan calculators stop at &ldquo;months to payoff.&rdquo; That number
              is useless in isolation. What you actually need is the{' '}
              <strong>net-worth crossover</strong>: the year aggressive payoff
              overtakes PSLF-plus-investing on your balance sheet.
            </p>
            <p className="mt-3 text-base text-[color:var(--text-secondary)] leading-relaxed font-medium">
              Move the sliders — the crossover year updates live. It&apos;s the
              one insight most doctors miss and the difference between a
              reasonable strategy and the optimal one.
            </p>
            <a
              href="#calculator"
              className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-near-black)] text-white transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96]"
            >
              Find your crossover year
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
            </a>
          </div>

          <div
            className="rounded-[var(--r-card-lg)] bg-white p-5 md:p-7"
            style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
          >
            <CrossoverChart />
          </div>
        </div>
      </div>
    </section>
  );
}

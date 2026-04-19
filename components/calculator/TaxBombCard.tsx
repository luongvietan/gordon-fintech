'use client';

import { useMemo, useState } from 'react';
import { Bomb, AlertCircle } from 'lucide-react';
import type { CalculatorInputs } from '@/lib/calculator';
import { formatDollars } from '@/lib/calculator';
import { calculateIdrTaxBomb } from '@/lib/calculator-scenarios';

interface Props {
  inputs: CalculatorInputs;
}

/**
 * IDR "tax bomb" projection.
 *
 * IDR (PAYE / SAVE / IBR) forgives the remaining loan balance after 20–25
 * years, but unlike PSLF that forgiveness is treated as ordinary income
 * for federal taxes. Most calculators ignore this; we don't.
 *
 * Renders only when the user is on a federal-loan path WITHOUT PSLF and
 * the projected IDR balance survives to the forgiveness horizon.
 */
export default function TaxBombCard({ inputs }: Props) {
  const [horizon, setHorizon] = useState<20 | 25>(20);

  const result = useMemo(() => calculateIdrTaxBomb(inputs, horizon), [inputs, horizon]);

  if (!result.applies) return null;

  return (
    <section
      aria-label="IDR tax-bomb projection"
      className="rounded-[var(--r-card)] p-6 md:p-7 lg:p-8 text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%)',
        boxShadow: 'var(--shadow-ring), var(--shadow-float)',
      }}
    >
      <div
        aria-hidden
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: '#ff6b6b' }}
      />

      <div className="relative">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#ff6b6b]/20 text-[#ffb8b8]"
            >
              <Bomb className="w-4 h-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffb8b8]">
                The IDR tax bomb
              </p>
              <h3
                className="text-[1.25rem] md:text-[1.5rem] tracking-[-0.018em] leading-[1.1] mt-1"
                style={{ fontWeight: 900 }}
              >
                Forgiveness isn&rsquo;t free.
              </h3>
            </div>
          </div>

          {/* Horizon switcher */}
          <div className="inline-flex rounded-[var(--r-pill)] bg-white/10 p-1 ring-1 ring-inset ring-white/15">
            {[20, 25].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h as 20 | 25)}
                className={`px-3 py-1 rounded-[var(--r-pill)] text-[11px] font-bold transition-colors ${
                  horizon === h ? 'bg-white text-[#1a1a1a]' : 'text-white/70 hover:text-white'
                }`}
              >
                {h}-yr
              </button>
            ))}
          </div>
        </header>

        <p className="text-[14px] text-white/72 leading-relaxed font-medium max-w-2xl mb-6">
          IDR plans (PAYE, SAVE, IBR) forgive the remaining balance after{' '}
          {horizon} years &mdash; but the forgiven amount is taxed as ordinary
          income at the federal level. PSLF forgiveness is tax-free; this is
          not.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <BombStat label={`Forgiven at year ${horizon}`} value={formatDollars(result.forgivenBalance)} />
          <BombStat label="Estimated federal tax" value={formatDollars(result.federalTaxOwed)} emphasis />
          <BombStat
            label="Effective tax rate"
            value={`${result.effectiveRate.toFixed(0)}%`}
          />
        </div>

        <div className="rounded-[var(--r-card-sm)] bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 flex items-start gap-3">
          <span
            aria-hidden
            className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ff6b6b]/20 text-[#ffb8b8]"
          >
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-[13.5px] text-white tracking-[-0.005em]" style={{ fontWeight: 800 }}>
              True cost of IDR forgiveness: {formatDollars(result.trueTotalCost)}
            </p>
            <p className="text-[12px] text-white/55 leading-relaxed font-medium mt-1">
              That&rsquo;s {horizon} years of IDR payments plus your estimated
              federal tax bill the year of forgiveness. State tax not included
              &mdash; varies too widely to model. If your state taxes forgiven
              debt as income, add another ~5&ndash;10%.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BombStat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-[var(--r-card-sm)] bg-white/[0.06] p-3.5 ring-1 ring-inset ring-white/10">
      <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-white/55">
        {label}
      </p>
      <p
        className={`mt-1.5 tabular-nums tracking-[-0.018em] leading-none ${
          emphasis ? 'text-[#ffb8b8] text-[1.625rem]' : 'text-white text-[1.375rem]'
        }`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
    </div>
  );
}

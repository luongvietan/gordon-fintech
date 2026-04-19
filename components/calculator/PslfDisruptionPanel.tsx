'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, ShieldOff } from 'lucide-react';
import type { CalculatorInputs } from '@/lib/calculator';
import { formatDollars } from '@/lib/calculator';
import { simulatePslfDisruption } from '@/lib/calculator-scenarios';
import Slider from '@/components/ui/Slider';
import Toggle from '@/components/ui/Toggle';

interface Props {
  inputs: CalculatorInputs;
}

/**
 * "PSLF disruption" stress test.
 *
 * The single most-feared scenario in the PSLF community: you pursue PSLF
 * for years, then your hospital loses non-profit status (or you take a job
 * at a private practice) and the qualifying clock resets. We simulate
 * exactly that — pay IDR for X years, then switch to standard amortization
 * on the remaining balance — and report the verdict against never having
 * done PSLF at all.
 *
 * Only renders when the user has PSLF on with federal loans.
 */
export default function PslfDisruptionPanel({ inputs }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [year, setYear] = useState(5);

  const result = useMemo(
    () => (enabled ? simulatePslfDisruption(inputs, year) : null),
    [enabled, inputs, year],
  );

  if (inputs.loanType !== 'federal' || !inputs.pslfEnabled) return null;

  return (
    <section
      aria-label="PSLF disruption scenario"
      className="rounded-[var(--r-card)] bg-white p-5 md:p-7"
      style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#fff4e6] text-[#a25a00]"
          >
            <ShieldOff className="w-4 h-4" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="eyebrow mb-1.5">Stress test</p>
            <h3
              className="text-[1.125rem] md:text-[1.375rem] text-[color:var(--color-near-black)] tracking-[-0.018em] leading-[1.1]"
              style={{ fontWeight: 900 }}
            >
              What if you lose PSLF eligibility?
            </h3>
            <p className="text-[12.5px] md:text-[13px] text-[color:var(--text-muted)] font-medium mt-2 leading-snug max-w-xl">
              Job change, hospital loses non-profit status, audit failure &mdash;
              the PSLF clock can reset for reasons outside your control. Model
              that here.
            </p>
          </div>
        </div>
        <Toggle
          id="pslf-disruption-toggle"
          checked={enabled}
          onChange={setEnabled}
          label="Run scenario"
        />
      </header>

      {enabled && result && (
        <>
          <div className="mb-6">
            <Slider
              label="Year you lose eligibility"
              displayValue={`Year ${year}`}
              min={1}
              max={9}
              step={1}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <DisruptionStat
              label="Paid before disruption"
              value={formatDollars(result.paidUntilDisruption)}
            />
            <DisruptionStat
              label="Balance at disruption"
              value={formatDollars(result.balanceAtDisruption)}
            />
            <DisruptionStat
              label="Cost to finish (standard)"
              value={formatDollars(result.costToFinishStandard)}
            />
            <DisruptionStat
              label="Total disrupted cost"
              value={formatDollars(result.totalDisruptedCost)}
              emphasis
            />
          </div>

          <div
            className={`
              rounded-[var(--r-card-sm)] p-5 flex items-start gap-4
              ${result.verdict === 'still-worth-it'
                ? 'bg-[color:var(--color-light-mint)]'
                : 'bg-[#fff1f1]'}
            `}
          >
            <span
              aria-hidden
              className={`flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full ${
                result.verdict === 'still-worth-it'
                  ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
                  : 'bg-[#fad9d9] text-[#8a1f1f]'
              }`}
            >
              <AlertCircle className="w-4 h-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`text-[14.5px] md:text-[15.5px] tracking-[-0.005em] ${
                  result.verdict === 'still-worth-it'
                    ? 'text-[color:var(--color-dark-green)]'
                    : 'text-[#8a1f1f]'
                }`}
                style={{ fontWeight: 900 }}
              >
                {result.verdict === 'still-worth-it'
                  ? `At disruption year ${year}, PSLF is still worth it \u2014 you save ${formatDollars(Math.abs(result.gap))} vs never doing PSLF.`
                  : `At disruption year ${year}, PSLF is no longer worth it \u2014 it costs ${formatDollars(Math.abs(result.gap))} more than standard repayment from day one.`}
              </p>
              <p
                className={`text-[12.5px] font-medium leading-relaxed mt-2 ${
                  result.verdict === 'still-worth-it'
                    ? 'text-[color:var(--color-dark-green)]/80'
                    : 'text-[#8a1f1f]/80'
                }`}
              >
                Disrupted PSLF total: <strong>{formatDollars(result.totalDisruptedCost)}</strong>{' '}
                vs never-PSLF total: <strong>{formatDollars(result.neverPslfCost)}</strong>.
                Math assumes the remaining balance is amortized over the standard 10 years
                at your current interest rate.
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function DisruptionStat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--r-card-sm)] p-3.5 ${
        emphasis ? 'bg-[color:var(--color-near-black)] text-white' : 'bg-[color:var(--color-off-white)]'
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.10em] ${
          emphasis ? 'text-white/55' : 'text-[color:var(--text-muted)]'
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1.5 text-[1.25rem] tracking-[-0.018em] tabular-nums ${
          emphasis ? 'text-white' : 'text-[color:var(--color-near-black)]'
        }`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
    </div>
  );
}

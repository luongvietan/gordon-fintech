'use client';

import type { CalculatorInputs } from '@/lib/calculator';
import { calculateOutputs, formatDollars, formatYears } from '@/lib/calculator';
import DataSourceBadge from '@/components/ui/DataSourceBadge';

interface Props {
  inputs: CalculatorInputs;
}

function modeledMonthly(inputs: CalculatorInputs) {
  const outputs = calculateOutputs(inputs);
  return inputs.loanType === 'federal' ? outputs.pslfMonthlyPayment || outputs.monthlyPaymentAttending : outputs.monthlyPaymentAttending;
}

export default function HouseholdFilingComparison({ inputs }: Props) {
  if (!inputs.spouseEnabled) return null;

  const mfjInputs: CalculatorInputs = {
    ...inputs,
    spouseEnabled: true,
    filingStatus: 'mfj',
  };
  const mfsInputs: CalculatorInputs = {
    ...inputs,
    spouseEnabled: true,
    filingStatus: 'mfs',
  };

  const mfjOutputs = calculateOutputs(mfjInputs);
  const mfsOutputs = calculateOutputs(mfsInputs);
  const mfjMonthly = modeledMonthly(mfjInputs);
  const mfsMonthly = modeledMonthly(mfsInputs);
  const monthlyDelta = mfjMonthly - mfsMonthly;

  return (
    <section
      aria-label="Household filing comparison"
      className="rounded-[var(--r-card)] bg-white p-5 md:p-6"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1.5">Household compare</p>
          <h3
            className="text-[1.05rem] md:text-[1.125rem] text-[color:var(--color-near-black)] tracking-[-0.012em] leading-[1.15]"
            style={{ fontWeight: 900 }}
          >
            MFJ vs MFS, side by side.
          </h3>
          <p className="mt-2 text-[12.5px] text-[color:var(--text-secondary)] font-medium max-w-2xl">
            Filing separately usually lowers the borrower&apos;s IDR payment, but
            often costs more in taxes. This view shows the payment gap and how
            it changes crossover timing with your current household inputs.
          </p>
        </div>
        <DataSourceBadge
          source="IRS + HHS"
          title="Modeled from current poverty-line and federal tax assumptions, plus your MFS tax-drag setting."
          compact
        />
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <ScenarioCard
          label="Married filing jointly"
          monthly={mfjMonthly}
          crossover={mfjOutputs.netWorthCrossoverYear}
          payoffYears={mfjOutputs.payoffYears}
        />
        <ScenarioCard
          label="Married filing separately"
          monthly={mfsMonthly}
          crossover={mfsOutputs.netWorthCrossoverYear}
          payoffYears={mfsOutputs.payoffYears}
          accent
        />
      </div>

      <div className="mt-4 rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 ring-1 ring-inset ring-[color:var(--border-subtle)]">
        <p className="text-[13px] font-bold text-[color:var(--color-near-black)] tracking-tight">
          Payment difference: {formatDollars(Math.abs(monthlyDelta))}/mo{' '}
          {monthlyDelta > 0 ? 'lower with MFS' : monthlyDelta < 0 ? 'lower with MFJ' : 'between both filing statuses'}
        </p>
        <p className="mt-1 text-[12px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
          This comparison uses your spouse income, spouse debt strategy, family
          size, and MFS tax-drag assumption. It is meant to surface the trade-off
          quickly, not replace a household CPA review.
        </p>
      </div>
    </section>
  );
}

function ScenarioCard({
  label,
  monthly,
  crossover,
  payoffYears,
  accent = false,
}: {
  label: string;
  monthly: number;
  crossover: number | null;
  payoffYears: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--r-card-sm)] p-4 ${
        accent
          ? 'bg-[color:var(--color-light-mint)]'
          : 'bg-[color:var(--color-off-white)]'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-3 tabular-nums">
        <Metric label="Monthly" value={`${formatDollars(monthly)}/mo`} />
        <Metric label="Payoff" value={formatYears(payoffYears)} />
        <Metric
          label="Crossover"
          value={crossover != null ? `Yr ${crossover}` : '—'}
        />
      </dl>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
        {label}
      </dt>
      <dd className="text-[13px] font-bold text-[color:var(--color-near-black)]">
        {value}
      </dd>
    </div>
  );
}

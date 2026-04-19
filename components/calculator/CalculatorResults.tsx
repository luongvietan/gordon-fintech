'use client';

import {
  CalculatorOutputs,
  formatDollars,
  formatDollarsExact,
  formatYears,
} from '@/lib/calculator';
import BalanceChart from './charts/BalanceChart';
import NetWorthChart from './charts/NetWorthChart';
import ComparisonChart from './charts/ComparisonChart';

interface Props {
  outputs: CalculatorOutputs;
  residencyYears: number;
  taxRate: number;
  pslfEnabled: boolean;
}

// ─── KPI tile ─────────────────────────────────────────────
interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'accent' | 'dark';
  big?: boolean;
}

function KpiCard({ label, value, sub, tone = 'default', big = false }: KpiProps) {
  const surface =
    tone === 'accent'
      ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
      : tone === 'dark'
      ? 'bg-[color:var(--color-near-black)] text-white'
      : 'bg-white';
  const labelColor =
    tone === 'accent'
      ? 'text-[color:var(--color-dark-green)]/70'
      : tone === 'dark'
      ? 'text-white/55'
      : 'text-[color:var(--text-muted)]';
  const valueColor =
    tone === 'accent'
      ? 'text-[color:var(--color-dark-green)]'
      : tone === 'dark'
      ? 'text-white'
      : 'text-[color:var(--color-near-black)]';
  const subColor =
    tone === 'accent'
      ? 'text-[color:var(--color-dark-green)]/65'
      : tone === 'dark'
      ? 'text-white/55'
      : 'text-[color:var(--text-muted)]';

  return (
    <div
      className={`${surface} rounded-[var(--r-card-sm)] p-4 md:p-5 flex flex-col justify-between min-h-[112px] md:min-h-[124px]`}
      style={{ boxShadow: tone === 'default' ? 'var(--shadow-ring)' : 'none' }}
    >
      <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${labelColor}`}>
        {label}
      </p>
      <p
        className={`mt-2 ${big ? 'text-[2rem] md:text-[2.5rem]' : 'text-[1.625rem] md:text-[2rem]'} ${valueColor} tracking-[-0.025em] leading-[0.95] tabular-nums`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
      {sub && (
        <p className={`mt-2 text-[12px] font-semibold ${subColor} leading-snug`}>{sub}</p>
      )}
    </div>
  );
}

// ─── Chart card ───────────────────────────────────────────
interface ChartCardProps {
  title: string;
  caption?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
}

function ChartCard({ title, caption, legend, children }: ChartCardProps) {
  return (
    <section
      className="bg-white rounded-[var(--r-card)] p-5 md:p-7"
      style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3 mb-4 md:mb-5">
        <div className="min-w-0">
          <h3
            className="text-[1.125rem] md:text-[1.25rem] text-[color:var(--color-near-black)] tracking-[-0.015em] leading-tight"
            style={{ fontWeight: 900 }}
          >
            {title}
          </h3>
          {caption && (
            <p className="text-[12px] text-[color:var(--text-muted)] font-medium mt-1">
              {caption}
            </p>
          )}
        </div>
        {legend}
      </header>
      {children}
    </section>
  );
}

// ─── Headline insight band ────────────────────────────────
function HeadlineInsight({
  outputs,
  pslfEnabled,
}: {
  outputs: CalculatorOutputs;
  pslfEnabled: boolean;
}) {
  const cross = outputs.netWorthCrossoverYear;
  const payoffLabel = formatYears(outputs.payoffYears);

  // Pick the single most-actionable headline depending on scenario state.
  let headline: string;
  let secondary: string;
  if (pslfEnabled && outputs.pslfEligible) {
    headline = `${formatDollars(outputs.pslfForgiven)} forgiven tax-free with PSLF.`;
    secondary = `That's ${formatDollars(outputs.pslfSavings)} less out of pocket vs the standard plan, with payoff in ${formatYears(outputs.pslfYearsToForgiveness)}.`;
  } else if (cross !== null) {
    headline = `You break even at year ${cross}.`;
    secondary = `From that point forward, your projected net worth stays positive. Total payoff lands at ${payoffLabel}.`;
  } else {
    headline = `${payoffLabel} to fully repay.`;
    secondary = `Your net-worth trajectory hasn't hit positive yet on this scenario \u2014 try toggling PSLF or a longer time horizon.`;
  }

  return (
    <div
      className="rounded-[var(--r-card)] p-5 md:p-6 bg-[color:var(--color-near-black)] text-white flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
    >
      <div
        aria-hidden
        className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-wise-green)]">
          Your headline insight
        </p>
        <p
          className="mt-1.5 text-[1.5rem] md:text-[1.875rem] leading-[1.05] text-white tracking-[-0.02em]"
          style={{ fontWeight: 900 }}
        >
          {headline}
        </p>
        <p className="mt-2 text-[14px] text-white/65 leading-relaxed font-medium max-w-xl">
          {secondary}
        </p>
      </div>
    </div>
  );
}

export default function CalculatorResults({
  outputs,
  residencyYears,
  taxRate,
  pslfEnabled,
}: Props) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* ── HEADLINE INSIGHT ─────────────────────────── */}
      <HeadlineInsight outputs={outputs} pslfEnabled={pslfEnabled} />

      {/* ── KPI ROW (4-up on desktop) ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          label="Time to payoff"
          value={formatYears(outputs.payoffYears)}
          sub={
            outputs.pslfEligible
              ? `PSLF: ${formatYears(outputs.pslfYearsToForgiveness)}`
              : 'Standard 10-yr amortization'
          }
          big
        />
        <KpiCard
          label="Monthly payment"
          value={formatDollars(outputs.monthlyPaymentAttending)}
          sub={`Residency \u2248 ${formatDollars(outputs.monthlyPaymentResidency)}`}
        />
        <KpiCard
          label="Total interest"
          value={formatDollars(outputs.totalInterestPaid)}
          sub={`Total paid ${formatDollars(outputs.standardTotalPaid)}`}
          tone="dark"
        />
        <KpiCard
          label="Net-worth crossover"
          value={
            outputs.netWorthCrossoverYear !== null
              ? `Yr ${outputs.netWorthCrossoverYear}`
              : '\u2014'
          }
          sub="First year back in the black"
          tone="accent"
        />
      </div>

      {/* ── PSLF callout ────────────────────────────── */}
      {outputs.pslfEligible && (
        <div
          className="rounded-[var(--r-card-sm)] p-4 md:p-5 bg-[color:var(--color-light-mint)] grid grid-cols-2 md:grid-cols-[1fr_1fr_auto] gap-4 md:gap-6 items-center"
          style={{ boxShadow: 'var(--shadow-ring)' }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--color-dark-green)]/70">
              PSLF Forgiveness
            </p>
            <p
              className="text-[1.5rem] text-[color:var(--color-dark-green)] leading-none tabular-nums mt-1.5"
              style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
            >
              {formatDollars(outputs.pslfForgiven)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--color-dark-green)]/70">
              PSLF Savings
            </p>
            <p
              className="text-[1.5rem] text-[color:var(--color-dark-green)] leading-none tabular-nums mt-1.5"
              style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
            >
              {formatDollars(outputs.pslfSavings)}
            </p>
          </div>
          <p className="col-span-2 md:col-span-1 text-[12px] text-[color:var(--color-dark-green)]/85 max-w-xs font-medium leading-relaxed">
            Based on 120 qualifying payments at a 501(c)(3) or government employer.
          </p>
        </div>
      )}

      {/* ── CHARTS GRID ─────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
        <ChartCard
          title="Loan balance over time"
          caption="What you owe, year by year"
        >
          <BalanceChart
            standardSchedule={outputs.standardSchedule}
            pslfSchedule={outputs.pslfSchedule}
            residencyYears={residencyYears}
          />
        </ChartCard>

        <ChartCard
          title="Net worth over time"
          caption={`After ${taxRate ?? 30}% tax \u00b7 minus living expenses \u00b7 minus loan payments`}
        >
          <NetWorthChart
            schedule={outputs.standardSchedule}
            pslfSchedule={outputs.pslfSchedule}
            residencyYears={residencyYears}
            crossoverYear={outputs.netWorthCrossoverYear}
            taxRate={taxRate}
          />
        </ChartCard>
      </div>

      {outputs.pslfEligible && (
        <ChartCard title="PSLF vs Standard" caption="Side-by-side totals over the full payoff horizon">
          <ComparisonChart outputs={outputs} />
        </ChartCard>
      )}

      {/* ── OPPORTUNITY COST ─────────────────────────── */}
      <div className="rounded-[var(--r-card)] p-5 md:p-6 bg-white grid md:grid-cols-[1fr_auto] items-start gap-4" style={{ boxShadow: 'var(--shadow-ring)' }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] mb-2">
            Opportunity cost
          </p>
          <p
            className="text-[2rem] md:text-[2.25rem] text-[color:var(--color-near-black)] leading-none tabular-nums tracking-[-0.025em]"
            style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
          >
            {formatDollars(outputs.opportunityCost)}
          </p>
          <p className="text-[14px] text-[color:var(--text-secondary)] mt-3 max-w-md leading-relaxed font-medium">
            If the {formatDollars(outputs.extraDollarsPaid)} you paid above IDR
            minimums had been invested instead, it would grow to roughly this
            over the payoff horizon.
          </p>
        </div>
        <div className="text-[11px] text-[color:var(--text-muted)] font-medium md:text-right md:max-w-[180px] leading-relaxed">
          Assumes monthly contribution of the &ldquo;extra&rdquo; and compound growth at your assumed market return.
        </div>
      </div>

      {/* ── SNAPSHOT TABLE ───────────────────────────── */}
      <div
        className="bg-white rounded-[var(--r-card)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <div className="px-5 md:px-6 py-3.5 border-b border-[color:var(--border-subtle)] flex items-center justify-between gap-3">
          <h4
            className="text-[14px] text-[color:var(--color-near-black)] tracking-[-0.005em]"
            style={{ fontWeight: 900 }}
          >
            Year-by-year snapshot
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
            First 12 years
          </span>
        </div>
        <div className="overflow-x-auto wise-scroll">
          <table className="w-full text-[12.5px] font-semibold">
            <thead className="bg-[color:var(--color-off-white)] text-[10px] uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
              <tr>
                <th className="text-left px-4 py-3">Year</th>
                <th className="text-right px-4 py-3">Income</th>
                <th className="text-right px-4 py-3">Paid</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-right px-4 py-3">Net worth</th>
                <th className="text-left pl-4 pr-4 py-3">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {outputs.standardSchedule.slice(0, 12).map((row) => (
                <tr
                  key={row.year}
                  className="text-[color:var(--text-primary)] tabular-nums hover:bg-[color:var(--color-light-mint)]/60 transition-colors"
                >
                  <td className="px-4 py-2.5">{row.label}</td>
                  <td className="text-right px-4 py-2.5">
                    {row.annualIncome > 0 ? formatDollarsExact(row.annualIncome) : '\u2014'}
                  </td>
                  <td className="text-right px-4 py-2.5">
                    {row.annualPayment > 0 ? formatDollarsExact(row.annualPayment) : '\u2014'}
                  </td>
                  <td className="text-right px-4 py-2.5">{formatDollarsExact(row.balance)}</td>
                  <td
                    className={`text-right px-4 py-2.5 ${
                      row.netWorth < 0
                        ? 'text-[color:var(--color-danger)]'
                        : 'text-[color:var(--color-positive)]'
                    }`}
                  >
                    {formatDollarsExact(row.netWorth)}
                  </td>
                  <td className="pl-4 pr-4 py-2.5">
                    <span
                      className={`
                        inline-flex items-center px-2 py-0.5 rounded-[var(--r-pill)]
                        text-[10px] uppercase tracking-[0.08em]
                        ${row.phase === 'residency'
                          ? 'bg-[color:var(--color-near-black)]/[0.08] text-[color:var(--text-primary)]'
                          : row.phase === 'fellowship'
                          ? 'bg-[color:var(--color-near-black)]/[0.12] text-[color:var(--text-primary)]'
                          : row.phase === 'forgiven'
                          ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
                          : 'bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]'}
                      `}
                    >
                      {row.phase}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

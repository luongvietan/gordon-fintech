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
}

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  dark?: boolean;
}

function KpiCard({ label, value, sub, accent, dark }: KpiProps) {
  const bg = accent
    ? 'bg-[color:var(--color-wise-green)]'
    : dark
    ? 'bg-[color:var(--color-near-black)] text-white'
    : 'bg-white';
  const label_color = accent
    ? 'text-[color:var(--color-dark-green)]/80'
    : dark
    ? 'text-white/60'
    : 'text-[color:var(--text-muted)]';
  const value_color = accent
    ? 'text-[color:var(--color-dark-green)]'
    : dark
    ? 'text-white'
    : 'text-[color:var(--text-primary)]';
  const sub_color = accent
    ? 'text-[color:var(--color-dark-green)]/70'
    : dark
    ? 'text-white/60'
    : 'text-[color:var(--text-muted)]';

  return (
    <div
      className={`${bg} rounded-[var(--r-card-sm)] p-4 md:p-5 flex flex-col justify-between min-h-[96px]`}
      style={{ boxShadow: accent || dark ? 'none' : 'var(--shadow-ring)' }}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.10em] ${label_color}`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl md:text-[1.75rem] ${value_color} tracking-[-0.02em] leading-none tabular-nums`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
      {sub && (
        <p className={`mt-1.5 text-xs font-semibold ${sub_color}`}>{sub}</p>
      )}
    </div>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[var(--r-card)] p-5 md:p-6"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      {children}
    </div>
  );
}

export default function CalculatorResults({
  outputs,
  residencyYears,
  taxRate,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* ── KPI ROW ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Monthly payment"
          value={formatDollars(outputs.monthlyPaymentAttending)}
          sub={`Residency ≈ ${formatDollars(outputs.monthlyPaymentResidency)}`}
        />
        <KpiCard
          label="Time to payoff"
          value={formatYears(outputs.payoffYears)}
          sub={
            outputs.pslfEligible
              ? `PSLF: ${formatYears(outputs.pslfYearsToForgiveness)}`
              : undefined
          }
        />
        <KpiCard
          label="Total interest"
          value={formatDollars(outputs.totalInterestPaid)}
          sub={`Total paid ${formatDollars(outputs.standardTotalPaid)}`}
          dark
        />
        <div className="relative">
          {/* Annotated callout — surfaces the most valuable insight the tool
              produces. Hidden on small viewports to avoid crowding the KPI. */}
          <div
            aria-hidden
            className="hidden xl:block absolute -top-7 right-0 translate-y-[-100%] pointer-events-none"
          >
            <div className="flex items-end gap-2">
              <span className="inline-block px-2.5 py-1 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-wider bg-[color:var(--color-near-black)] text-white whitespace-nowrap">
                The insight most doctors miss
              </span>
              <svg
                width="24"
                height="36"
                viewBox="0 0 24 36"
                fill="none"
                aria-hidden="true"
                className="text-[color:var(--color-near-black)] -mb-1"
              >
                <path
                  d="M12 2 C 18 10, 18 22, 12 32 M12 32 L7 26 M12 32 L17 26"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          <KpiCard
            label="Net-worth crossover"
            value={
              outputs.netWorthCrossoverYear !== null
                ? `Yr ${outputs.netWorthCrossoverYear}`
                : '—'
            }
            sub="First year back in the black"
            accent
          />
        </div>
      </div>

      {/* ── PSLF callout ────────────────────────────── */}
      {outputs.pslfEligible && (
        <div
          className="rounded-[var(--r-card-sm)] p-4 md:p-5 bg-[color:var(--color-light-mint)] flex flex-wrap items-baseline gap-x-6 gap-y-2"
          style={{ boxShadow: 'var(--shadow-ring)' }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--color-dark-green)]/70">
              PSLF Forgiveness
            </p>
            <p
              className="text-2xl text-[color:var(--color-dark-green)] leading-none tabular-nums mt-1.5"
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
              className="text-2xl text-[color:var(--color-dark-green)] leading-none tabular-nums mt-1.5"
              style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
            >
              {formatDollars(outputs.pslfSavings)}
            </p>
          </div>
          <p className="text-xs text-[color:var(--color-dark-green)]/80 max-w-xs font-medium">
            Based on 120 qualifying payments at a 501(c)(3) / government employer.
          </p>
        </div>
      )}

      {/* ── CHARTS ───────────────────────────────────── */}
      <ChartCard>
        <BalanceChart
          standardSchedule={outputs.standardSchedule}
          pslfSchedule={outputs.pslfSchedule}
          residencyYears={residencyYears}
        />
      </ChartCard>

      <ChartCard>
        <NetWorthChart
          schedule={outputs.standardSchedule}
          pslfSchedule={outputs.pslfSchedule}
          residencyYears={residencyYears}
          crossoverYear={outputs.netWorthCrossoverYear}
          taxRate={taxRate}
        />
      </ChartCard>

      {outputs.pslfEligible && (
        <ChartCard>
          <ComparisonChart outputs={outputs} />
        </ChartCard>
      )}

      {/* ── OPPORTUNITY COST ─────────────────────────── */}
      <div
        className="rounded-[var(--r-card)] p-5 md:p-6 bg-[color:var(--color-near-black)] text-white grid md:grid-cols-[1fr_auto] items-start gap-4"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-white/60 mb-2">
            Opportunity cost
          </p>
          <p
            className="text-3xl md:text-4xl text-white leading-none tabular-nums"
            style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
          >
            {formatDollars(outputs.opportunityCost)}
          </p>
          <p className="text-sm text-white/70 mt-3 max-w-sm leading-relaxed font-medium">
            If the {formatDollars(outputs.extraDollarsPaid)} you paid above IDR
            minimums had been invested instead, it would grow to roughly this
            over the payoff horizon.
          </p>
        </div>
        <div className="text-xs text-white/60 font-medium md:text-right md:max-w-[160px] leading-relaxed">
          Estimate assumes monthly contribution of the &ldquo;extra&rdquo; and compound growth.
        </div>
      </div>

      {/* ── SNAPSHOT TABLE ───────────────────────────── */}
      <div
        className="bg-white rounded-[var(--r-card-sm)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <div className="px-4 md:px-5 py-3 border-b border-[color:var(--border-subtle)]">
          <h4
            className="text-sm text-[color:var(--text-primary)] tracking-[-0.005em]"
            style={{ fontWeight: 900 }}
          >
            Year-by-year snapshot
          </h4>
        </div>
        <div className="overflow-x-auto wise-scroll">
          <table className="w-full text-xs font-semibold">
            <thead className="bg-[color:var(--color-off-white)] text-[10px] uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
              <tr>
                <th className="text-left px-4 py-2.5">Year</th>
                <th className="text-right px-4 py-2.5">Income</th>
                <th className="text-right px-4 py-2.5">Paid</th>
                <th className="text-right px-4 py-2.5">Balance</th>
                <th className="text-right px-4 py-2.5">Net worth</th>
                <th className="text-left pl-4 pr-4 py-2.5">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {outputs.standardSchedule.slice(0, 12).map((row) => (
                <tr
                  key={row.year}
                  className="text-[color:var(--text-primary)] tabular-nums hover:bg-[color:var(--color-light-mint)] transition-colors"
                >
                  <td className="px-4 py-2.5">{row.label}</td>
                  <td className="text-right px-4 py-2.5">
                    {row.annualIncome > 0 ? formatDollarsExact(row.annualIncome) : '—'}
                  </td>
                  <td className="text-right px-4 py-2.5">
                    {row.annualPayment > 0 ? formatDollarsExact(row.annualPayment) : '—'}
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

'use client';

import {
  ChevronDown,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
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
//
// KPI cards do most of the "first 5 seconds" work — they answer the
// four questions every borrower asks: How long? How much per month?
// How much interest? When am I in the black? Tone variants give the
// row visual rhythm without resorting to a wall of identical white
// boxes (which is what the previous design was trending toward).
interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'accent' | 'dark';
  icon?: React.ReactNode;
  /** When true the value renders one tier larger (used for the headline KPI). */
  big?: boolean;
}

function KpiCard({ label, value, sub, tone = 'default', icon, big = false }: KpiProps) {
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
  const iconBg =
    tone === 'accent'
      ? 'bg-[color:var(--color-dark-green)]/10 text-[color:var(--color-dark-green)]'
      : tone === 'dark'
      ? 'bg-white/10 text-white'
      : 'bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]';

  return (
    <div
      className={`${surface} rounded-[var(--r-card-sm)] p-4 md:p-5 lg:p-6 flex flex-col justify-between min-h-[120px] md:min-h-[140px] lg:min-h-[160px] relative overflow-hidden`}
      style={{ boxShadow: tone === 'default' ? 'var(--shadow-ring)' : 'none' }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${labelColor}`}>
          {label}
        </p>
        {icon && (
          <span
            aria-hidden
            className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full ${iconBg}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={`mt-3 ${
          big
            ? 'text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem]'
            : 'text-[1.75rem] md:text-[2.125rem] lg:text-[2.5rem]'
        } ${valueColor} tracking-[-0.025em] leading-[0.95] tabular-nums`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
      {sub && (
        <p className={`mt-2 text-[12px] font-semibold ${subColor} leading-snug`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Chart card ───────────────────────────────────────────
//
// Each chart sits inside a generous "presentation card" with a clear
// title + caption. The eyebrow + title pair gives the eye a place to
// land before parsing the chart itself.
interface ChartCardProps {
  title: string;
  caption?: string;
  eyebrow?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
}

function ChartCard({ title, caption, eyebrow, legend, children }: ChartCardProps) {
  return (
    <section
      className="bg-white rounded-[var(--r-card)] p-5 md:p-7 lg:p-8"
      style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
    >
      <header className="flex flex-wrap items-end justify-between gap-3 mb-5 md:mb-6">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-1.5">
              {eyebrow}
            </p>
          )}
          <h3
            className="text-[1.25rem] md:text-[1.375rem] lg:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.018em] leading-[1.05]"
            style={{ fontWeight: 900 }}
          >
            {title}
          </h3>
          {caption && (
            <p className="text-[12.5px] md:text-[13px] text-[color:var(--text-muted)] font-medium mt-1.5 leading-snug max-w-md">
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
//
// The single most important line in the whole results pane. We
// pre-compute one human sentence based on the dominant scenario state
// (PSLF eligible, crossover hit, or neither) so the user reads insight
// before they read numbers.
function HeadlineInsight({
  outputs,
  pslfEnabled,
}: {
  outputs: CalculatorOutputs;
  pslfEnabled: boolean;
}) {
  const cross = outputs.netWorthCrossoverYear;
  const payoffLabel = formatYears(outputs.payoffYears);

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
    <div className="relative rounded-[var(--r-card)] p-6 md:p-7 lg:p-9 bg-[color:var(--color-near-black)] text-white overflow-hidden">
      {/* Subtle ambient glow — purely decorative, hidden from a11y. */}
      <div
        aria-hidden
        className="absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl opacity-25"
        style={{ background: 'var(--color-wise-green)' }}
      />
      <div
        aria-hidden
        className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full blur-3xl opacity-15"
        style={{ background: 'var(--color-wise-green)' }}
      />
      <div className="relative flex flex-col md:flex-row md:items-start gap-5 md:gap-7">
        <div
          aria-hidden
          className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
        >
          <Sparkles aria-hidden="true" className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-wise-green)]">
            Your headline insight
          </p>
          <p
            className="mt-2 text-[1.625rem] md:text-[2rem] lg:text-[2.5rem] leading-[1.02] text-white tracking-[-0.025em]"
            style={{ fontWeight: 900 }}
          >
            {headline}
          </p>
          <p className="mt-3 text-[14px] md:text-[15px] text-white/65 leading-relaxed font-medium max-w-2xl">
            {secondary}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── KPI ICONS (lucide-react) ────────────────────────────
const KPI_ICON_CLASS = 'w-3.5 h-3.5';
const KPI_ICON_STROKE = 1.75;

function IconClock() {
  return <Clock aria-hidden="true" className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
}
function IconCash() {
  return <Wallet aria-hidden="true" className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
}
function IconFlame() {
  return <Flame aria-hidden="true" className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
}
function IconCrossover() {
  return <TrendingUp aria-hidden="true" className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
}

export default function CalculatorResults({
  outputs,
  residencyYears,
  taxRate,
  pslfEnabled,
}: Props) {
  return (
    <div className="flex flex-col gap-5 md:gap-6 lg:gap-7">
      {/* ── HEADLINE INSIGHT ─────────────────────────── */}
      <HeadlineInsight outputs={outputs} pslfEnabled={pslfEnabled} />

      {/* ── KPI ROW (4-up on desktop, with icons + emphasis hierarchy) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          label="Time to payoff"
          value={formatYears(outputs.payoffYears)}
          sub={
            outputs.pslfEligible
              ? `PSLF: ${formatYears(outputs.pslfYearsToForgiveness)}`
              : 'Standard 10-yr amortization'
          }
          icon={<IconClock />}
          big
        />
        <KpiCard
          label="Monthly payment"
          value={formatDollars(outputs.monthlyPaymentAttending)}
          sub={`Residency \u2248 ${formatDollars(outputs.monthlyPaymentResidency)}`}
          icon={<IconCash />}
        />
        <KpiCard
          label="Total interest"
          value={formatDollars(outputs.totalInterestPaid)}
          sub={`Total paid ${formatDollars(outputs.standardTotalPaid)}`}
          tone="dark"
          icon={<IconFlame />}
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
          icon={<IconCrossover />}
        />
      </div>

      {/* ── PSLF callout ────────────────────────────── */}
      {outputs.pslfEligible && (
        <div
          className="rounded-[var(--r-card)] p-5 md:p-6 lg:p-7 bg-[color:var(--color-light-mint)] grid grid-cols-2 md:grid-cols-[1fr_1fr_auto] gap-5 md:gap-7 items-center"
          style={{ boxShadow: 'var(--shadow-ring)' }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-dark-green)]/70">
              PSLF Forgiveness
            </p>
            <p
              className="text-[1.75rem] md:text-[2rem] text-[color:var(--color-dark-green)] leading-none tabular-nums mt-2"
              style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
            >
              {formatDollars(outputs.pslfForgiven)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-dark-green)]/70">
              PSLF Savings
            </p>
            <p
              className="text-[1.75rem] md:text-[2rem] text-[color:var(--color-dark-green)] leading-none tabular-nums mt-2"
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

      {/* ── CHARTS GRID ─────────────────────────────────────
        Desktop story:
        - On 2xl+ we put Balance + Net Worth side-by-side; both are
          driven by years-on-x so the eye can compare directly.
        - Below that, the Comparison bar chart (when PSLF is on) gets
          the full canvas width — it's the "this is what you'd give up
          by not doing PSLF" moment and earns the real estate.
      */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
        <ChartCard
          eyebrow="Loan balance"
          title="What you owe, year by year"
          caption="Standard repayment plotted against the PSLF projection when enabled."
        >
          <BalanceChart
            standardSchedule={outputs.standardSchedule}
            pslfSchedule={outputs.pslfSchedule}
            residencyYears={residencyYears}
            heightDesktop={380}
          />
        </ChartCard>

        <ChartCard
          eyebrow="Net worth"
          title="When you turn the corner"
          caption={`After ${taxRate ?? 30}% tax \u00b7 minus living expenses \u00b7 minus loan payments.`}
        >
          <NetWorthChart
            schedule={outputs.standardSchedule}
            pslfSchedule={outputs.pslfSchedule}
            residencyYears={residencyYears}
            crossoverYear={outputs.netWorthCrossoverYear}
            taxRate={taxRate}
            heightDesktop={380}
          />
        </ChartCard>
      </div>

      {outputs.pslfEligible && (
        <ChartCard
          eyebrow="PSLF vs Standard"
          title="The forgiveness scoreboard"
          caption="Side-by-side totals over the full payoff horizon."
        >
          <ComparisonChart outputs={outputs} heightDesktop={360} />
        </ChartCard>
      )}

      {/* ── OPPORTUNITY COST ─────────────────────────── */}
      <div
        className="rounded-[var(--r-card)] p-6 md:p-7 lg:p-8 bg-white grid md:grid-cols-[1fr_auto] items-start gap-5"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-2">
            Opportunity cost
          </p>
          <p
            className="text-[2.25rem] md:text-[2.5rem] lg:text-[2.75rem] text-[color:var(--color-near-black)] leading-none tabular-nums tracking-[-0.025em]"
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
        <div className="text-[11px] text-[color:var(--text-muted)] font-medium md:text-right md:max-w-[200px] leading-relaxed">
          Assumes monthly contribution of the &ldquo;extra&rdquo; and compound growth at your assumed market return.
        </div>
      </div>

      {/* ── SNAPSHOT TABLE — collapsed by default so the page lead with insight, not data ─── */}
      <details
        className="group bg-white rounded-[var(--r-card)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <summary className="px-5 md:px-7 py-4 cursor-pointer list-none flex items-center justify-between gap-3 hover:bg-[color:var(--color-off-white)] transition-colors">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
              Audit trail
            </p>
            <h4
              className="text-[15px] md:text-[16px] text-[color:var(--color-near-black)] tracking-[-0.005em] mt-0.5"
              style={{ fontWeight: 900 }}
            >
              Year-by-year snapshot
            </h4>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] group-open:text-[color:var(--color-near-black)]">
            <span className="hidden sm:inline">First 12 years</span>
            <ChevronDown
              aria-hidden="true"
              className="w-3 h-3 transition-transform group-open:rotate-180"
              strokeWidth={2}
            />
          </span>
        </summary>
        <div className="overflow-x-auto wise-scroll border-t border-[color:var(--border-subtle)]">
          <table className="w-full text-[12.5px] font-semibold">
            <thead className="bg-[color:var(--color-off-white)] text-[10px] uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
              <tr>
                <th className="text-left px-4 md:px-6 py-3">Year</th>
                <th className="text-right px-4 py-3">Income</th>
                <th className="text-right px-4 py-3">Paid</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-right px-4 py-3">Net worth</th>
                <th className="text-left pl-4 pr-4 md:pr-6 py-3">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {outputs.standardSchedule.slice(0, 12).map((row) => (
                <tr
                  key={row.year}
                  className="text-[color:var(--text-primary)] tabular-nums hover:bg-[color:var(--color-light-mint)]/60 transition-colors"
                >
                  <td className="px-4 md:px-6 py-2.5">{row.label}</td>
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
                  <td className="pl-4 pr-4 md:pr-6 py-2.5">
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
      </details>
    </div>
  );
}

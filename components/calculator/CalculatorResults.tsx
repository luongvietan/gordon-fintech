'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  ChevronDown,
  Clock,
  Flame,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  CalculatorInputs,
  CalculatorOutputs,
  formatDollars,
  formatDollarsExact,
  formatYears,
} from '@/lib/calculator';
import { recommendStrategy } from '@/lib/recommendation';
import { runAllStrategies } from '@/lib/calculator-scenarios';
import { getRiskFlags } from '@/lib/risk-flags';
import { SPECIALTIES } from '@/lib/specialties';
import { bucketDollars, track } from '@/lib/analytics';
import BalanceChart from './charts/BalanceChart';
import NetWorthChart from './charts/NetWorthChart';
import ComparisonChart from './charts/ComparisonChart';
import BestStrategyPanel from './BestStrategyPanel';
import StrategyComparison from './StrategyComparison';
import QuickToggles from './QuickToggles';
import RiskFlags from './RiskFlags';
import PslfDisruptionPanel from './PslfDisruptionPanel';
import TaxBombCard from './TaxBombCard';
import HouseholdFilingComparison from './HouseholdFilingComparison';
import InlineEmailCapture from './InlineEmailCapture';
import PeerBenchmarkNote from './PeerBenchmarkNote';
import ExplainPopover, { type ExplainData } from './ExplainPopover';
import RefiWarningCard from './RefiWarningCard';
import RefiBreakevenCard from './RefiBreakevenCard';

interface Props {
  inputs: CalculatorInputs;
  defaults: CalculatorInputs;
  baselineInputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  residencyYears: number;
  taxRate: number;
  onChange: (next: Partial<CalculatorInputs>) => void;
  onReplace: (next: CalculatorInputs) => void;
  onResetToBaseline: () => void;
}

// ─── KPI tile ─────────────────────────────────────────────
//
// KPI cards do most of the "first 5 seconds" work. R2.P5 bumped the value
// typography one tier so the four headline numbers carry across a desk
// without becoming visually cluttered.
interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'accent' | 'dark';
  icon?: React.ReactNode;
  big?: boolean;
  explain?: ExplainData;
}

function KpiCard({ label, value, sub, tone = 'default', icon, big = false, explain }: KpiProps) {
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
      className={`${surface} rounded-[var(--r-card-sm)] p-4 md:p-5 lg:p-6 xl:p-7 flex flex-col min-h-[130px] md:min-h-[150px] lg:min-h-[190px] relative overflow-hidden`}
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
            ? 'text-[2.5rem] md:text-[3rem] lg:text-[3.5rem]'
            : 'text-[1.875rem] md:text-[2.25rem] lg:text-[2.625rem]'
        } ${valueColor} tracking-[-0.025em] leading-[0.95] tabular-nums`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
      <div className="mt-auto pt-3 flex flex-col items-start gap-2.5">
        {sub ? (
          <p
            className={`text-[12px] font-semibold ${subColor} leading-snug min-w-0 max-w-full min-h-[2.25rem]`}
          >
            {sub}
          </p>
        ) : null}
        {explain && (
          // Dark-tone tiles (hero, callout) flip the trigger's text color
          // to white. Ring + background inside ExplainPopover's trigger
          // key off `currentColor`, so they pick this up automatically
          // and render as faint-white instead of dark-green. We use /85
          // (vs the old /70) so the ring at 25% alpha is still visible
          // against the dark KPI surface.
          <div
            className={
              tone === 'default'
                ? 'max-w-full'
                : 'max-w-full [&_button]:!text-white/85 [&_button:hover]:!text-white'
            }
          >
            <ExplainPopover {...explain} size="compact" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart card ───────────────────────────────────────────
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

// ─── KPI ICONS ────────────────────────────────────────────
const KPI_ICON_CLASS = 'w-3.5 h-3.5';
const KPI_ICON_STROKE = 1.75;
const IconClock = () => <Clock aria-hidden className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
const IconCash = () => <Wallet aria-hidden className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
const IconFlame = () => <Flame aria-hidden className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;
const IconCrossover = () => <TrendingUp aria-hidden className={KPI_ICON_CLASS} strokeWidth={KPI_ICON_STROKE} />;

export default function CalculatorResults({
  inputs,
  defaults,
  baselineInputs,
  outputs,
  residencyYears,
  taxRate,
  onChange,
  onReplace,
  onResetToBaseline,
}: Props) {
  // Identify a specialty id from the current inputs for benchmark + recommendation engines.
  const specialtyId = useMemo(() => {
    const totalTraining = inputs.residencyYears + (inputs.fellowshipYears ?? 0);
    return SPECIALTIES.find(
      (s) =>
        s.attendingSalary === inputs.attendingSalary &&
        s.residencyYears === totalTraining,
    )?.id;
  }, [inputs.attendingSalary, inputs.fellowshipYears, inputs.residencyYears]);

  const recommendation = useMemo(
    () => recommendStrategy(inputs, outputs, specialtyId),
    [inputs, outputs, specialtyId],
  );

  const comparison = useMemo(
    () => runAllStrategies(inputs, recommendation.strategy),
    [inputs, recommendation.strategy],
  );

  const riskFlags = useMemo(() => getRiskFlags(inputs, outputs), [inputs, outputs]);

  // ── calculator_completed ─────────────────────────────────────
  //
  // Fire exactly once per mount, the first render cycle where outputs
  // look real (payoffYears > 0 — guards against SSR-stub or in-flight
  // states). We intentionally don't re-fire on every input tweak: that
  // would drown GA in noise and we already track the high-signal
  // `preset_selected`, `specialty_selected`, `pslf_toggled` etc.
  // separately. This event's job is funnel-level: how many visitors
  // actually saw a completed calculation.
  //
  // Payload is PII-free — amounts go through `bucketDollars()` so raw
  // $450K / $280K figures never land in GA.
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    if (!(outputs.payoffYears > 0)) return;
    fired.current = true;
    track('calculator_completed', {
      loan_type: inputs.loanType,
      pslf_enabled: !!inputs.pslfEnabled,
      specialty_id: specialtyId ?? 'custom',
      debt_bucket: bucketDollars(inputs.totalDebt),
      salary_bucket: bucketDollars(inputs.attendingSalary),
      recommended_strategy: recommendation.strategy,
      payoff_years_rounded: Math.round(outputs.payoffYears),
    });
  }, [
    inputs.attendingSalary,
    inputs.loanType,
    inputs.pslfEnabled,
    inputs.totalDebt,
    outputs.payoffYears,
    recommendation.strategy,
    specialtyId,
  ]);

  // Show-your-work payloads — they use real numeric inputs from the current run.
  const explainPayoff: ExplainData = {
    title: 'Time to payoff',
    formula: 'months_to_zero(balance, monthly_payment, interest_rate)',
    inputsUsed: [
      { label: 'Total debt', value: formatDollars(inputs.totalDebt) },
      { label: 'Interest rate', value: `${inputs.interestRate}%` },
      { label: 'Attending payment', value: `${formatDollars(outputs.monthlyPaymentAttending)}/mo` },
      { label: 'Training years', value: residencyYears },
    ],
    plainEnglish:
      'We simulate every month of repayment: interest accrues, your payment chips away at principal, repeat until the balance hits zero. Training-phase payments use either your override or the IDR/interest-only floor; attending-phase uses 10-year amortization (or your override).',
  };

  // Principal entering the attending phase: read the balance at the end of
  // training from the schedule (capitalization happens during training).
  const balanceAtAttendingApprox = useMemo(() => {
    const trainingEnd = outputs.standardSchedule.find(
      (row) => row.year === residencyYears,
    );
    return trainingEnd?.balance ?? inputs.totalDebt;
  }, [outputs.standardSchedule, residencyYears, inputs.totalDebt]);

  const explainMonthly: ExplainData = {
    title: 'Monthly payment',
    formula: 'M = P \u00b7 r \u00b7 (1+r)\u207f / ((1+r)\u207f \u2212 1)',
    inputsUsed: [
      { label: 'Principal at attending (P)', value: formatDollars(balanceAtAttendingApprox) },
      { label: 'Monthly rate (r)', value: `${(inputs.interestRate / 12).toFixed(3)}%` },
      { label: 'Months (n)', value: 120 },
    ],
    plainEnglish:
      'Standard amortization formula: solve for the fixed monthly payment that drives the balance to zero in 10 years (120 months) at your interest rate.',
  };

  const explainInterest: ExplainData = {
    title: 'Total interest',
    formula: 'sum(monthly_interest_t) for t in 1..months_to_payoff',
    inputsUsed: [
      { label: 'Total paid', value: formatDollars(outputs.standardTotalPaid) },
      { label: 'Original principal', value: formatDollars(inputs.totalDebt) },
      { label: 'Interest = paid \u2212 principal', value: formatDollars(outputs.totalInterestPaid) },
    ],
    plainEnglish:
      'Each month, interest = current balance \u00d7 (annual rate / 12). We sum every month\u2019s interest charge across the full repayment horizon. Equivalent to total paid minus original principal (assuming no capitalization).',
  };

  const explainCrossover: ExplainData = {
    title: 'Net-worth crossover',
    formula: 'min{ year : net_worth(year) \u2265 0 }',
    inputsUsed: [
      { label: 'Effective tax rate', value: `${taxRate}%` },
      { label: 'Investment return', value: `${inputs.investmentReturn}%` },
      { label: 'Living expenses (attending)', value: `${formatDollars(inputs.livingExpensesAttending)}/mo` },
      {
        label: 'Crossover year',
        value: outputs.netWorthCrossoverYear ?? '\u2014',
      },
    ],
    plainEnglish:
      'Net worth = invested assets minus loan balance. Each year we add after-tax income, subtract living expenses and loan payments, invest the leftover at your assumed market return, and check whether the result has cleared zero.',
  };

  return (
    // `role="region"` + aria-label gives assistive tech a stable
    // landmark for the results, and `aria-live="polite"` lets screen
    // readers announce updated numbers without stealing focus. We
    // deliberately use `polite` (not `assertive`) because users are
    // typing into inputs — loud announcements would interrupt typing.
    <div
      role="region"
      aria-label="Calculator results"
      aria-live="polite"
      aria-atomic="false"
      className="flex flex-col gap-5 md:gap-6 lg:gap-7"
    >
      {/* ── 1. Verdict (replaces HeadlineInsight) ────────── */}
      <BestStrategyPanel
        recommendation={recommendation}
        inputs={inputs}
        defaults={defaults}
      />

      {/* ── 2. Quick what-if scenarios ──────────────────── */}
      <QuickToggles
        inputs={inputs}
        baselineInputs={baselineInputs}
        onChange={onChange}
        onReplace={onReplace}
        onReset={onResetToBaseline}
      />

      {/* ── 3. Refinancing warning (when refi enabled) ──── */}
      {inputs.refinanceEnabled && <RefiWarningCard />}

      {/* ── 3. Strategy comparison ──────────────────────── */}
      <StrategyComparison comparison={comparison} />

      {/* ── 3b. Refi breakeven (when both PSLF + refi present) ── */}
      {inputs.refinanceEnabled && (() => {
        const pslfOut = comparison.strategies.find((s) => s.id === 'pslf');
        const refiOut = comparison.strategies.find((s) => s.id === 'refinance');
        if (!pslfOut || !refiOut) return null;
        return <RefiBreakevenCard pslfOutcome={pslfOut} refiOutcome={refiOut} />;
      })()}

      {/* ── 4. Inline email capture ─────────────────────── */}
      <InlineEmailCapture />

      {/* ── 5. Contextual risk / assumption flags ──────── */}
      <RiskFlags flags={riskFlags} />

      {/* ── 5b. Household filing comparison ────────────── */}
      <HouseholdFilingComparison inputs={inputs} />

      {/* ── 6. KPI ROW (4-up on desktop, with show-your-work) ─── */}
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
          explain={explainPayoff}
        />
        <KpiCard
          label="Monthly payment"
          value={formatDollars(outputs.monthlyPaymentAttending)}
          sub={`Residency \u2248 ${formatDollars(outputs.monthlyPaymentResidency)}`}
          icon={<IconCash />}
          explain={explainMonthly}
        />
        <KpiCard
          label="Total interest"
          value={formatDollars(outputs.totalInterestPaid)}
          sub={`Total paid ${formatDollars(outputs.standardTotalPaid)}`}
          tone="dark"
          icon={<IconFlame />}
          explain={explainInterest}
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
          explain={explainCrossover}
        />
      </div>

      {/* ── 7. Peer benchmark inline note ───────────────── */}
      <PeerBenchmarkNote
        specialtyId={specialtyId}
        attendingSalary={inputs.attendingSalary}
        payoffYears={
          outputs.pslfEligible ? outputs.pslfYearsToForgiveness : outputs.payoffYears
        }
        isPslf={!!outputs.pslfEligible}
      />

      {/* ── 8. PSLF callout (legacy band — still informative) ─── */}
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

      {/* ── 9. PSLF disruption stress test ──────────────── */}
      <PslfDisruptionPanel inputs={inputs} />

      {/* ── 10. IDR Tax Bomb (non-PSLF federal IDR paths) ─── */}
      <TaxBombCard inputs={inputs} />

      {/* ── 11. CHARTS GRID (R2.P5: 500px desktop) ───────── */}
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
            heightDesktop={500}
            refiCurve={
              inputs.refinanceEnabled
                ? {
                    balanceAtTrainingEnd: balanceAtAttendingApprox,
                    trainingYears: residencyYears,
                    refiRate: inputs.refinanceRate ?? 4.5,
                    refiTermYears: inputs.refinanceTermYears ?? 10,
                  }
                : undefined
            }
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
            heightDesktop={500}
          />
        </ChartCard>
      </div>

      {outputs.pslfEligible && (
        <ChartCard
          eyebrow="PSLF vs Standard"
          title="The forgiveness scoreboard"
          caption="Side-by-side totals over the full payoff horizon."
        >
          <ComparisonChart outputs={outputs} heightDesktop={500} />
        </ChartCard>
      )}

      {/* ── 12. OPPORTUNITY COST ─────────────────────────── */}
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
          <div className="mt-3">
            <ExplainPopover
              title="Opportunity cost"
              formula="opportunity_cost = FV(extra_monthly, market_return%, months_to_payoff)"
              inputsUsed={[
                { label: 'Extra paid above IDR floor', value: formatDollars(outputs.extraDollarsPaid) },
                { label: 'Assumed market return', value: `${inputs.investmentReturn}%/yr` },
                { label: 'Opportunity cost', value: formatDollars(outputs.opportunityCost) },
              ]}
              plainEnglish="Each month you pay more than the IDR minimum, you give up the chance to invest that money. We calculate how much those extra payments would have grown at your assumed market return over the payoff period."
              size="compact"
            />
          </div>
        </div>
        <div className="text-[11px] text-[color:var(--text-muted)] font-medium md:text-right md:max-w-[200px] leading-relaxed">
          Assumes monthly contribution of the &ldquo;extra&rdquo; and compound growth at your assumed market return.
        </div>
      </div>

      {/* ── 13. Audit trail (year-by-year snapshot) ────── */}
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
              aria-hidden
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

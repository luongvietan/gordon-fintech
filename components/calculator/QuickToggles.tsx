'use client';

import { Briefcase, RefreshCw, RotateCcw, TrendingUp, Zap } from 'lucide-react';
import type { CalculatorInputs } from '@/lib/calculator';
import { applyScenarioPreset } from '@/lib/calculator';
import { useExpertMode } from '@/hooks/useExpertMode';

interface Props {
  inputs: CalculatorInputs;
  baselineInputs: CalculatorInputs;
  onChange: (next: Partial<CalculatorInputs>) => void;
  onReplace: (next: CalculatorInputs) => void;
  onReset: () => void;
}

/**
 * "Quick scenarios" row above the comparison table.
 *
 * Each button mutates a single dimension of the inputs and re-renders
 * everything downstream. A "Modified scenario" badge shows up whenever the
 * current inputs diverge from the baseline snapshot, with a Reset button
 * that restores the baseline. Lightweight — does not introduce a separate
 * "scenario history" concept; just a one-step undo to baseline.
 */
export default function QuickToggles({
  inputs,
  baselineInputs,
  onChange,
  onReplace,
  onReset,
}: Props) {
  const modified = !shallowEqual(inputs, baselineInputs);
  const [, setExpert] = useExpertMode();

  return (
    <section
      aria-label="Quick what-if scenarios"
      className="rounded-[var(--r-card)] bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]"
        >
          <Zap className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Quick scenarios
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToggleButton
          icon={<Briefcase className="w-3 h-3" strokeWidth={2} aria-hidden />}
          label="Extend residency +1y"
          onClick={() =>
            onChange({ residencyYears: Math.min(10, inputs.residencyYears + 1) })
          }
        />
        <ToggleButton
          icon={<TrendingUp className="w-3 h-3" strokeWidth={2} aria-hidden />}
          label="Salary +$50K"
          onClick={() =>
            onChange({ attendingSalary: Math.min(2_000_000, inputs.attendingSalary + 50_000) })
          }
        />
        <ToggleButton
          icon={<Zap className="w-3 h-3" strokeWidth={2} aria-hidden />}
          label="Switch to aggressive"
          onClick={() => onReplace(applyScenarioPreset(inputs, 'aggressive'))}
        />
        {/* "Model refinancing" quick scenario — addresses R3 feedback
            that refi was buried in the Loans section and effectively
            invisible. Clicking this adds a fourth "Refinance" column to
            the strategy comparison with sensible physician defaults
            (4.5% APR, 10-yr term, 0% origination). We also flip expert
            mode on so the refi rate / term / fee fields are visible and
            tweakable below — otherwise the user can't tell where the
            numbers came from. */}
        <ToggleButton
          icon={<RefreshCw className="w-3 h-3" strokeWidth={2} aria-hidden />}
          label={inputs.refinanceEnabled ? 'Refi modeled ✓' : 'Model refinancing'}
          onClick={() => {
            setExpert(true);
            onChange({
              refinanceEnabled: true,
              refinanceRate: inputs.refinanceRate ?? 4.5,
              refinanceTermYears: inputs.refinanceTermYears ?? 10,
              refinanceOrigFeePct: inputs.refinanceOrigFeePct ?? 0,
            });
          }}
        />
      </div>

      <div className="md:ml-auto flex items-center gap-2.5">
        {modified && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-dark-green)] animate-pulse" />
            Modified scenario
          </span>
        )}
        <button
          type="button"
          onClick={onReset}
          disabled={!modified}
          className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-[11.5px] font-bold transition-colors ${
            modified
              ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] hover:bg-[color:var(--color-wise-green)]/80'
              : 'text-[color:var(--text-muted)] opacity-40 pointer-events-none'
          }`}
        >
          <RotateCcw className="w-3 h-3" strokeWidth={2} aria-hidden />
          Reset to baseline
        </button>
      </div>
    </section>
  );
}

function ToggleButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-[11.5px] font-bold bg-[color:var(--color-near-black)]/[0.06] text-[color:var(--color-near-black)] transition-all duration-200 hover:scale-[1.04] hover:bg-[color:var(--color-near-black)]/[0.10] active:scale-[0.96]"
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Shallow comparison limited to the input keys we mutate via quick-toggles
 * + anything the user might have changed manually. We skip `scenarioPreset`
 * because every onChange resets it to 'custom' regardless.
 */
function shallowEqual(a: CalculatorInputs, b: CalculatorInputs): boolean {
  const keys: (keyof CalculatorInputs)[] = [
    'totalDebt',
    'actualRepaymentEnabled',
    'currentBalance',
    'pslfQualifyingPaymentsMade',
    'repaymentStartMonth',
    'repaymentStartYear',
    'interestRate',
    'loanType',
    'residencyYears',
    'fellowshipYears',
    'fellowshipSalary',
    'residencyStartingSalary',
    'attendingSalary',
    'residentSalaryGrowthRate',
    'attendingSalaryGrowthRate',
    'monthlyPaymentResidencyOverride',
    'monthlyPaymentOverride',
    'pslfEnabled',
    'pslfResidencyQualifies',
    'livingExpensesResidency',
    'livingExpensesAttending',
    'taxRate',
    'inflationRate',
    'investmentReturn',
    'capitalizeOnlyAfterTraining',
    'mfsExtraTaxRatePct',
    'taxBombRateOverride',
    'spouseEnabled',
    'spouseIncome',
    'spouseIncomeGrowthRate',
    'spouseDebt',
    'spouseRepaymentStrategy',
    'filingStatus',
    'familySize',
    'jobChangeEnabled',
    'jobChangeYear',
    'jobChangeAttendingSalary',
    'jobChangePslfQualifies',
    'refinanceEnabled',
    'refinanceRate',
    'refinanceTermYears',
    'refinanceOrigFeePct',
    'idrPlan',
    'idrPaymentPct',
  ];
  for (const k of keys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

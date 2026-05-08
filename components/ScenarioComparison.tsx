'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, X } from 'lucide-react';
import {
  CalculatorInputs,
  CalculatorOutputs,
  calculateOutputs,
  formatDollars,
  formatYears,
  applyScenarioPreset,
  ScenarioPreset,
} from '@/lib/calculator';
import CalculatorInputsForm from '@/components/calculator/CalculatorInputs';
import { useScenarioStorage } from '@/hooks/useScenarioStorage';
import { trackScenarioSaved, track } from '@/lib/analytics';
import { BookmarkPlus, Check } from 'lucide-react';

interface ComparisonPaneProps {
  label: string;
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  onChange: (next: Partial<CalculatorInputs>) => void;
  onReset: () => void;
  onSave?: () => void;
  saveState?: 'idle' | 'saved';
  locked?: boolean;
}

function ComparisonPane({
  label,
  inputs,
  outputs,
  onChange,
  onReset,
  onSave,
  saveState = 'idle',
  locked = false,
}: ComparisonPaneProps) {
  return (
    <div className="flex flex-col min-w-0">
      {/* Pane header */}
      <div
        className="px-5 py-3 flex items-center justify-between gap-2 border-b border-[color:var(--border-subtle)]"
        style={{ background: 'var(--color-off-white)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-wider bg-[color:var(--color-near-black)] text-[color:var(--color-wise-green)]">
            {label}
          </span>
          {locked && (
            <span className="text-[11px] font-semibold text-[color:var(--text-muted)]">
              (locked)
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] hover:scale-[1.04] transition-transform"
            >
              {saveState === 'saved' ? (
                <Check aria-hidden className="w-3 h-3" strokeWidth={2.5} />
              ) : (
                <BookmarkPlus aria-hidden className="w-3 h-3" strokeWidth={2} />
              )}
              {saveState === 'saved' ? 'Saved' : 'Save'}
            </button>
          )}
          {!locked && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset scenario to defaults"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--r-pill)] text-[11px] font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--color-near-black)]/[0.05] transition-colors"
            >
              <RotateCcw aria-hidden className="w-2.5 h-2.5" strokeWidth={2} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI summary strip */}
      <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-[color:var(--border-subtle)] bg-white">
        <Stat
          label="Salary"
          value={formatDollars(inputs.attendingSalary)}
        />
        <Stat
          label="Payoff"
          value={formatYears(outputs.payoffYears)}
          accent={outputs.pslfEligible}
        />
        <Stat
          label="Total paid"
          value={formatDollars(outputs.standardTotalPaid)}
          muted
        />
        <Stat
          label="Crossover"
          value={
            outputs.netWorthCrossoverYear != null
              ? `Yr ${outputs.netWorthCrossoverYear}`
              : '—'
          }
          accent
        />
      </div>

      {/* Inputs */}
      {locked ? (
        <div className="px-4 py-4 flex flex-col gap-2">
          <p className="text-[12px] font-semibold text-[color:var(--text-muted)] text-center py-4">
            Scenario 1 is locked. Adjust Scenario 2 on the right to compare.
          </p>
          <dl className="grid grid-cols-2 gap-2 text-[12px]">
            <LockedField label="Total debt" value={formatDollars(inputs.totalDebt)} />
            <LockedField label="Interest rate" value={`${inputs.interestRate}%`} />
            <LockedField label="Residency" value={`${inputs.residencyYears} yrs`} />
            <LockedField label="Strategy" value={inputs.pslfEnabled ? 'PSLF' : inputs.refinanceEnabled ? 'Refi' : 'Standard'} />
          </dl>
        </div>
      ) : (
        <div className="px-4 py-4 overflow-y-auto max-h-[60vh] wise-scroll">
          <CalculatorInputsForm inputs={inputs} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[9px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
        {label}
      </dt>
      <dd
        className={`text-[15px] font-black tracking-[-0.01em] tabular-nums ${
          accent
            ? 'text-[color:var(--color-dark-green)]'
            : muted
            ? 'text-[color:var(--text-muted)]'
            : 'text-[color:var(--color-near-black)]'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-semibold text-[color:var(--text-muted)] uppercase tracking-[0.08em]">{label}</dt>
      <dd className="text-[13px] font-bold text-[color:var(--color-near-black)]">{value}</dd>
    </div>
  );
}

interface Props {
  scenario1Inputs: CalculatorInputs;
  scenario1Outputs: CalculatorOutputs;
  defaultInputs: CalculatorInputs;
  onClose: () => void;
}

/**
 * Side-by-side scenario comparison mode.
 *
 * Scenario 1 is locked to whatever the user had in the main calculator.
 * Scenario 2 starts as a copy of Scenario 1 and can be modified freely.
 * Both update live as inputs change.
 */
export default function ScenarioComparison({
  scenario1Inputs,
  scenario1Outputs,
  defaultInputs,
  onClose,
}: Props) {
  const [scenario2Inputs, setScenario2Inputs] = useState<CalculatorInputs>({
    ...scenario1Inputs,
  });
  const [save1State, setSave1State] = useState<'idle' | 'saved'>('idle');
  const [save2State, setSave2State] = useState<'idle' | 'saved'>('idle');

  const { saveScenario } = useScenarioStorage();

  const scenario2Outputs = useMemo(
    () => calculateOutputs(scenario2Inputs),
    [scenario2Inputs],
  );

  function handleChange2(updated: Partial<CalculatorInputs>) {
    setScenario2Inputs((prev) => ({ ...prev, ...updated, scenarioPreset: 'custom' }));
  }

  function handleReset2() {
    setScenario2Inputs({ ...scenario1Inputs });
  }

  function handleSave(which: 1 | 2) {
    const inp = which === 1 ? scenario1Inputs : scenario2Inputs;
    const out = which === 1 ? scenario1Outputs : scenario2Outputs;
    const setter = which === 1 ? setSave1State : setSave2State;
    saveScenario(inp, out);
    trackScenarioSaved({
      total: 1,
      pslf_enabled: !!inp.pslfEnabled,
      loan_type: inp.loanType,
    });
    setter('saved');
    setTimeout(() => setter('idle'), 1800);
  }

  // Diff highlights
  const payoffDiff = scenario2Outputs.payoffYears - scenario1Outputs.payoffYears;
  const costDiff = scenario2Outputs.standardTotalPaid - scenario1Outputs.standardTotalPaid;

  return (
    <div
      className="bg-white overflow-clip"
      style={{
        borderRadius: 'var(--r-card-lg)',
        boxShadow: 'var(--shadow-ring), var(--shadow-float)',
      }}
    >
      {/* Comparison header */}
      <div
        className="px-5 md:px-7 py-3.5 flex items-center justify-between gap-3 border-b border-[color:var(--border-subtle)]"
        style={{ background: 'var(--color-near-black)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold text-white tracking-[-0.01em]"
          >
            Comparison Mode
          </span>
          <span className="text-[11px] font-semibold text-white/50">
            Adjust Scenario 2 to compare side by side
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Exit comparison mode"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-[12px] font-semibold text-white/65 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X aria-hidden className="w-3.5 h-3.5" strokeWidth={2} />
          Exit comparison
        </button>
      </div>

      {/* Diff summary */}
      {(Math.abs(payoffDiff) > 0.1 || Math.abs(costDiff) > 1000) && (
        <div
          className="px-5 md:px-7 py-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 border-b border-[color:var(--border-subtle)]"
          style={{ background: 'var(--color-light-mint)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[color:var(--color-dark-green)]/70">
            Δ Scenario 2 vs Scenario 1
          </p>
          {Math.abs(payoffDiff) > 0.1 && (
            <span className={`text-[12px] font-bold ${payoffDiff < 0 ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--text-primary)]'}`}>
              Payoff: {payoffDiff > 0 ? '+' : ''}{payoffDiff.toFixed(1)} yrs
            </span>
          )}
          {Math.abs(costDiff) > 1000 && (
            <span className={`text-[12px] font-bold ${costDiff < 0 ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--text-primary)]'}`}>
              Total cost: {costDiff > 0 ? '+' : ''}{formatDollars(Math.abs(costDiff))} {costDiff < 0 ? 'cheaper' : 'more expensive'}
            </span>
          )}
        </div>
      )}

      {/* Side-by-side panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[color:var(--border-subtle)]">
        <ComparisonPane
          label="Scenario 1"
          inputs={scenario1Inputs}
          outputs={scenario1Outputs}
          onChange={() => {}}
          onReset={() => {}}
          onSave={() => handleSave(1)}
          saveState={save1State}
          locked
        />
        <ComparisonPane
          label="Scenario 2"
          inputs={scenario2Inputs}
          outputs={scenario2Outputs}
          onChange={handleChange2}
          onReset={handleReset2}
          onSave={() => handleSave(2)}
          saveState={save2State}
        />
      </div>
    </div>
  );
}

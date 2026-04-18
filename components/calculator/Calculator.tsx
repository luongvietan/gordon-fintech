'use client';

import { useMemo, useState } from 'react';
import {
  CalculatorInputs,
  ScenarioPreset,
  applyScenarioPreset,
  calculateOutputs,
} from '@/lib/calculator';
import CalculatorInputsForm from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';

const DEFAULT_INPUTS: CalculatorInputs = {
  totalDebt: 250000,
  interestRate: 6.5,
  loanType: 'federal',
  residencyYears: 3,
  attendingSalary: 250000,
  salaryGrowthRate: 3,
  monthlyPaymentOverride: undefined,
  pslfEnabled: false,
  livingExpensesResidency: 3000,
  livingExpensesAttending: 5500,
  taxRate: 32,
  inflationRate: 2.5,
  investmentReturn: 7,
  scenarioPreset: 'custom',
};

const PRESETS: { id: ScenarioPreset; label: string; description: string }[] = [
  { id: 'aggressive', label: 'Aggressive payoff', description: 'Pay 1.5× standard — knock it out fast' },
  { id: 'pslf-optimized', label: 'PSLF-optimized', description: '10 years of qualifying service, then forgiveness' },
  { id: 'minimum', label: 'Minimum payment', description: 'IDR floor — lowest monthly possible' },
];

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  function handleChange(updated: Partial<CalculatorInputs>) {
    setInputs((prev) => ({
      ...prev,
      ...updated,
      // user-edit outside a preset → mark as custom
      scenarioPreset:
        'scenarioPreset' in updated ? updated.scenarioPreset : 'custom',
    }));
  }

  function handlePreset(preset: ScenarioPreset) {
    setInputs((prev) => applyScenarioPreset(prev, preset));
  }

  const outputs = useMemo(() => calculateOutputs(inputs), [inputs]);
  const activePreset = inputs.scenarioPreset ?? 'custom';

  return (
    <div
      className="overflow-hidden bg-white"
      style={{
        borderRadius: 'var(--r-card-lg)',
        boxShadow: 'var(--shadow-ring), var(--shadow-float)',
      }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div className="px-5 md:px-7 py-4 md:py-5 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] bg-[color:var(--color-off-white)]">
        <div>
          <h3
            className="text-xl md:text-2xl text-[color:var(--text-primary)] tracking-[-0.015em] leading-none"
            style={{ fontWeight: 900 }}
          >
            Med School Debt Simulator
          </h3>
          <p className="text-xs md:text-sm text-[color:var(--text-secondary)] mt-1.5 font-medium">
            PSLF vs standard, net-worth crossover, specialty salary presets
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-widest bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-dark-green)] animate-pulse" />
          Live
        </div>
      </div>

      {/* ── Preset chips ─────────────────────────────────── */}
      <div className="px-5 md:px-7 py-3 md:py-4 flex flex-wrap items-center gap-2 border-b border-[color:var(--border-subtle)] bg-white">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--text-muted)] mr-1">
          Scenario
        </span>
        {PRESETS.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePreset(p.id)}
              title={p.description}
              className={`
                px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold
                transition-transform duration-200
                hover:scale-[1.04] active:scale-[0.96]
                ${active
                  ? 'bg-[color:var(--color-near-black)] text-white'
                  : 'bg-[color:var(--color-near-black)]/[0.06] text-[color:var(--color-near-black)] hover:bg-[color:var(--color-near-black)]/[0.10]'}
              `}
            >
              {p.label}
            </button>
          );
        })}
        {activePreset === 'custom' && (
          <span className="px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
            Custom
          </span>
        )}
      </div>

      {/* ── Two-column layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr]">
        {/* Inputs */}
        <div className="p-5 md:p-6 lg:border-r border-b lg:border-b-0 border-[color:var(--border-subtle)] max-h-none lg:max-h-[min(90vh,800px)] overflow-y-auto wise-scroll">
          <CalculatorInputsForm inputs={inputs} onChange={handleChange} />
        </div>

        {/* Results */}
        <div className="p-5 md:p-6 bg-[color:var(--color-off-white)] max-h-none lg:max-h-[min(90vh,800px)] overflow-y-auto wise-scroll">
          <CalculatorResults
            outputs={outputs}
            residencyYears={inputs.residencyYears}
            taxRate={inputs.taxRate}
          />
        </div>
      </div>
    </div>
  );
}

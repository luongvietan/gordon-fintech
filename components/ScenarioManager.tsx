'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  BookmarkPlus,
  Check,
  ChevronDown,
  Clock,
  FolderOpen,
  Trash2,
  X,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { formatDollars, formatYears } from '@/lib/calculator';
import type { CalculatorInputs, CalculatorOutputs } from '@/lib/calculator';
import { useScenarioStorage } from '@/hooks/useScenarioStorage';
import { encodeInputs } from '@/lib/calculator-share';
import { trackScenarioSaved, track } from '@/lib/analytics';

// Canonical defaults for building share URLs from saved scenarios.
import { RESIDENT_SALARY } from '@/lib/specialties';

const CANONICAL_DEFAULTS: CalculatorInputs = {
  totalDebt: 250000,
  actualRepaymentEnabled: false,
  currentBalance: 250000,
  pslfQualifyingPaymentsMade: 0,
  repaymentStartMonth: 1,
  repaymentStartYear: new Date().getFullYear(),
  interestRate: 6.5,
  loanType: 'federal',
  residencyYears: 3,
  fellowshipYears: 0,
  fellowshipSalary: 75000,
  residencyStartingSalary: RESIDENT_SALARY,
  attendingSalary: 250000,
  residentSalaryGrowthRate: 2,
  attendingSalaryGrowthRate: 3,
  monthlyPaymentResidencyOverride: undefined,
  monthlyPaymentOverride: undefined,
  pslfEnabled: false,
  pslfResidencyQualifies: true,
  livingExpensesResidency: 3000,
  livingExpensesAttending: 5500,
  taxRate: 32,
  inflationRate: 2.5,
  investmentReturn: 7,
  capitalizeOnlyAfterTraining: true,
  mfsExtraTaxRatePct: 2,
  taxBombRateOverride: undefined,
  scenarioPreset: 'custom',
  refinanceEnabled: false,
  refinanceRate: 4.5,
  refinanceTermYears: 10,
  refinanceOrigFeePct: 0,
  spouseEnabled: false,
  spouseIncome: 80000,
  spouseIncomeGrowthRate: 3,
  spouseDebt: 0,
  spouseRepaymentStrategy: 'standard',
  filingStatus: 'single',
  familySize: 1,
  jobChangeEnabled: false,
  jobChangeYear: 3,
  jobChangeAttendingSalary: 300000,
  jobChangePslfQualifies: false,
};

function buildOpenHref(inputs: CalculatorInputs): string {
  const encoded = encodeInputs(inputs, CANONICAL_DEFAULTS);
  return `/calculator?s=${encodeURIComponent(encoded)}`;
}

function autoName(inputs: CalculatorInputs): string {
  const debtK = Math.round(inputs.totalDebt / 1000);
  const trainingYrs = inputs.residencyYears + (inputs.fellowshipYears ?? 0);
  const strategy = inputs.pslfEnabled
    ? 'PSLF'
    : inputs.refinanceEnabled
    ? 'Refi'
    : 'Standard';
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = now.getDate();
  return `${strategy} · $${debtK}K · ${trainingYrs}y · ${month} ${day}`;
}

interface Props {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  onLoad: (inputs: CalculatorInputs) => void;
}

/**
 * My Scenarios panel + Save button for the calculator sidebar.
 *
 * Design contract:
 *  - Save prompts for a name (pre-filled with a sensible auto-name).
 *  - Panel collapses/expands to keep sidebar tidy.
 *  - Load uses the existing URL share pipeline so the calculator hydrates
 *    exactly as if the user had opened a shared link.
 *  - The existing /compare page and URL share system are untouched.
 */
export default function ScenarioManager({ inputs, outputs, onLoad }: Props) {
  const { scenarios, hydrated, saveScenario, removeScenario } =
    useScenarioStorage();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Save dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  function handleOpenSaveDialog() {
    setNameValue(autoName(inputs));
    setDialogOpen(true);
  }

  function handleSave() {
    const saved = saveScenario(inputs, outputs, nameValue.trim() || undefined);
    trackScenarioSaved({
      total: scenarios.length + 1,
      pslf_enabled: !!inputs.pslfEnabled,
      loan_type: inputs.loanType,
    });
    setSaveState('saved');
    setDialogOpen(false);
    setTimeout(() => setSaveState('idle'), 1800);
    track('scenario_saved_named', { name_length: saved.name.length });
  }

  const handleLoad = useCallback(
    (scenarioInputs: CalculatorInputs) => {
      onLoad(scenarioInputs);
      track('scenario_loaded', {});
    },
    [onLoad],
  );

  return (
    <div className="border-t border-[color:var(--border-subtle)]">
      {/* Panel header */}
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 md:px-6 lg:px-7 py-3.5 text-left hover:bg-[color:var(--color-off-white)] transition-colors"
        aria-expanded={panelOpen}
      >
        <div className="flex items-center gap-2">
          <FolderOpen
            aria-hidden="true"
            className="w-3.5 h-3.5 text-[color:var(--color-dark-green)]"
            strokeWidth={2}
          />
          <span className="text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
            My Scenarios
          </span>
          {hydrated && scenarios.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
              {scenarios.length}
            </span>
          )}
        </div>
        <ChevronDown
          aria-hidden="true"
          className={`w-3.5 h-3.5 text-[color:var(--text-muted)] transition-transform duration-200 ${panelOpen ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {panelOpen && (
        <div className="px-5 md:px-6 lg:px-7 pb-5">
          {/* Scenario list */}
          {hydrated && scenarios.length > 0 ? (
            <ul className="flex flex-col gap-2 mb-3">
              {scenarios.map((sc) => (
                <li
                  key={sc.id}
                  className="rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-3 flex flex-col gap-2"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <p className="text-[13px] font-bold text-[color:var(--color-near-black)] leading-snug truncate min-w-0">
                      {sc.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this scenario?')) {
                          removeScenario(sc.id);
                        }
                      }}
                      aria-label={`Delete scenario: ${sc.name}`}
                      className="flex-shrink-0 text-[color:var(--text-muted)] hover:text-[color:var(--color-danger)] transition-colors"
                    >
                      <Trash2 aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] font-semibold text-[color:var(--text-muted)]">
                    <Clock aria-hidden="true" className="w-2.5 h-2.5" strokeWidth={2} />
                    {new Date(sc.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    <span aria-hidden className="opacity-40">·</span>
                    {formatDollars(sc.inputs.totalDebt)}
                    <span aria-hidden className="opacity-40">·</span>
                    {sc.inputs.residencyYears + (sc.inputs.fellowshipYears ?? 0)}y training
                    {sc.inputs.pslfEnabled && (
                      <>
                        <span aria-hidden className="opacity-40">·</span>
                        <span className="text-[color:var(--color-dark-green)] font-bold">PSLF</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Link
                      href={buildOpenHref(sc.inputs)}
                      onClick={() => handleLoad(sc.inputs)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold bg-[color:var(--color-near-black)] text-white hover:bg-[color:var(--color-near-black)]/80 transition-colors"
                    >
                      Load
                    </Link>
                    <span className="text-[10.5px] font-semibold text-[color:var(--text-muted)]">
                      Payoff: {formatYears(sc.results.payoffYears)}
                    </span>
                    {sc.results.netWorthCrossoverYear != null && (
                      <span className="text-[10.5px] font-semibold text-[color:var(--color-dark-green)]">
                        Yr {sc.results.netWorthCrossoverYear} crossover
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : hydrated ? (
            <p className="text-[12px] text-[color:var(--text-muted)] font-medium mb-3">
              No saved scenarios yet. Save your current inputs to compare later.
            </p>
          ) : null}

          {/* Save button */}
          <button
            type="button"
            onClick={handleOpenSaveDialog}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--r-pill)] text-xs font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {saveState === 'saved' ? (
              <Check aria-hidden="true" className="w-3 h-3" strokeWidth={2.5} />
            ) : (
              <BookmarkPlus aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
            )}
            {saveState === 'saved' ? 'Saved!' : '+ Save current scenario'}
          </button>

          {hydrated && scenarios.length > 1 && (
            <Link
              href="/compare"
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[color:var(--color-dark-green)] hover:underline"
            >
              View all {scenarios.length} in full compare mode →
            </Link>
          )}
        </div>
      )}

      {/* Save name dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[color:var(--color-near-black)]/50 backdrop-blur-[2px]" />
          <Dialog.Content
            aria-describedby="save-scenario-desc"
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(26rem,calc(100vw-2rem))] rounded-[var(--r-card)] bg-white p-6 shadow-[var(--shadow-float)]"
          >
            <Dialog.Title
              className="text-[1.125rem] font-bold text-[color:var(--color-near-black)] tracking-[-0.01em] mb-1"
            >
              Save this scenario
            </Dialog.Title>
            <p id="save-scenario-desc" className="text-[13px] text-[color:var(--text-muted)] font-medium mb-4">
              Give it a name so you can find it later.
            </p>

            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setDialogOpen(false);
              }}
              autoFocus
              maxLength={80}
              placeholder="e.g. Derm — PSLF path"
              className="w-full rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--color-near-black)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)]"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-pill)] text-[13px] font-semibold text-[color:var(--text-muted)] hover:bg-[color:var(--color-off-white)] transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[var(--r-pill)] text-[13px] font-bold bg-[color:var(--color-near-black)] text-white hover:bg-[color:var(--color-near-black)]/85 transition-colors"
              >
                <BookmarkPlus aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
                Save
              </button>
            </div>

            <Dialog.Close
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--text-muted)] hover:bg-[color:var(--color-near-black)]/[0.06] hover:text-[color:var(--text-primary)] focus-visible:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

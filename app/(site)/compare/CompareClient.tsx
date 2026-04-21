'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { ArrowLeft, Share2, Trash2 } from 'lucide-react';
import { formatDollars, formatYears } from '@/lib/calculator';
import {
  useScenarioStorage,
  type SavedScenario,
} from '@/hooks/useScenarioStorage';
import { encodeInputs } from '@/lib/calculator-share';

/**
 * Compare-saved-scenarios view.
 *
 * Design goals:
 *   - Fast to scan: one card per scenario with the four headline KPIs.
 *   - Always let the user jump back into a scenario — "Open" button
 *     builds a ?s= URL and navigates, so the calculator hydrates with
 *     that scenario's inputs (reusing the existing share pipeline).
 *   - Inline rename + delete so we never need a separate management UI.
 *   - Never write to localStorage until the user actually does something
 *     (rename, delete, clear). Read-only on mount.
 *
 * This view never hits the network. Everything is sourced from the
 * `meddebt_scenarios` localStorage key written by `useScenarioStorage`.
 */

// A generic-enough default the share encoder can diff against. The
// calculator page will merge on top of its own defaults when loading.
import type { CalculatorInputs } from '@/lib/calculator';
import { RESIDENT_SALARY } from '@/lib/specialties';

const CANONICAL_DEFAULTS: CalculatorInputs = {
  totalDebt: 250000,
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
  // Always open the dedicated calculator route with a valid share param.
  return `/calculator?s=${encodeURIComponent(encoded)}`;
}

async function copyShareUrl(inputs: CalculatorInputs): Promise<boolean> {
  const encoded = encodeInputs(inputs, CANONICAL_DEFAULTS);
  const path = `/calculator?s=${encodeURIComponent(encoded)}`;
  const full =
    typeof window !== 'undefined'
      ? new URL(path, window.location.origin).toString()
      : path;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(full);
      return true;
    } catch {
      // Fall back below.
    }
  }

  if (typeof document !== 'undefined') {
    const ta = document.createElement('textarea');
    ta.value = full;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }

  return false;
}

export default function CompareClient() {
  const { scenarios, hydrated, renameScenario, removeScenario, clearScenarios } =
    useScenarioStorage();

  // Emit a single GA event per hydration with the number of saved
  // scenarios the user is viewing. Matches GA4 conventions (snake_case
  // event, non-PII params) and lets us gauge whether the compare page
  // is actually where users end up — ideally yes.
  const firedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || firedRef.current) return;
    firedRef.current = true;
    track('compare_viewed', { scenario_count: scenarios.length });
  }, [hydrated, scenarios.length]);

  if (!hydrated) {
    return <ComparePageShell empty="loading" />;
  }

  if (scenarios.length === 0) {
    return <ComparePageShell empty="no-saves" />;
  }

  return (
    <ComparePageShell>
      <ScenarioTable
        scenarios={scenarios}
        onRename={renameScenario}
        onRemove={removeScenario}
        onClearAll={clearScenarios}
      />
    </ComparePageShell>
  );
}

function ComparePageShell({
  children,
  empty,
}: {
  children?: React.ReactNode;
  empty?: 'loading' | 'no-saves';
}) {
  return (
    <main className="py-14 md:py-20">
      <div className="container max-w-5xl">
        <Link
          href="/calculator"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--color-near-black)] transition-colors mb-6"
        >
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
          Back to calculator
        </Link>

        <p className="eyebrow mb-4">Compare</p>
        <h1
          className="display-section text-[color:var(--color-near-black)] mb-4"
          style={{ fontWeight: 900 }}
        >
          Your saved scenarios.
        </h1>
        <p className="text-base md:text-lg text-[color:var(--text-secondary)] max-w-2xl font-medium mb-10">
          Every scenario you saved in this browser, side by side. Saved
          locally on your device &mdash; nothing ever leaves your
          machine. URL share links still work across devices; saves do not.
        </p>

        {empty === 'loading' ? (
          <div
            className="rounded-[var(--r-card)] bg-white p-10 text-center text-[color:var(--text-muted)] font-medium"
            style={{ boxShadow: 'var(--shadow-ring)' }}
          >
            Loading your scenarios&hellip;
          </div>
        ) : empty === 'no-saves' ? (
          <div
            className="rounded-[var(--r-card)] bg-white p-10 flex flex-col items-center gap-4 text-center"
            style={{ boxShadow: 'var(--shadow-ring)' }}
          >
            <p className="text-[color:var(--color-near-black)] font-bold text-lg tracking-[-0.01em]">
              No saved scenarios yet.
            </p>
            <p className="text-[color:var(--text-secondary)] max-w-md font-medium">
              Run a scenario on the calculator and hit{' '}
              <span className="font-bold text-[color:var(--color-near-black)]">
                Save scenario
              </span>{' '}
              &mdash; it&rsquo;ll show up here ready to compare.
            </p>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--r-pill)] text-sm font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform hover:scale-[1.04]"
            >
              Open the calculator
            </Link>
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}

function ScenarioTable({
  scenarios,
  onRename,
  onRemove,
  onClearAll,
}: {
  scenarios: SavedScenario[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  const metrics = useMemo(() => buildMetrics(scenarios), [scenarios]);

  return (
    <section
      className="bg-white rounded-[var(--r-card)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
    >
      <header className="px-6 md:px-8 py-4 md:py-5 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            {scenarios.length} saved
          </p>
          <h2
            className="text-[1.125rem] md:text-[1.25rem] text-[color:var(--color-near-black)] tracking-[-0.01em]"
            style={{ fontWeight: 900 }}
          >
            Side by side
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Delete every saved scenario?')) onClearAll();
          }}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[color:var(--color-danger)] hover:underline"
        >
          <Trash2 aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
          Clear all
        </button>
      </header>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto wise-scroll">
        <table className="w-full text-[13px] font-semibold min-w-[860px]">
          <thead className="bg-[color:var(--color-off-white)] text-[10px] uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
            <tr>
              <th className="text-left px-6 py-3.5 w-[28%]">Name</th>
              <th className="text-right px-3 py-3.5">Debt</th>
              <th className="text-right px-3 py-3.5">Salary</th>
              <th className="text-right px-3 py-3.5">Payoff</th>
              <th className="text-right px-3 py-3.5">Total paid</th>
              <th className="text-right px-3 py-3.5">Crossover</th>
              <th className="text-right px-6 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-subtle)]">
            {metrics.map((m) => (
              <tr
                key={m.id}
                className="text-[color:var(--text-primary)] tabular-nums hover:bg-[color:var(--color-off-white)]/60"
              >
                <td className="px-6 py-3 align-top">
                  <RenameCell
                    initial={m.name}
                    onSave={(next) => onRename(m.id, next)}
                  />
                  <p className="text-[10.5px] text-[color:var(--text-muted)] font-medium mt-0.5">
                    {new Date(m.timestamp).toLocaleString()}
                  </p>
                </td>
                <td className="text-right px-3 py-3">{formatDollars(m.debt)}</td>
                <td className="text-right px-3 py-3">{formatDollars(m.salary)}</td>
                <td className="text-right px-3 py-3">{formatYears(m.payoffYears)}</td>
                <td className="text-right px-3 py-3">{formatDollars(m.totalPaid)}</td>
                <td className="text-right px-3 py-3">
                  {m.crossover != null ? `Yr ${m.crossover}` : '\u2014'}
                </td>
                <td className="text-right px-6 py-3 whitespace-nowrap">
                  <RowActions scenario={m.scenario} onRemove={() => onRemove(m.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet: cards */}
      <div className="lg:hidden flex flex-col gap-3 p-4">
        {metrics.map((m) => (
          <article
            key={m.id}
            className="rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 flex flex-col gap-3"
          >
            <RenameCell initial={m.name} onSave={(next) => onRename(m.id, next)} />
            <p className="text-[10.5px] text-[color:var(--text-muted)] font-medium -mt-2">
              {new Date(m.timestamp).toLocaleString()}
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 tabular-nums">
              <CompareStat label="Debt" value={formatDollars(m.debt)} />
              <CompareStat label="Salary" value={formatDollars(m.salary)} />
              <CompareStat label="Payoff" value={formatYears(m.payoffYears)} />
              <CompareStat label="Total paid" value={formatDollars(m.totalPaid)} />
              <CompareStat
                label="Crossover"
                value={m.crossover != null ? `Yr ${m.crossover}` : '\u2014'}
              />
              <CompareStat label="PSLF savings" value={formatDollars(m.pslfSavings)} />
            </dl>
            <div className="flex flex-wrap gap-2 pt-1">
              <RowActions scenario={m.scenario} onRemove={() => onRemove(m.id)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function buildMetrics(scenarios: SavedScenario[]) {
  return scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    timestamp: s.timestamp,
    debt: s.inputs.totalDebt,
    salary: s.inputs.attendingSalary,
    payoffYears: s.results.payoffYears,
    totalPaid: s.results.standardTotalPaid,
    pslfSavings: s.results.pslfSavings,
    crossover: s.results.netWorthCrossoverYear,
    scenario: s,
  }));
}

function RenameCell({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft.trim() && draft.trim() !== initial) onSave(draft.trim());
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') {
            setDraft(initial);
            setEditing(false);
          }
        }}
        className="w-full text-[14px] font-bold text-[color:var(--color-near-black)] bg-transparent outline-none border-b border-[color:var(--color-near-black)]/30 focus:border-[color:var(--color-wise-green)]"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-left text-[14px] font-bold text-[color:var(--color-near-black)] hover:underline decoration-dotted"
      aria-label={`Rename scenario: ${initial}`}
    >
      {initial}
    </button>
  );
}

function RowActions({
  scenario,
  onRemove,
}: {
  scenario: SavedScenario;
  onRemove: () => void;
}) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const href = buildOpenHref(scenario.inputs);

  async function handleShare() {
    const ok = await copyShareUrl(scenario.inputs);
    setShareState(ok ? 'copied' : 'error');
    setTimeout(() => setShareState('idle'), ok ? 1600 : 2500);
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <Link
        href={href}
        onClick={() => track('scenario_opened')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-[11.5px] font-bold bg-[color:var(--color-near-black)] text-white hover:scale-[1.04] transition-transform"
      >
        Open
      </Link>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-[11.5px] font-semibold bg-white ring-1 ring-inset ring-[color:var(--border-default)] text-[color:var(--color-near-black)] hover:ring-[color:var(--border-strong)]"
        aria-label="Copy a shareable link for this scenario"
      >
        <Share2 aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
        {shareState === 'copied' ? 'Copied' : shareState === 'error' ? 'Copy failed' : 'Share'}
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Delete this scenario?')) onRemove();
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-[11.5px] font-semibold text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10"
        aria-label="Delete this scenario"
      >
        <Trash2 aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
        Delete
      </button>
    </div>
  );
}

function CompareStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
        {label}
      </dt>
      <dd
        className="text-[14px] text-[color:var(--text-primary)]"
        style={{ fontWeight: 800 }}
      >
        {value}
      </dd>
    </div>
  );
}

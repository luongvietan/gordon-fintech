'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalculatorInputs,
  CalculatorOutputs,
  ScenarioPreset,
  applyScenarioPreset,
  calculateOutputs,
} from '@/lib/calculator';
import {
  SHARE_PARAM,
  buildShareUrl,
  decodeInputs,
  encodeInputs,
} from '@/lib/calculator-share';
import CalculatorInputsForm from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';
import { RESIDENT_SALARY } from '@/lib/specialties';

// ─── Download PDF button ───────────────────────────────────
// Lazy-load jsPDF only on click so the ~150KB library stays out of the
// initial bundle. While the import resolves we show a "Preparing…" state.
type PdfState = 'idle' | 'loading' | 'error';

function DownloadPdfButton({
  inputs,
  outputs,
}: {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
}) {
  const [state, setState] = useState<PdfState>('idle');

  async function handleClick() {
    if (state === 'loading') return;
    setState('loading');
    try {
      const { downloadResultsPdf } = await import('@/lib/pdf');
      downloadResultsPdf(inputs, outputs);
      setState('idle');
    } catch (err) {
      console.error('PDF export failed', err);
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }

  const label =
    state === 'loading'
      ? 'Preparing PDF…'
      : state === 'error'
      ? 'Try again'
      : 'Download PDF';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      aria-label="Download results as PDF"
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold bg-[color:var(--color-near-black)] text-white transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-60 disabled:pointer-events-none"
    >
      {state === 'loading' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-spin" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
          <path d="M10.5 6a4.5 4.5 0 0 0-4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 1.5v6m0 0L3.5 5m2.5 2.5L8.5 5M2 9.5v.5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}

// ─── Share link button ────────────────────────────────────
// Copies a URL that encodes the current calculator inputs. Recipients who open
// the link get the same scenario loaded locally — nothing round-trips through
// a server, it's just a self-contained payload in the query string.
type ShareState = 'idle' | 'copied' | 'error';

function ShareLinkButton({
  inputs,
  defaults,
}: {
  inputs: CalculatorInputs;
  defaults: CalculatorInputs;
}) {
  const [state, setState] = useState<ShareState>('idle');

  async function handleClick() {
    try {
      const encoded = encodeInputs(inputs, defaults);
      const url = buildShareUrl(encoded);
      if (!url) throw new Error('No window available');

      let copied = false;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          copied = true;
        } catch {
          copied = false;
        }
      }

      // Fallback for older browsers / non-secure contexts where the async
      // clipboard API is unavailable or throws.
      if (!copied && typeof document !== 'undefined') {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          copied = document.execCommand('copy');
        } catch {
          copied = false;
        }
        document.body.removeChild(ta);
      }

      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', url);
      }

      if (copied) {
        setState('copied');
        setTimeout(() => setState('idle'), 1800);
      } else {
        setState('error');
        setTimeout(() => setState('idle'), 2500);
      }
    } catch (err) {
      console.error('Share link failed', err);
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }

  const label =
    state === 'copied'
      ? 'Link copied'
      : state === 'error'
      ? 'Copy failed'
      : 'Share link';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copy a shareable link to these calculator results"
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold bg-[color:var(--color-near-black)]/[0.06] text-[color:var(--color-near-black)] transition-transform duration-200 hover:scale-[1.05] hover:bg-[color:var(--color-near-black)]/[0.10] active:scale-[0.95]"
    >
      {state === 'copied' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 6.5 5 9l4.5-5.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M5 7.5 7.5 5m-3.25.25L3 6.5a2 2 0 0 0 2.83 2.83l1.25-1.25M7 4.5l1.25-1.25A2 2 0 0 1 11.08 6.08L9.83 7.33"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}

const DEFAULT_INPUTS: CalculatorInputs = {
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
  scenarioPreset: 'custom',
};

const PRESETS: { id: ScenarioPreset; label: string; description: string }[] = [
  { id: 'aggressive', label: 'Aggressive payoff', description: 'Pay 1.5× standard — knock it out fast' },
  { id: 'pslf-optimized', label: 'PSLF-optimized', description: '10 years of qualifying service, then forgiveness' },
  {
    id: 'minimum',
    label: 'Minimum payment',
    description: 'Federal: IDR-style floor; private: interest-only — lowest modeled payment',
  },
];

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  // Rehydrate from a share link once on mount. We can't read window in the
  // useState initializer because this component is SSR'd with defaults first;
  // a hash-driven effect avoids hydration mismatches.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payload = params.get(SHARE_PARAM);
    if (!payload) return;
    const decoded = decodeInputs(payload, DEFAULT_INPUTS);
    if (decoded) setInputs(decoded);
  }, []);

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
  const trainingYears =
    inputs.residencyYears + (inputs.fellowshipYears ?? 0);

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

        <div className="flex items-center gap-2">
          <ShareLinkButton inputs={inputs} defaults={DEFAULT_INPUTS} />
          <DownloadPdfButton inputs={inputs} outputs={outputs} />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-widest bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-dark-green)] animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* ── Privacy strip ────────────────────────────────── */}
      <div
        className="px-5 md:px-7 py-2.5 flex items-center gap-2.5 border-b border-[color:var(--border-subtle)]"
        style={{ background: 'var(--color-light-mint)' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-[color:var(--color-dark-green)] flex-shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-[12px] md:text-[13px] font-semibold text-[color:var(--color-dark-green)] leading-snug">
          <span className="font-bold">Your data never leaves your device.</span>{' '}
          <span className="text-[color:var(--color-dark-green)]/75">
            We don&apos;t store, track, or sell anything you type in.
          </span>
        </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="min-w-0 p-5 md:p-6 lg:border-r border-b lg:border-b-0 border-[color:var(--border-subtle)] max-h-none lg:max-h-[min(90vh,800px)] overflow-y-auto wise-scroll">
          <CalculatorInputsForm inputs={inputs} onChange={handleChange} />
        </div>

        {/* Results */}
        <div className="min-w-0 p-5 md:p-6 bg-[color:var(--color-off-white)] max-h-none lg:max-h-[min(90vh,800px)] overflow-y-auto wise-scroll">
          <CalculatorResults
            outputs={outputs}
            residencyYears={trainingYears}
            taxRate={inputs.taxRate}
          />
        </div>
      </div>
    </div>
  );
}

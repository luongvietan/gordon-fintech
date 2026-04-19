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
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--r-pill)] text-xs font-bold bg-[color:var(--color-near-black)] text-white transition-all duration-200 hover:scale-[1.04] hover:bg-[color:var(--color-near-black)]/90 active:scale-[0.96] disabled:opacity-60 disabled:pointer-events-none"
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
      : 'Share scenario';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copy a shareable link to these calculator results"
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--r-pill)] text-xs font-bold bg-white text-[color:var(--color-near-black)] ring-1 ring-inset ring-[color:var(--border-default)] transition-all duration-200 hover:scale-[1.04] hover:ring-[color:var(--border-strong)] active:scale-[0.96]"
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

interface PresetMeta {
  id: ScenarioPreset;
  label: string;
  description: string;
}

const PRESETS: PresetMeta[] = [
  { id: 'aggressive', label: 'Aggressive payoff', description: 'Pay 1.5\u00d7 standard \u2014 knock it out fast' },
  { id: 'pslf-optimized', label: 'PSLF-optimized', description: '10 years of qualifying service, then forgiveness' },
  {
    id: 'minimum',
    label: 'Minimum payment',
    description: 'Federal: IDR-style floor; private: interest-only \u2014 lowest modeled payment',
  },
];

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

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
      scenarioPreset:
        'scenarioPreset' in updated ? updated.scenarioPreset : 'custom',
    }));
  }

  function handlePreset(preset: ScenarioPreset) {
    setInputs((prev) => applyScenarioPreset(prev, preset));
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
  }

  const outputs = useMemo(() => calculateOutputs(inputs), [inputs]);
  const activePreset = inputs.scenarioPreset ?? 'custom';
  const trainingYears = inputs.residencyYears + (inputs.fellowshipYears ?? 0);

  return (
    <div
      className="overflow-hidden bg-white"
      style={{
        borderRadius: 'var(--r-card-lg)',
        boxShadow: 'var(--shadow-ring), var(--shadow-float)',
      }}
    >
      {/* ── Header bar ───────────────────────────────────── */}
      <div
        className="px-5 md:px-7 lg:px-8 py-4 md:py-5 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)]"
        style={{ background: 'var(--color-near-black)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden
            className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] flex items-center justify-center"
            style={{ fontWeight: 900 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 13.5 5.5 9 8.5 11 13 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9.5 4H13v3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3
              className="text-base md:text-lg text-white tracking-[-0.015em] leading-none"
              style={{ fontWeight: 900 }}
            >
              Med School Debt Simulator
            </h3>
            <p className="text-[12px] md:text-[13px] text-white/55 mt-1.5 font-medium">
              PSLF vs standard &middot; net-worth crossover &middot; 16 specialty presets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ShareLinkButton inputs={inputs} defaults={DEFAULT_INPUTS} />
          <DownloadPdfButton inputs={inputs} outputs={outputs} />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-widest bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-dark-green)] animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* ── Scenario chip row ────────────────────────────── */}
      <div className="px-5 md:px-7 lg:px-8 py-3 md:py-3.5 flex flex-wrap items-center gap-2 border-b border-[color:var(--border-subtle)] bg-white">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mr-2">
          Strategy
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
                px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-bold
                transition-all duration-200
                hover:scale-[1.04] active:scale-[0.96]
                ${active
                  ? 'bg-[color:var(--color-near-black)] text-white shadow-[0_4px_14px_-4px_rgba(14,15,12,0.4)]'
                  : 'bg-[color:var(--color-near-black)]/[0.06] text-[color:var(--color-near-black)] hover:bg-[color:var(--color-near-black)]/[0.10]'}
              `}
            >
              {p.label}
            </button>
          );
        })}
        {activePreset === 'custom' && (
          <span className="px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-bold bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
            Custom
          </span>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--color-near-black)] hover:bg-[color:var(--color-near-black)]/[0.05] transition-colors"
          aria-label="Reset all calculator inputs to defaults"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6a4 4 0 0 1 7-2.65L10 4.5M10 1.5V4.5h-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Reset
        </button>
      </div>

      {/* ── Privacy strip ────────────────────────────────── */}
      <div
        className="px-5 md:px-7 lg:px-8 py-2.5 flex items-center gap-2.5 border-b border-[color:var(--border-subtle)]"
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

      {/* ── Two-column dashboard ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        {/* Inputs sidebar */}
        <aside
          className="min-w-0 lg:border-r border-b lg:border-b-0 border-[color:var(--border-subtle)] bg-white"
        >
          <div
            className="px-5 md:px-6 py-5 md:py-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto wise-scroll"
            data-lenis-prevent
          >
            <CalculatorInputsForm inputs={inputs} onChange={handleChange} />
          </div>
        </aside>

        {/* Results pane */}
        <div
          className="min-w-0 px-5 md:px-7 lg:px-8 py-6 md:py-8"
          style={{ background: 'var(--color-off-white)' }}
        >
          <CalculatorResults
            outputs={outputs}
            residencyYears={trainingYears}
            taxRate={inputs.taxRate}
            pslfEnabled={inputs.pslfEnabled}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  Download,
  Link2,
  Loader2,
  Lock,
  LineChart,
  RotateCcw,
} from 'lucide-react';
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
        <Loader2 aria-hidden="true" className="w-3 h-3 animate-spin" strokeWidth={2} />
      ) : (
        <Download aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
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
        <Check aria-hidden="true" className="w-3 h-3" strokeWidth={2.5} />
      ) : (
        <Link2 aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
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

/**
 * Read shared inputs from `?s=...` lazily, on the very first render. Done
 * inside the `useState` initializer so we don't trigger an extra render
 * (which would also trip the react-hooks/set-state-in-effect rule).
 *
 * SSR-safe: returns DEFAULT_INPUTS on the server. Client picks up the URL
 * payload on its first commit. Because the encoded payload is a sparse
 * diff against DEFAULT_INPUTS, the result is identical between server +
 * client when no `?s=` param is present.
 */
function readInitialInputs(): CalculatorInputs {
  if (typeof window === 'undefined') return DEFAULT_INPUTS;
  const params = new URLSearchParams(window.location.search);
  const payload = params.get(SHARE_PARAM);
  if (!payload) return DEFAULT_INPUTS;
  return decodeInputs(payload, DEFAULT_INPUTS) ?? DEFAULT_INPUTS;
}

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(readInitialInputs);

  // P10: snapshot of the "baseline" inputs against which Quick-Toggle
  // mutations are diffed, so we can show the "Modified scenario" badge and
  // a one-click reset to baseline. The baseline tracks any deliberate user
  // change (typing in a field, choosing a preset, loading from URL) but
  // NOT changes triggered by quick-toggle buttons themselves.
  const [baselineInputs, setBaselineInputs] = useState<CalculatorInputs>(readInitialInputs);
  // True when the most recent state mutation came from a QuickToggle button.
  // Quick-toggle mutations should NOT advance the baseline.
  const [transientChange, setTransientChange] = useState(false);

  function handleChange(updated: Partial<CalculatorInputs>) {
    setInputs((prev) => {
      const next = {
        ...prev,
        ...updated,
        scenarioPreset:
          'scenarioPreset' in updated ? updated.scenarioPreset : 'custom',
      };
      if (!transientChange) {
        setBaselineInputs(next);
      }
      return next;
    });
    setTransientChange(false);
  }

  function handlePreset(preset: ScenarioPreset) {
    setInputs((prev) => {
      const next = applyScenarioPreset(prev, preset);
      setBaselineInputs(next);
      return next;
    });
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
    setBaselineInputs(DEFAULT_INPUTS);
  }

  // QuickToggles drives a transient mutation: the baseline does NOT move,
  // so the "Modified scenario" badge can appear and Reset-to-baseline works.
  function handleTransientChange(updated: Partial<CalculatorInputs>) {
    setTransientChange(true);
    setInputs((prev) => ({
      ...prev,
      ...updated,
      scenarioPreset:
        'scenarioPreset' in updated ? updated.scenarioPreset : 'custom',
    }));
  }

  function handleTransientReplace(next: CalculatorInputs) {
    setTransientChange(true);
    setInputs(next);
  }

  function handleResetToBaseline() {
    setInputs(baselineInputs);
  }

  const outputs = useMemo(() => calculateOutputs(inputs), [inputs]);
  const activePreset = inputs.scenarioPreset ?? 'custom';
  const trainingYears = inputs.residencyYears + (inputs.fellowshipYears ?? 0);

  return (
    // `overflow-clip` instead of `overflow-hidden` — both clip the rounded
    // corners visually, but `clip` does NOT establish a scroll container,
    // so position:sticky on the inputs sidebar (below) still anchors to
    // the page, not to this card. With `overflow-hidden` here, the sidebar
    // would never stick because it would think this card is its scroller.
    <div
      className="overflow-clip bg-white"
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
            <LineChart aria-hidden="true" className="w-4 h-4" strokeWidth={2} />
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
          <RotateCcw aria-hidden="true" className="w-2.5 h-2.5" strokeWidth={2} />
          Reset
        </button>
      </div>

      {/* ── Privacy strip ────────────────────────────────── */}
      <div
        className="px-5 md:px-7 lg:px-8 py-2.5 flex items-center gap-2.5 border-b border-[color:var(--border-subtle)]"
        style={{ background: 'var(--color-light-mint)' }}
      >
        <Lock
          aria-hidden="true"
          className="text-[color:var(--color-dark-green)] flex-shrink-0 w-3.5 h-3.5"
          strokeWidth={2.25}
        />
        <p className="text-[12px] md:text-[13px] font-semibold text-[color:var(--color-dark-green)] leading-snug">
          <span className="font-bold">Your data never leaves your device.</span>{' '}
          <span className="text-[color:var(--color-dark-green)]/75">
            We don&apos;t store, track, or sell anything you type in.
          </span>
        </p>
      </div>

      {/* ── Two-column dashboard ─────────────────────────── */}
      {/*
        Desktop sizing strategy:
        - sidebar settles around ~400px so inputs stay scannable but never
          dominate; results pane gets the remaining 60-70% of the canvas.
        - At 2xl we let the sidebar expand slightly (440px) so 4-up KPIs
          and side-by-side charts on the right still feel airy.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)] 2xl:grid-cols-[440px_minmax(0,1fr)] items-start">
        {/*
          Inputs sidebar — sticks to the top of the viewport on desktop so
          the user can scroll through the long results pane on the right
          while keeping their inputs always one click away. We anchor to
          `top-16` because the site header is h-16 and sticky-top-0 itself.

          - `lg:self-start` is critical: by default grid items stretch to
            the row's height, which would let the sidebar grow with the
            results column and prevent sticky from ever kicking in.
          - We intentionally do NOT cap the sidebar with `max-h` + an
            internal scrollbar. The form is short enough at typical
            viewport heights that letting it size to its content keeps
            things calm and scrollbar-free. If a user expands every
            section AND has a short laptop screen, the bottom of the
            sidebar will be hidden once it sticks; in practice the
            collapsible input sections (most are closed by default) keep
            the column well within viewport height.
        */}
        <aside
          className="min-w-0 lg:border-r border-b lg:border-b-0 border-[color:var(--border-subtle)] bg-white lg:sticky lg:top-16 lg:self-start"
        >
          <div className="px-5 md:px-6 lg:px-7 py-5 md:py-6 lg:py-7">
            <CalculatorInputsForm inputs={inputs} onChange={handleChange} />
          </div>
        </aside>

        {/* Results pane — gets generous padding on desktop so charts feel curated, not crammed. */}
        <div
          className="min-w-0 px-5 md:px-7 lg:px-9 xl:px-10 2xl:px-12 py-6 md:py-8 lg:py-9 xl:py-10"
          style={{ background: 'var(--color-off-white)' }}
        >
          <CalculatorResults
            inputs={inputs}
            defaults={DEFAULT_INPUTS}
            baselineInputs={baselineInputs}
            outputs={outputs}
            residencyYears={trainingYears}
            taxRate={inputs.taxRate}
            onChange={handleTransientChange}
            onReplace={handleTransientReplace}
            onResetToBaseline={handleResetToBaseline}
          />
        </div>
      </div>
    </div>
  );
}

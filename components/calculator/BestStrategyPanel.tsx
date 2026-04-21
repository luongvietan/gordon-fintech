'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Check,
  CircleDollarSign,
  Info,
  Link2,
  Sparkles,
  Target,
} from 'lucide-react';
import type { Recommendation } from '@/lib/recommendation';
import {
  SHARE_PARAM,
  buildShareUrl,
  encodeInputs,
} from '@/lib/calculator-share';
import type { CalculatorInputs } from '@/lib/calculator';
import DataSourceBadge from '@/components/ui/DataSourceBadge';

interface Props {
  recommendation: Recommendation;
  inputs: CalculatorInputs;
  defaults: CalculatorInputs;
}

/**
 * The verdict card. First thing the user sees in the results column.
 *
 * - Oversized verdict line (the recommended strategy).
 * - Why-this sentence pulled from the recommendation engine.
 * - Three sub-stats: timeframe, monthly range, and the one assumption to flag.
 * - Two CTAs: copy a share link, view the methodology.
 */
export default function BestStrategyPanel({ recommendation, inputs, defaults }: Props) {
  const { verdict, reason, timeframe, monthlyRange, keyAssumption, strategy } = recommendation;

  return (
    <section
      aria-label="Recommended strategy"
      className="relative rounded-[var(--r-card)] p-6 md:p-7 lg:p-9 bg-[color:var(--color-near-black)] text-white overflow-hidden"
    >
      {/* Ambient glow — purely decorative. */}
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

      <div className="relative">
        <div className="flex items-start justify-between gap-5 mb-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.25} aria-hidden />
            </span>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-wise-green)]">
              Your best strategy
            </p>
          </div>
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-[var(--r-pill)] text-[9px] font-bold uppercase tracking-[0.12em] bg-white/10 text-white/70">
            {strategy === 'pslf' ? 'PSLF path' : strategy === 'aggressive' ? 'Aggressive payoff' : 'Standard repayment'}
          </span>
        </div>

        <h3
          className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] leading-[1.0] text-white tracking-[-0.025em]"
          style={{ fontWeight: 900 }}
        >
          {verdict}.
        </h3>

        <p className="mt-4 text-[14.5px] md:text-[15.5px] text-white/72 leading-relaxed font-medium max-w-2xl">
          {reason}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <DataSourceBadge
            source="MGMA + AAMC"
            title="Salary and debt defaults pull from physician compensation and graduation-debt datasets."
            compact
          />
          <DataSourceBadge
            source="studentaid.gov"
            title="PSLF and federal repayment-path assumptions follow current federal guidance."
            compact
          />
        </div>

        {/* Three-up sub-stats */}
        <dl className="mt-7 md:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <SubStat
            icon={<Calendar className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />}
            label="Estimated timeframe"
            value={timeframe}
          />
          <SubStat
            icon={<CircleDollarSign className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />}
            label="Monthly payment range"
            value={monthlyRange}
          />
          <SubStat
            icon={<Target className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />}
            label="Key assumption"
            value={keyAssumption}
            small
          />
        </dl>

        {/* Footer row: share button + methodology link */}
        <div className="mt-6 md:mt-7 flex flex-wrap items-center gap-3 md:gap-4 pt-5 border-t border-white/10">
          <ShareLinkInlineButton inputs={inputs} defaults={defaults} />
          <Link
            href="/methodology"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-white/75 hover:text-[color:var(--color-wise-green)] transition-colors"
          >
            <Info className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
            How we chose this
            <ArrowRight className="w-3 h-3" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

interface SubStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  small?: boolean;
}

function SubStat({ icon, label, value, small = false }: SubStatProps) {
  return (
    <div className="rounded-[var(--r-card-sm)] bg-white/[0.06] px-4 py-3.5 ring-1 ring-inset ring-white/10">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 mb-1.5">
        <span aria-hidden className="text-[color:var(--color-wise-green)]">{icon}</span>
        {label}
      </div>
      <p
        className={`text-white tracking-[-0.012em] leading-snug ${
          small ? 'text-[12.5px] font-semibold text-white/85' : 'text-[15px] md:text-[16px]'
        }`}
        style={!small ? { fontWeight: 900 } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

// ── Inline share button (lime pill, prominent) ─────────────
type ShareState = 'idle' | 'copied' | 'error';

function ShareLinkInlineButton({
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
      if (!url) throw new Error('No window');

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

      setState(copied ? 'copied' : 'error');
      setTimeout(() => setState('idle'), 1800);
    } catch (err) {
      console.error('Share failed', err);
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }

  // Surface SHARE_PARAM use so devs grepping for it land here too.
  void SHARE_PARAM;

  const label =
    state === 'copied' ? 'Link copied!' : state === 'error' ? 'Copy failed' : 'Share this scenario';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-pill)] text-[12.5px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-all duration-200 hover:scale-[1.05] active:scale-[0.96]"
    >
      {state === 'copied' ? (
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
      ) : (
        <Link2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
      )}
      {label}
    </button>
  );
}

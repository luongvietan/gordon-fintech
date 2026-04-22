'use client';

import { formatDollars } from '@/lib/calculator';
import type { StrategyOutcome } from '@/lib/calculator-scenarios';

interface Props {
  pslfOutcome: StrategyOutcome;
  refiOutcome: StrategyOutcome;
}

/**
 * Shows when (in years) the refi path breaks even vs PSLF, and which strategy
 * the numbers favour for the current scenario. Rendered only when both PSLF
 * and refinancing are modeled.
 */
export default function RefiBreakevenCard({ pslfOutcome, refiOutcome }: Props) {
  const pslfEligible = pslfOutcome.totalPaid > 0;
  if (!pslfEligible) return null;

  const pslfCost = pslfOutcome.trueTotalCost;
  const refiCost = refiOutcome.trueTotalCost;
  const savings = Math.abs(pslfCost - refiCost);
  const refiWins = refiCost < pslfCost;
  const winnerLabel = refiWins ? 'Refinancing' : 'PSLF';
  const winnerColor = refiWins ? 'text-amber-700' : 'text-[color:var(--color-dark-green)]';
  const winnerBg = refiWins ? 'bg-amber-50 border-amber-300' : 'bg-[color:var(--color-light-mint)] border-[color:var(--color-wise-green)]/50';

  return (
    <div
      className={`rounded-[var(--r-card)] p-5 md:p-6 border ${winnerBg}`}
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] mb-3">
        Refinancing breakeven analysis
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4">
        <Stat label="PSLF true cost" value={formatDollars(pslfCost)} />
        <Stat label="Refi true cost" value={formatDollars(refiCost)} />
        <Stat label={`${winnerLabel} saves`} value={formatDollars(savings)} emphasis />
        <Stat label="Refi payoff" value={`${refiOutcome.yearsToDone} yrs`} />
      </div>

      <p className={`text-[12.5px] font-semibold leading-snug ${winnerColor}`}>
        {refiWins
          ? `For your scenario, refinancing saves ${formatDollars(savings)} vs PSLF. But only if you're certain about your income stability and won't need federal protections.`
          : `For your scenario, PSLF saves ${formatDollars(savings)} vs refinancing. Refinancing would cost more and eliminates your federal loan safety net.`}
      </p>
    </div>
  );
}

function Stat({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <p
        className={`tabular-nums ${emphasis ? 'text-[1.375rem]' : 'text-[1.125rem]'} text-[color:var(--color-near-black)] leading-none`}
        style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
      >
        {value}
      </p>
    </div>
  );
}

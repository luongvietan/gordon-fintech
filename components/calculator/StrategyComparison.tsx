'use client';

import { Check, Sparkles } from 'lucide-react';
import { formatDollars, formatYears } from '@/lib/calculator';
import type { StrategyComparison as StrategyComparisonData, StrategyOutcome } from '@/lib/calculator-scenarios';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import ExplainPopover from './ExplainPopover';

interface Props {
  comparison: StrategyComparisonData;
}

/**
 * Side-by-side strategy comparison.
 *
 * Desktop (≥md): proper table with one row per strategy.
 * Mobile (<md): card stack so totals stay readable in a narrow column.
 *
 * The recommended row is highlighted with a lime border, a "Recommended"
 * badge, and a slightly elevated surface — same treatment in both layouts.
 */
export default function StrategyComparison({ comparison }: Props) {
  const { strategies } = comparison;

  return (
    <section
      aria-label="Strategy comparison"
      className="bg-white rounded-[var(--r-card)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
    >
      <header className="px-6 md:px-8 pt-6 md:pt-7 pb-4">
        <p className="eyebrow mb-2">Strategy comparison</p>
        <h3
          className="text-[1.25rem] md:text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.018em] leading-[1.05]"
          style={{ fontWeight: 900 }}
        >
          All three paths, side by side.
        </h3>
        <p className="text-[13px] text-[color:var(--text-muted)] font-medium mt-2 leading-snug max-w-xl">
          Same inputs &mdash; three different repayment philosophies. The
          recommended row is the one our engine picked for your scenario.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <DataSourceBadge
            source="studentaid.gov"
            title="Federal PSLF, IDR, and forgiveness rules are modeled from studentaid.gov guidance."
            compact
          />
          <DataSourceBadge
            source="IRS guidance"
            title="True total cost and tax-bomb estimates reference current IRS treatment of loan forgiveness."
            compact
          />
        </div>
      </header>

      {/* ── Desktop table ──────────────────────────── */}
      {/*
        `overflow-x-auto` lets the table scroll horizontally inside the
        card when the viewport is narrow. The explicit `min-w-[980px]`
        baseline grows to `min-w-[1100px]` when the refi strategy is
        present, so the extra row still gets comfortable column widths
        instead of cramming numbers into tiny cells.
      */}
      <div className="hidden md:block overflow-x-auto wise-scroll border-t border-[color:var(--border-subtle)]">
        <table className={`w-full ${strategies.length >= 4 ? 'min-w-[1100px]' : 'min-w-[980px]'} text-[13px] font-semibold`}>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[24%]" />
          </colgroup>
          <thead className="bg-[color:var(--color-off-white)] text-[10px] uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
            <tr>
              <th className="text-left px-6 py-3.5">Strategy</th>
              <th className="text-right px-4 py-3.5">Total paid</th>
              <th className="text-right px-4 py-3.5">True total cost</th>
              <th className="text-right px-4 py-3.5">Time to done</th>
              <th className="text-right px-4 py-3.5 whitespace-nowrap">Monthly</th>
              <th className="text-left pl-4 pr-6 py-3.5">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-subtle)]">
            {strategies.map((s) => (
              <DesktopRow key={s.id} strategy={s} />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card stack ──────────────────────── */}
      <div className="md:hidden flex flex-col gap-3 p-5 border-t border-[color:var(--border-subtle)]">
        {strategies.map((s) => (
          <MobileCard key={s.id} strategy={s} />
        ))}
      </div>
    </section>
  );
}

function DesktopRow({ strategy }: { strategy: StrategyOutcome }) {
  const isRec = !!strategy.recommended;
  const isUnavail = strategy.id === 'pslf' && strategy.totalPaid === 0;

  return (
    <tr
      className={`
        text-[color:var(--text-primary)] tabular-nums
        ${isRec ? 'bg-[color:var(--color-light-mint)]' : ''}
        ${isUnavail ? 'opacity-55' : ''}
      `}
    >
      <td
        className={`text-left px-6 py-4 relative ${
          isRec
            ? 'before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[color:var(--color-wise-green)]'
            : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[14px] ${
              isRec ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--color-near-black)]'
            }`}
            style={{ fontWeight: 900 }}
          >
            {strategy.label}
          </span>
          {isRec && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-pill)] text-[9px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
              <Sparkles aria-hidden className="w-2.5 h-2.5" strokeWidth={2.5} />
              Recommended
            </span>
          )}
        </div>
      </td>
      <td className="text-right px-4 py-4 whitespace-nowrap">
        {isUnavail ? <span className="text-[color:var(--text-muted)]">&mdash;</span> : (
          <div className="inline-flex flex-col items-end gap-1">
            <span>{formatDollars(strategy.totalPaid)}</span>
            <ExplainPopover
              title={`${strategy.label} total paid`}
              formula="total_paid = sum(all monthly payments made before payoff/forgiveness)"
              inputsUsed={[
                { label: 'Strategy', value: strategy.label },
                { label: 'Monthly payment', value: `${formatDollars(strategy.monthlyPayment)}/mo` },
                { label: 'Years to done', value: formatYears(strategy.yearsToDone) },
                { label: 'Total paid', value: formatDollars(strategy.totalPaid) },
              ]}
              plainEnglish="This is the raw cash that leaves your bank account over the life of the strategy before any forgiveness tax or investing tradeoff is added."
            />
          </div>
        )}
      </td>
      <td className="text-right px-4 py-4 font-bold whitespace-nowrap">
        {isUnavail ? (
          <span className="text-[color:var(--text-muted)]">&mdash;</span>
        ) : (
          <div className="inline-flex flex-col items-end gap-1">
            <span title={strategy.trueCostNote}>{formatDollars(strategy.trueTotalCost)}</span>
            <ExplainPopover
              title={`${strategy.label} true total cost`}
              formula="true_total_cost = total_paid + tax_liability_at_forgiveness + opportunity_cost"
              inputsUsed={[
                { label: 'Total paid', value: formatDollars(strategy.totalPaid) },
                { label: 'Forgiveness tax', value: formatDollars(strategy.taxLiability) },
                { label: 'Opportunity cost', value: formatDollars(strategy.opportunityCost) },
                { label: 'True total cost', value: formatDollars(strategy.trueTotalCost) },
              ]}
              plainEnglish={strategy.trueCostNote}
            />
          </div>
        )}
      </td>
      <td className="text-right px-4 py-4 whitespace-nowrap">
        {isUnavail ? <span className="text-[color:var(--text-muted)]">&mdash;</span> : formatYears(strategy.yearsToDone)}
      </td>
      <td className="text-right px-4 py-4 whitespace-nowrap">
        {isUnavail ? <span className="text-[color:var(--text-muted)]">&mdash;</span> : formatDollars(strategy.monthlyPayment) + '/mo'}
      </td>
      <td className="text-left pl-4 pr-6 py-4">
        <span className={`inline-flex items-center gap-1.5 ${strategy.forgivenAmount ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--text-secondary)]'}`}>
          {strategy.forgivenAmount ? (
            <Check aria-hidden className="w-3 h-3" strokeWidth={2.5} />
          ) : null}
          {strategy.outcomeLabel}
        </span>
      </td>
    </tr>
  );
}

function MobileCard({ strategy }: { strategy: StrategyOutcome }) {
  const isRec = !!strategy.recommended;
  const isUnavail = strategy.id === 'pslf' && strategy.totalPaid === 0;

  return (
    <article
      className={`
        rounded-[var(--r-card-sm)] p-5 flex flex-col gap-3
        ${isRec
          ? 'bg-[color:var(--color-light-mint)] ring-2 ring-inset ring-[color:var(--color-wise-green)]'
          : 'bg-[color:var(--color-off-white)]'}
        ${isUnavail ? 'opacity-60' : ''}
      `}
    >
      <header className="flex items-start justify-between gap-3">
        <h4
          className={`text-[15px] tracking-[-0.012em] ${
            isRec ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--color-near-black)]'
          }`}
          style={{ fontWeight: 900 }}
        >
          {strategy.label}
        </h4>
        {isRec && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-pill)] text-[9px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
            <Sparkles aria-hidden className="w-2.5 h-2.5" strokeWidth={2.5} />
            Recommended
          </span>
        )}
      </header>

      {isUnavail ? (
        <p className="text-[12px] text-[color:var(--text-muted)] font-medium">
          {strategy.outcomeLabel}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 tabular-nums">
            <Stat label="True total cost" value={formatDollars(strategy.trueTotalCost)} emphasis />
            <Stat label="Time to done" value={formatYears(strategy.yearsToDone)} />
            <Stat label="Total paid" value={formatDollars(strategy.totalPaid)} />
            <Stat label="Monthly" value={formatDollars(strategy.monthlyPayment) + '/mo'} />
          </dl>
          <div className="flex flex-wrap gap-3 pt-1">
            <ExplainPopover
              title={`${strategy.label} total paid`}
              formula="total_paid = sum(all monthly payments made before payoff/forgiveness)"
              inputsUsed={[
                { label: 'Strategy', value: strategy.label },
                { label: 'Monthly payment', value: `${formatDollars(strategy.monthlyPayment)}/mo` },
                { label: 'Years to done', value: formatYears(strategy.yearsToDone) },
                { label: 'Total paid', value: formatDollars(strategy.totalPaid) },
              ]}
              plainEnglish="This is the raw cash paid over the life of the strategy."
            />
            <ExplainPopover
              title={`${strategy.label} true total cost`}
              formula="true_total_cost = total_paid + tax_liability_at_forgiveness + opportunity_cost"
              inputsUsed={[
                { label: 'Total paid', value: formatDollars(strategy.totalPaid) },
                { label: 'Forgiveness tax', value: formatDollars(strategy.taxLiability) },
                { label: 'Opportunity cost', value: formatDollars(strategy.opportunityCost) },
                { label: 'True total cost', value: formatDollars(strategy.trueTotalCost) },
              ]}
              plainEnglish={strategy.trueCostNote}
            />
          </div>
          <p
            className={`text-[12px] font-semibold leading-snug ${
              strategy.forgivenAmount ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--text-secondary)]'
            }`}
          >
            {strategy.outcomeLabel}
          </p>
        </>
      )}
    </article>
  );
}

function Stat({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
        {label}
      </dt>
      <dd
        className={`${
          emphasis ? 'text-[1.125rem] text-[color:var(--color-near-black)]' : 'text-[14px] text-[color:var(--text-primary)]'
        }`}
        style={{ fontWeight: emphasis ? 900 : 700 }}
      >
        {value}
      </dd>
    </div>
  );
}

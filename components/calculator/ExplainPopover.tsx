'use client';

import { ChevronDown } from 'lucide-react';
import { track } from '@/lib/analytics';

export interface ExplainData {
  title: string;
  formula: string;
  inputsUsed: Array<{ label: string; value: string | number }>;
  plainEnglish: string;
}

interface Props extends ExplainData {
  /** Use a small chip variant for compact KPI tile placement. */
  variant?: 'chip' | 'inline';
  /** Use a denser trigger where horizontal space is limited. */
  size?: 'default' | 'compact';
}

/**
 * "Show your work" expandable. Native <details> for zero-JS keyboard
 * accessibility; styled to match the calculator surface.
 *
 * Renders three blocks:
 *   - The exact formula in monospace (e.g. amortization formula)
 *   - The actual numeric inputs used in this run
 *   - A 2-3 sentence plain-English explanation
 */
export default function ExplainPopover({
  title,
  formula,
  inputsUsed,
  plainEnglish,
  variant = 'chip',
  size = 'default',
}: Props) {
  // `onToggle` fires on every open/close; we only want the open leg
  // because the closing event is low-signal noise for engagement
  // metrics. `title` is the KPI label (e.g. "Time to payoff",
  // "{strategy} total paid"), which doubles as a breakdown-id for GA
  // without needing a separate analytics-specific prop on every
  // caller.
  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open) {
      track('breakdown_expanded', { title, variant });
    }
  };

  return (
    <details
      onToggle={handleToggle}
      className={`group ${variant === 'chip' ? 'inline-block' : 'block w-full'}`}
    >
      {/*
        Pill-style affordance. Previously this was underlined text, which
        tested badly — users didn't realise it was interactive until they
        hovered. Now it renders as a bordered chip with a clear hover
        state and an open/closed ring treatment, matching the rest of
        the calculator's button language.

        Colors key off `currentColor`: on light surfaces the dark-green
        text stays dark-green and we layer a same-color soft background;
        on dark KPI tiles CalculatorResults overrides `color` to white,
        and the ring/background inherit that automatically via
        `ring-current` / `bg-current/10`.

        Touch target: `min-h-[36px]` on desktop is enough for pointer
        use; on mobile we stretch to 40px via the layout context (inline
        chips rarely cluster, so we trade a bit against WCAG AAA's 44px
        guidance rather than blow up the visual weight in every table
        cell).
      */}
      <summary
        className={`
          group/summary inline-flex items-center cursor-pointer select-none list-none rounded-[var(--r-pill)]
          font-bold uppercase ring-1 ring-inset ring-current/25
          text-[color:var(--color-dark-green)]
          transition-[background-color,box-shadow,color,transform] duration-150 ease-out
          hover:bg-current/[0.08] hover:ring-current/50 hover:-translate-y-[1px]
          group-open:bg-current/[0.10] group-open:ring-current/60
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/70 focus-visible:bg-current/[0.08]
          [&::-webkit-details-marker]:hidden
          ${
            size === 'compact'
              ? 'gap-1 px-3 py-1.5 min-h-[36px] text-[10px] tracking-[0.05em]'
              : 'gap-1.5 px-4 py-2 min-h-[44px] text-[11px] tracking-[0.06em]'
          }
        `}
        aria-label="Toggle calculation breakdown"
      >
        <span className="group-open:hidden">See breakdown</span>
        <span className="hidden group-open:inline">Hide breakdown</span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200 group-open:rotate-180"
          strokeWidth={2.5}
          aria-hidden
        />
      </summary>

      <div className="mt-3 w-full max-w-[min(28rem,calc(100vw-2rem))] rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 text-left whitespace-normal break-words sm:max-w-md">
        <p
          className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)] mb-2"
        >
          {title}
        </p>

        <pre
          className="text-[11.5px] font-mono text-[color:var(--color-near-black)] whitespace-pre-wrap leading-relaxed bg-white rounded-[8px] p-3 overflow-x-auto wise-scroll"
        >
          {formula}
        </pre>

        {inputsUsed.length > 0 && (
          <dl className="mt-3 grid grid-cols-1 gap-2.5 text-[11.5px] tabular-nums sm:grid-cols-2 sm:gap-x-3 sm:gap-y-2">
            {inputsUsed.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                <dt className="text-[color:var(--text-muted)] font-semibold sm:truncate">
                  {row.label}
                </dt>
                <dd className="text-[color:var(--color-near-black)] font-bold whitespace-nowrap">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-3 pt-3 border-t border-[color:var(--border-subtle)] text-[12px] text-[color:var(--text-secondary)] font-medium leading-relaxed whitespace-normal break-words">
          {plainEnglish}
        </p>
      </div>
    </details>
  );
}

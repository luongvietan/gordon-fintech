'use client';

import { ChevronDown } from 'lucide-react';

export interface ExplainData {
  title: string;
  formula: string;
  inputsUsed: Array<{ label: string; value: string | number }>;
  plainEnglish: string;
}

interface Props extends ExplainData {
  /** Use a small chip variant for compact KPI tile placement. */
  variant?: 'chip' | 'inline';
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
}: Props) {
  return (
    <details
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
          group/summary inline-flex items-center gap-1.5 cursor-pointer select-none list-none
          px-3 py-1.5 min-h-[32px] md:min-h-[32px]
          text-[11px] font-bold uppercase tracking-[0.06em]
          text-[color:var(--color-dark-green)]
          rounded-[var(--r-pill)]
          ring-1 ring-inset ring-current/25
          transition-[background-color,box-shadow,color] duration-150 ease-out
          hover:bg-current/[0.08] hover:ring-current/50
          group-open:bg-current/[0.10] group-open:ring-current/60
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/70
          [&::-webkit-details-marker]:hidden
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

      <div className="mt-3 rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 text-left max-w-md">
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
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px] tabular-nums">
            {inputsUsed.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-2">
                <dt className="text-[color:var(--text-muted)] font-semibold truncate">
                  {row.label}
                </dt>
                <dd className="text-[color:var(--color-near-black)] font-bold whitespace-nowrap">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-3 pt-3 border-t border-[color:var(--border-subtle)] text-[12px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
          {plainEnglish}
        </p>
      </div>
    </details>
  );
}

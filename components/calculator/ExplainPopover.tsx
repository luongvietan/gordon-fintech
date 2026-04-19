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
      <summary
        className={`
          inline-flex items-center gap-1 cursor-pointer select-none list-none
          text-[10.5px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]
          hover:text-[color:var(--color-near-black)] transition-colors
          [&::-webkit-details-marker]:hidden
        `}
      >
        Show your work
        <ChevronDown
          className="w-2.5 h-2.5 transition-transform duration-200 group-open:rotate-180"
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

'use client';

import { useState, useId, type ReactNode } from 'react';

interface Props {
  /** Tiny step number rendered in the section header. */
  step: number;
  /** Plain-language section title. */
  title: string;
  /** Short helper line shown next to the title when collapsed. */
  hint?: string;
  /** When provided, an icon glyph rendered in the header. */
  icon?: ReactNode;
  /** Default-open state. First section should usually be open. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Collapsible input section used to group calculator fields into the
 * scannable Career / Loans / Living / Tax & invest / Strategy groups
 * called out in the design brief.
 *
 * Accessibility:
 *   - The header is a real <button> with `aria-expanded`.
 *   - Content gets a generated id linked via `aria-controls`.
 *   - Collapsed sections render `display: none` so keyboard tab order
 *     skips the hidden inputs naturally.
 */
export default function InputSection({
  step,
  title,
  hint,
  icon,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="rounded-[var(--r-card-sm)] bg-white" style={{ boxShadow: 'var(--shadow-ring)' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center gap-3 text-left px-4 py-3.5
          rounded-[var(--r-card-sm)]
          transition-colors duration-150
          hover:bg-[color:var(--color-near-black)]/[0.025]
          focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]
        `}
      >
        <span
          aria-hidden
          className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]"
        >
          {icon ?? (
            <span className="text-[11px] font-black tabular-nums">{String(step).padStart(2, '0')}</span>
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            Step {String(step).padStart(2, '0')}
          </span>
          <span className="block text-[14px] font-bold text-[color:var(--color-near-black)] leading-tight tracking-[-0.005em] mt-0.5">
            {title}
            {hint && !open && (
              <span className="ml-2 text-[12.5px] font-medium text-[color:var(--text-muted)]">
                {hint}
              </span>
            )}
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className={`flex-shrink-0 text-[color:var(--text-muted)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M3.5 5.25 7 8.75l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        id={contentId}
        className={open ? 'block px-4 pb-5 pt-1' : 'hidden'}
      >
        <div className="flex flex-col gap-3.5">{children}</div>
      </div>
    </section>
  );
}

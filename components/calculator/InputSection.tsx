'use client';

import { useState, useId, type ReactNode, type Ref } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  /**
   * Tiny step number rendered as a fallback when no `icon` is provided.
   * Kept in the props for back-compat — the visible header now leads
   * with the icon, not the step number, so most call sites pass an icon.
   */
  step: number;
  /** Plain-language section title. */
  title: string;
  /** Short helper line shown next to the title when collapsed. */
  hint?: string;
  /** When provided, an icon glyph rendered in the header. */
  icon?: ReactNode;
  /** Default-open state. First section should usually be open. */
  defaultOpen?: boolean;
  /**
   * Optional ref attached to the outer `<section>`. Used by the
   * Expert-Mode unlock animation to scroll the first revealed section
   * into view and to apply a 1s left-border pulse highlight.
   */
  sectionRef?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * Collapsible input section used to group calculator fields into the
 * scannable Career / Loans / Living / Tax & invest / Strategy groups
 * called out in the design brief.
 *
 * The header is intentionally minimal — icon + title + a quiet
 * one-line summary when collapsed. We dropped the redundant "Step 0X"
 * eyebrow because every section already shows its icon, and the
 * eyebrow was creating two stacked labels that competed for attention.
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
  sectionRef,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section
      ref={sectionRef}
      className={`rounded-[var(--r-card-sm)] bg-white transition-shadow duration-150 ${
        open ? 'ring-1 ring-inset ring-[color:var(--border-default)]' : ''
      }`}
      style={{ boxShadow: open ? 'none' : 'var(--shadow-ring)' }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center gap-3 text-left px-4 py-3
          rounded-[var(--r-card-sm)]
          transition-colors duration-150
          hover:bg-[color:var(--color-near-black)]/[0.025]
          focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]
        `}
      >
        <span
          aria-hidden
          className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-[10px] transition-colors ${
            open
              ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
              : 'bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]'
          }`}
        >
          {icon ?? (
            <span className="text-[11px] font-black tabular-nums">
              {String(step).padStart(2, '0')}
            </span>
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold text-[color:var(--color-near-black)] leading-tight tracking-[-0.005em]">
            {title}
          </span>
          {hint && !open && (
            <span className="block text-[12px] font-medium text-[color:var(--text-muted)] leading-snug mt-0.5 truncate">
              {hint}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`flex-shrink-0 w-3.5 h-3.5 text-[color:var(--text-muted)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2}
        />
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

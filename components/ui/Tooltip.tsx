'use client';

import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import {
  TOOLTIP_DEFINITIONS,
  type TooltipKey,
} from '@/lib/tooltip-definitions';

interface Props {
  /** Key into `TOOLTIP_DEFINITIONS`. Keeps copy centralized and typo-proof. */
  termKey: TooltipKey;
  /**
   * Visual weight of the Info trigger. `sm` (default) is sized for
   * inline table headers / labels; `xs` is for dense contexts next to
   * tiny eyebrow text.
   */
  size?: 'xs' | 'sm';
  /** Optional override label for a11y — defaults to "Learn more about <term>". */
  ariaLabel?: string;
}

/**
 * Compact glossary tooltip for jargon like "True total cost" or
 * "Net-worth crossover". Deliberately smaller + lighter-weight than
 * `ExplainPopover` (which owns long-form calculation breakdowns with
 * formulas + input-value tables).
 *
 * Hybrid surface — matches the `ExplainPopover` pattern so mobile users
 * get a predictable, reachable affordance:
 *   • Desktop (≥ md): Radix Popover, hover OR click to open. Rendered in
 *     a portal so it never pushes table cells around.
 *   • Mobile  (< md): Radix Dialog bottom sheet with an explicit close
 *     button. Pure-hover tooltips aren't reachable on touch devices.
 *
 * Color inherits `currentColor`, so the trigger picks up light text on
 * dark KPI tiles automatically (see CalculatorResults' dark-tone card).
 */
export default function Tooltip({ termKey, size = 'sm', ariaLabel }: Props) {
  const entry = TOOLTIP_DEFINITIONS[termKey];
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const iconSize = size === 'xs' ? 12 : 14;
  // Match the KPI-tile / header label baseline by sitting slightly above
  // it — `align-middle` isn't enough because the Info icon is visually
  // heavier than the lowercase glyph next to it.
  const triggerClasses = `
    inline-flex items-center justify-center align-middle
    text-[color:var(--color-dark-green)] hover:text-[color:var(--color-near-black)]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-dark-green)]/60
    focus-visible:rounded-full transition-colors
    ml-1 -translate-y-[1px]
  `;

  const trigger = (
    <button
      type="button"
      aria-label={ariaLabel ?? `Learn more about ${entry.term}`}
      aria-haspopup="dialog"
      className={triggerClasses}
    >
      <Info aria-hidden width={iconSize} height={iconSize} strokeWidth={2.25} />
    </button>
  );

  const body = (
    <div className="max-w-[260px]">
      <p className="text-[12px] font-bold text-[color:var(--color-near-black)] mb-1.5 leading-snug">
        {entry.term}
      </p>
      <p className="text-[12px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
        {entry.definition}
      </p>
    </div>
  );

  if (isDesktop) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          asChild
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {trigger}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={6}
            collisionPadding={16}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerEnter={() => setOpen(true)}
            onPointerLeave={() => setOpen(false)}
            className="
              z-50 rounded-[var(--r-card-sm)] bg-white p-3
              shadow-[var(--shadow-ring),var(--shadow-float)]
              outline-none
            "
          >
            {body}
            <Popover.Arrow className="fill-white" width={10} height={5} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[color:var(--color-near-black)]/40 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="
            fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto
            rounded-t-[var(--r-card)] bg-white
            px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]
            shadow-[var(--shadow-float)]
          "
        >
          <div
            aria-hidden
            className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--border-subtle)]"
          />
          <Dialog.Title className="sr-only">{entry.term}</Dialog.Title>
          <Dialog.Close
            aria-label="Close definition"
            className="
              absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center
              rounded-full text-[color:var(--text-muted)]
              hover:bg-[color:var(--color-near-black)]/[0.06] hover:text-[color:var(--text-primary)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-dark-green)]/60
            "
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </Dialog.Close>
          <p className="text-[14px] font-black text-[color:var(--color-near-black)] mb-2 leading-snug">
            {entry.term}
          </p>
          <p className="text-[13px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
            {entry.definition}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Track whether the viewport currently meets the `md` breakpoint (768px,
 * matching Tailwind's default). Mirrors the approach used by
 * ExplainPopover so both hybrid surfaces behave identically — SSR
 * defaults to desktop so the Popover markup is emitted server-side, and
 * the hook corrects after hydration.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

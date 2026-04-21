'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { track } from '@/lib/analytics';

export interface ExplainData {
  title: string;
  formula: string;
  inputsUsed: Array<{ label: string; value: string | number }>;
  plainEnglish: string;
}

interface Props extends ExplainData {
  /** Reserved for analytics; kept for caller compatibility. */
  variant?: 'chip' | 'inline';
  /** Use a denser trigger where horizontal space is limited. */
  size?: 'default' | 'compact';
}

/**
 * "Show your work" breakdown trigger.
 *
 * Hybrid surface:
 *   - Desktop (≥ md): Radix Popover floats via portal, so the breakdown
 *     never kicks table cells or KPI cards around.
 *   - Mobile  (< md): Radix Dialog rendered as a bottom sheet, which
 *     gives long-form content room without the popover overflowing a
 *     narrow viewport.
 *
 * The trigger still uses `currentColor` for its ring/background so dark
 * KPI tiles can flip it to white by overriding `color` on an ancestor
 * (see CalculatorResults.tsx).
 */
export default function ExplainPopover({
  title,
  formula,
  inputsUsed,
  plainEnglish,
  variant = 'chip',
  size = 'default',
}: Props) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // Only fire analytics on open; close events are low-signal noise.
  // `title` doubles as a breakdown id in GA so we don't need an extra
  // prop on every caller.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      track('breakdown_expanded', {
        title,
        variant,
        surface: isDesktop ? 'popover' : 'sheet',
      });
    }
  };

  const triggerSizing =
    size === 'compact'
      ? 'gap-1 px-3 py-1.5 min-h-[36px] text-[10px] tracking-[0.05em]'
      : 'gap-1.5 px-4 py-2 min-h-[44px] text-[11px] tracking-[0.06em]';

  const trigger = (
    <button
      type="button"
      aria-label="Show calculation breakdown"
      aria-haspopup="dialog"
      className={`
        group/trigger inline-flex items-center cursor-pointer select-none rounded-[var(--r-pill)]
        font-bold uppercase ring-1 ring-inset ring-current/25
        text-[color:var(--color-dark-green)]
        transition-[background-color,box-shadow,color,transform] duration-150 ease-out
        hover:bg-current/[0.08] hover:ring-current/50 hover:-translate-y-[1px]
        data-[state=open]:bg-current/[0.10] data-[state=open]:ring-current/60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/70 focus-visible:bg-current/[0.08]
        ${triggerSizing}
      `}
    >
      <span>{open ? 'Hide breakdown' : 'See breakdown'}</span>
      <ChevronDown
        className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        strokeWidth={2.5}
        aria-hidden
      />
    </button>
  );

  const body = <BreakdownBody title={title} formula={formula} inputsUsed={inputsUsed} plainEnglish={plainEnglish} />;

  if (isDesktop) {
    return (
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={8}
            collisionPadding={16}
            className="
              explain-popover-content
              z-50 w-[min(28rem,calc(100vw-2rem))] max-h-[min(70vh,32rem)] overflow-y-auto wise-scroll
              rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4
              text-left text-[color:var(--text-primary)] whitespace-normal break-words
              shadow-[var(--shadow-ring),var(--shadow-float)]
              outline-none
            "
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {body}
            <Popover.Arrow className="fill-[color:var(--color-off-white)]" width={12} height={6} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="
            explain-sheet-overlay
            fixed inset-0 z-40 bg-[color:var(--color-near-black)]/40 backdrop-blur-[2px]
          "
        />
        <Dialog.Content
          aria-describedby={undefined}
          className="
            explain-sheet-content
            fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto wise-scroll
            rounded-t-[var(--r-card)] bg-[color:var(--color-off-white)]
            px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]
            text-left text-[color:var(--text-primary)]
            shadow-[var(--shadow-float)]
          "
        >
          <div
            aria-hidden
            className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--border-subtle)]"
          />
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Close
            aria-label="Close breakdown"
            className="
              absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center
              rounded-full text-[color:var(--text-muted)]
              hover:bg-[color:var(--color-near-black)]/[0.06] hover:text-[color:var(--text-primary)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-dark-green)]/60
            "
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </Dialog.Close>
          {body}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BreakdownBody({ title, formula, inputsUsed, plainEnglish }: ExplainData) {
  return (
    <>
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)] mb-2">
        {title}
      </p>

      <pre className="text-[11.5px] font-mono text-[color:var(--color-near-black)] whitespace-pre-wrap leading-relaxed bg-white rounded-[8px] p-3 overflow-x-auto wise-scroll">
        {formula}
      </pre>

      {inputsUsed.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-2.5 text-[11.5px] tabular-nums sm:grid-cols-2 sm:gap-x-3 sm:gap-y-2">
          {inputsUsed.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2"
            >
              <dt className="text-[color:var(--text-muted)] font-semibold sm:truncate">{row.label}</dt>
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
    </>
  );
}

/**
 * Track whether the viewport currently meets the `md` breakpoint (768px,
 * matching Tailwind's default). SSR / first-paint defaults to `true` so
 * the desktop popover markup is emitted server-side; the hook corrects
 * on mount. This is a conscious trade-off: mobile users see a brief
 * popover tree before hydration swaps it for a sheet — acceptable
 * because the trigger is identical in both and nothing is open yet.
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

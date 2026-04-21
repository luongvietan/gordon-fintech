/**
 * Thin wrapper around Google Analytics 4 (GA4) custom events.
 *
 * The `<GoogleAnalytics>` component in `app/layout.tsx` attaches the
 * gtag.js loader when `NEXT_PUBLIC_GA_ID` is set. This helper is the
 * one and only place we call `window.gtag('event', …)`, so adding a
 * new event = one `track('foo', …)` call at the feature site.
 *
 * Guardrails:
 *   • No-ops on the server (callable from RSC without crashing)
 *   • No-ops when GA isn't loaded (dev, AdBlock, no env var)
 *   • Never throws — analytics should never break the app
 *   • Payloads are PII-free: no free-text fields, only enumerated
 *     action names, booleans, and rounded dollar buckets
 *
 * Privacy: we deliberately do NOT log raw debt, salary, or income.
 * A user comparing "my $450K med-school debt at $280K peds salary"
 * shouldn't have those exact figures land in Google Analytics. When
 * amounts matter for funnel analysis, we bucket them (e.g. "200-300K").
 */

type Gtag = (command: 'event', action: string, params?: Record<string, unknown>) => void;

function getGtag(): Gtag | null {
  if (typeof window === 'undefined') return null;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof g === 'function' ? g : null;
}

/**
 * Bucket a raw dollar amount into a coarse range label.
 * Keeps analytics useful without leaking individual debt figures.
 */
export function bucketDollars(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return 'zero';
  if (n < 50_000) return '<50K';
  if (n < 100_000) return '50-100K';
  if (n < 200_000) return '100-200K';
  if (n < 300_000) return '200-300K';
  if (n < 400_000) return '300-400K';
  if (n < 500_000) return '400-500K';
  if (n < 750_000) return '500-750K';
  if (n < 1_000_000) return '750K-1M';
  return '1M+';
}

/**
 * Fire a GA4 event. Silently does nothing if GA isn't on the page.
 * Errors are caught so a bad dataLayer doesn't break user flows.
 */
export function track(
  action: AnalyticsEvent,
  params?: Record<string, unknown>,
): void {
  const gtag = getGtag();
  if (!gtag) return;
  try {
    gtag('event', action, params ?? {});
  } catch {
    // Swallowed on purpose — analytics is never worth a crash.
  }
}

/**
 * Allowed event names. Keeping them enumerated stops typos and makes
 * it obvious what the calculator emits when reviewing a dashboard.
 */
export type AnalyticsEvent =
  | 'calculator_input_changed'
  | 'specialty_selected'
  | 'preset_selected'
  | 'pslf_toggled'
  | 'spouse_toggled'
  | 'refi_toggled'
  | 'jobchange_toggled'
  | 'share_link_copied'
  | 'pdf_downloaded'
  | 'scenario_saved'
  | 'scenario_opened'
  | 'compare_viewed'
  | 'specialty_page_viewed';

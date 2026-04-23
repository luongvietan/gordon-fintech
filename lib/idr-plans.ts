/**
 * Income-Driven Repayment plan catalog.
 *
 * Each preset captures the three parameters that actually move the math
 * the rest of the calculator cares about:
 *
 *   - `paymentPct`     — fraction of discretionary income paid monthly.
 *   - `forgivenessYears` — horizon after which the remaining balance is
 *     written off (and, for non-PSLF paths, becomes the IDR tax-bomb).
 *   - `fplMultiplier`  — discretionary income floor expressed as a
 *     percentage of the federal poverty line (e.g. `1.5` = 150% FPL).
 *     SAVE shelters more income by using 225% FPL, ICR uses only 100%.
 *
 * This is deliberately a simplification of the real federal rules —
 * payment caps at the standard 10-year amount (PAYE / IBR) and SAVE's
 * undergrad/graduate weighting are NOT modeled. Medical school loans
 * are almost entirely graduate debt, and the cap only binds at very
 * high incomes, so we surface those caveats in the UI rather than
 * pretending the model handles them perfectly. See `plan.caveats` for
 * the user-facing disclosure copy.
 *
 * References:
 *   - https://studentaid.gov/manage-loans/repayment/plans/income-driven
 *   - https://www.govinfo.gov/content/pkg/FR-2023-07-10/pdf/2023-14044.pdf (SAVE final rule)
 */

export type IdrPlanId = 'save' | 'paye' | 'ibr-new' | 'ibr-old' | 'icr';

export interface IdrPlan {
  id: IdrPlanId;
  /** Short display name used in the dropdown. */
  label: string;
  /** One-line summary shown as the option subtitle. */
  summary: string;
  /** Fraction of discretionary income paid per year (0.10 = 10%). */
  paymentPct: number;
  /** Years until remaining balance is forgiven. */
  forgivenessYears: 20 | 25;
  /** Discretionary-income floor as a multiple of the federal poverty line. */
  fplMultiplier: number;
  /** User-facing notes about modeling simplifications for this plan. */
  caveats?: string;
}

/**
 * Ordered for the dropdown — highest-traffic plans first (SAVE is
 * legally contested but still the default most med grads encounter),
 * then PAYE / IBR (new), then the grandfathered variants.
 */
export const IDR_PLANS: readonly IdrPlan[] = [
  {
    id: 'save',
    label: 'SAVE',
    summary: '10% of discretionary · 25y forgiveness · 225% FPL floor',
    paymentPct: 0.10,
    forgivenessYears: 25,
    fplMultiplier: 2.25,
    caveats:
      'SAVE is in legal limbo (July 2024 injunction). We model it at its pre-injunction terms for borrowers with graduate debt; undergraduate/graduate weighted payments are not modeled.',
  },
  {
    id: 'paye',
    label: 'PAYE',
    summary: '10% of discretionary · 20y forgiveness · 150% FPL floor',
    paymentPct: 0.10,
    forgivenessYears: 20,
    fplMultiplier: 1.5,
    caveats:
      'PAYE caps monthly payments at the standard 10-year amount. The model does not enforce this cap — it only binds at very high incomes combined with low balances.',
  },
  {
    id: 'ibr-new',
    label: 'IBR (2014+)',
    summary: '10% of discretionary · 20y forgiveness · 150% FPL floor',
    paymentPct: 0.10,
    forgivenessYears: 20,
    fplMultiplier: 1.5,
    caveats:
      'Available to borrowers with no federal loans before July 2014. Payments are capped at the standard 10-year amount (not modeled).',
  },
  {
    id: 'ibr-old',
    label: 'IBR (pre-2014)',
    summary: '15% of discretionary · 25y forgiveness · 150% FPL floor',
    paymentPct: 0.15,
    forgivenessYears: 25,
    fplMultiplier: 1.5,
    caveats:
      'Grandfathered plan for pre-July-2014 borrowers. Payments are capped at the standard 10-year amount (not modeled).',
  },
  {
    id: 'icr',
    label: 'ICR',
    summary: '20% of discretionary · 25y forgiveness · 100% FPL floor',
    paymentPct: 0.20,
    forgivenessYears: 25,
    fplMultiplier: 1.0,
    caveats:
      'Income-Contingent Repayment uses the lesser of 20% of discretionary income or a 12-year amortization adjusted for income. We model the 20% rule only — the amortization cap is not enforced.',
  },
] as const;

export const DEFAULT_IDR_PLAN: IdrPlanId = 'save';

export function getIdrPlan(id: IdrPlanId | undefined | null): IdrPlan {
  if (!id) return IDR_PLANS[0];
  return IDR_PLANS.find((p) => p.id === id) ?? IDR_PLANS[0];
}

/**
 * Resolve the active plan for a calculator input set. Supports three
 * input shapes for backward compat with scenarios saved or shared
 * before the `idrPlan` field existed:
 *
 *   1. Explicit `idrPlan` enum — use it directly.
 *   2. Legacy numeric `idrPaymentPct` (0.10 / 0.15) — map to the
 *      equivalent plan (SAVE for 10%, IBR-old for 15%).
 *   3. Neither — fall back to SAVE.
 */
export function resolveIdrPlan(options: {
  idrPlan?: IdrPlanId;
  idrPaymentPct?: number;
}): IdrPlan {
  if (options.idrPlan) return getIdrPlan(options.idrPlan);
  if (typeof options.idrPaymentPct === 'number') {
    // 0.15 → legacy IBR-old; everything else → default SAVE (10%).
    if (Math.abs(options.idrPaymentPct - 0.15) < 0.005) return getIdrPlan('ibr-old');
    if (Math.abs(options.idrPaymentPct - 0.20) < 0.005) return getIdrPlan('icr');
  }
  return getIdrPlan(DEFAULT_IDR_PLAN);
}

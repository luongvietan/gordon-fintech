/**
 * Contextual risk + assumption flags surfaced in the results section.
 *
 * These are NOT blocking alerts; they're small info cards that sharpen
 * the user's understanding of what their inputs imply (e.g. "PSLF needs
 * 120 qualifying payments at a non-profit"). Each rule is intentionally
 * narrow — too many flags becomes noise.
 */

import type { CalculatorInputs, CalculatorOutputs } from './calculator';

export type FlagTone = 'info' | 'warning';

export interface RiskFlag {
  id: string;
  tone: FlagTone;
  title: string;
  body: string;
}

/**
 * Compute the set of contextual flags appropriate for the given inputs +
 * computed outputs. Order matters — the highest-value flags appear first.
 *
 * `outputs` is currently unused but accepted so future rules can flag,
 * e.g., negative net-worth horizons or below-floor IDR payments without
 * a breaking signature change.
 */
export function getRiskFlags(
  inputs: CalculatorInputs,
  outputs: CalculatorOutputs,
): RiskFlag[] {
  void outputs;
  const flags: RiskFlag[] = [];

  if (inputs.pslfEnabled && inputs.loanType === 'federal') {
    flags.push({
      id: 'pslf-enabled',
      tone: 'info',
      title: 'PSLF requires 120 qualifying payments',
      body:
        'Your employer must be a 501(c)(3) non-profit or government agency for every one of those 120 months. Job changes can reset eligibility \u2014 see the disruption-scenario panel below to model that risk.',
    });
  }

  if (inputs.loanType === 'private') {
    flags.push({
      id: 'private-loans',
      tone: 'warning',
      title: 'Private loans are not eligible for PSLF or federal IDR',
      body:
        'You also lose access to federal forbearance, forgiveness, and disability discharge. Refinancing federal \u2192 private is a one-way door.',
    });
  }

  if (inputs.attendingSalary > 400_000) {
    flags.push({
      id: 'high-income-idr',
      tone: 'info',
      title: 'High income may shrink the PSLF advantage',
      body:
        'At your projected attending salary, IDR payments often equal or exceed standard 10-year amortization \u2014 PSLF still works mechanically, but the dollar savings shrink. Run the comparison above to see the exact gap.',
    });
  }

  if (inputs.residencyYears + (inputs.fellowshipYears ?? 0) >= 5) {
    flags.push({
      id: 'long-residency',
      tone: 'info',
      title: 'Longer training improves PSLF\u2019s relative value',
      body:
        'More qualifying training years means more low-income IDR payments counting toward the 120-month threshold \u2014 every extra residency or fellowship year tilts the math further in PSLF\u2019s favor.',
    });
  }

  if (inputs.totalDebt < 100_000) {
    flags.push({
      id: 'small-balance',
      tone: 'info',
      title: 'Small balance \u2014 forgiveness usually loses to fast payoff',
      body:
        'When the principal is small, the interest you pay on the way to either PSLF or 20-year IDR exceeds what an aggressive 5-year payoff would cost. Compare the strategies above.',
    });
  }

  if (
    inputs.taxRate < 27 &&
    inputs.attendingSalary > 350_000
  ) {
    flags.push({
      id: 'tax-rate-low',
      tone: 'warning',
      title: 'Effective tax rate looks low for this income',
      body:
        'A federal + state blended rate below ~27% is uncommon for an attending earning over $350K. If you\u2019re modeling a tax-friendly state, OK \u2014 otherwise consider raising the assumption to keep net-worth projections honest.',
    });
  }

  return flags;
}

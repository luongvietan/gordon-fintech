/**
 * Strategy recommendation engine.
 *
 * Given a set of calculator inputs (and the standard-path outputs to peg
 * timeframe/payment ranges to), this returns the strategy a typical
 * physician in this scenario should default to, plus a one-sentence
 * rationale, an estimated timeframe, an estimated monthly-payment range,
 * and the single most important assumption a user should sanity-check.
 *
 * The decision logic is intentionally simple and rule-based — it mirrors
 * the heuristics published in the Round-1 spec. It is NOT financial
 * advice; it is a starting-point that the user can stress-test by
 * toggling inputs and watching the comparison table change.
 */

import type { CalculatorInputs, CalculatorOutputs } from './calculator';
import { formatDollars, formatYears } from './calculator';

export type RecommendedStrategy = 'pslf' | 'aggressive' | 'standard';

export interface Recommendation {
  strategy: RecommendedStrategy;
  /** 2-4 word verdict label shown in the panel header. */
  verdict: string;
  /** One-sentence rationale referencing the user's actual inputs. */
  reason: string;
  /** Estimated time to debt resolution. */
  timeframe: string;
  /** Estimated monthly payment range, e.g. "$1.8K – $2.4K". */
  monthlyRange: string;
  /** The single assumption the user should validate. */
  keyAssumption: string;
}

/**
 * Specialty groupings for the recommendation rules. These keys must match
 * the `id` field on `SPECIALTIES` in `lib/specialties.ts`.
 */
const PRIMARY_CARE_LIKE: ReadonlySet<string> = new Set([
  'primary-care',
  'internal-medicine',
  'family-medicine',
  'pediatrics',
  'psychiatry',
]);

const HIGH_EARNER: ReadonlySet<string> = new Set([
  'general-surgery',
  'orthopedics',
  'neurosurgery',
  'radiology',
  'dermatology',
  'cardiology',
  'gastroenterology',
]);

/**
 * Best-effort specialty inference from inputs alone — the calculator
 * stores the salary and training duration, not the specialty id, so we
 * fall back to bands when no exact match is available.
 *
 * "Primary-care-like" lower bound: attending salary <= $260K AND training <= 4y.
 * "High-earner" lower bound:       attending salary >= $400K.
 */
function classifySpecialty(
  inputs: CalculatorInputs,
  specialtyId?: string,
): 'primary-care' | 'high-earner' | 'mid-tier' {
  if (specialtyId && PRIMARY_CARE_LIKE.has(specialtyId)) return 'primary-care';
  if (specialtyId && HIGH_EARNER.has(specialtyId)) return 'high-earner';
  if (inputs.attendingSalary >= 400_000) return 'high-earner';
  if (inputs.attendingSalary <= 260_000 && inputs.residencyYears <= 4) {
    return 'primary-care';
  }
  return 'mid-tier';
}

/**
 * Format a +/-15% range around the given monthly payment, for use as the
 * "estimated payment range" line in the verdict card.
 */
function paymentRange(monthlyPayment: number): string {
  if (monthlyPayment <= 0) return '$0 – $0';
  const low = Math.max(0, monthlyPayment * 0.85);
  const high = monthlyPayment * 1.15;
  return `${formatDollars(low)} \u2013 ${formatDollars(high)}`;
}

export function recommendStrategy(
  inputs: CalculatorInputs,
  outputs: CalculatorOutputs,
  specialtyId?: string,
): Recommendation {
  const isFederal = inputs.loanType === 'federal';
  const debt = inputs.totalDebt;
  const klass = classifySpecialty(inputs, specialtyId);

  // Rule 1 — Federal + high debt + primary-care-like specialty → PSLF.
  if (isFederal && debt > 150_000 && klass === 'primary-care') {
    const savings = outputs.pslfSavings || 0;
    const reasonAmount = savings > 0 ? formatDollars(savings) : 'six figures';
    return {
      strategy: 'pslf',
      verdict: 'Pursue PSLF',
      reason: `PSLF saves you an estimated ${reasonAmount} vs standard repayment given your ${formatDollars(debt)} debt and lower-paying specialty.`,
      timeframe: `Debt resolved in ~${formatYears(outputs.pslfYearsToForgiveness || 10)}`,
      monthlyRange: paymentRange(outputs.pslfMonthlyPayment || outputs.monthlyPaymentResidency),
      keyAssumption:
        'Assumes continued employment at a 501(c)(3) non-profit or government employer for 10 qualifying years.',
    };
  }

  // Rule 2 — Private loans OR small balance → aggressive payoff.
  if (!isFederal || debt < 100_000) {
    return {
      strategy: 'aggressive',
      verdict: 'Aggressive payoff',
      reason: !isFederal
        ? `Private loans aren't eligible for PSLF or federal IDR \u2014 the cheapest path is to pay them off fast and minimize interest.`
        : `With ${formatDollars(debt)} in debt, an aggressive payoff schedule beats PSLF and standard amortization on total interest.`,
      timeframe: `Debt resolved in ~${formatYears(Math.max(5, Math.ceil(outputs.payoffYears * 0.6)))}`,
      monthlyRange: paymentRange(outputs.monthlyPaymentAttending * 1.5),
      keyAssumption:
        'Assumes you can sustain ~1.5\u00d7 the standard monthly payment as an attending without sacrificing emergency savings.',
    };
  }

  // Rule 3 — High-earner specialty + moderate balance → aggressive payoff.
  if (klass === 'high-earner' && debt < 200_000) {
    return {
      strategy: 'aggressive',
      verdict: 'Aggressive payoff',
      reason: `Your projected attending salary of ${formatDollars(inputs.attendingSalary)} comfortably outpaces ${formatDollars(debt)} in debt \u2014 paying it down fast minimizes total interest and frees cash for investing.`,
      timeframe: `Debt resolved in ~${formatYears(Math.max(5, Math.ceil(outputs.payoffYears * 0.6)))}`,
      monthlyRange: paymentRange(outputs.monthlyPaymentAttending * 1.5),
      keyAssumption:
        'Assumes the higher monthly payment doesn\u2019t squeeze out retirement contributions \u2014 401(k) match first, then debt.',
    };
  }

  // Default — Standard repayment with a reminder to compare.
  return {
    strategy: 'standard',
    verdict: 'Standard repayment',
    reason: `Your inputs sit between the PSLF sweet spot and the aggressive-payoff sweet spot \u2014 standard 10-year repayment is a safe baseline. Compare all three strategies side-by-side below.`,
    timeframe: `Debt resolved in ~${formatYears(outputs.payoffYears)}`,
    monthlyRange: paymentRange(outputs.monthlyPaymentAttending),
    keyAssumption:
      'Assumes income stays roughly on the projected trajectory and no major life events (kids, partner income) materially change cash flow.',
  };
}

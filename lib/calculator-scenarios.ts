/**
 * Multi-strategy comparison + scenario-stress modules built on top of
 * `calculator.ts`. Three responsibilities live here so the existing
 * single-path `calculateOutputs()` stays focused:
 *
 *   1. `runAllStrategies()`       — PSLF / Standard / Aggressive at once
 *   2. `simulatePslfDisruption()` — "what if I lose PSLF eligibility at year X?"
 *   3. `calculateIdrTaxBomb()`    — federal tax owed on IDR forgiveness
 *
 * All functions are pure — no React, no DOM. The numbers are integer-rounded
 * dollars (matching the convention used in CalculatorOutputs).
 */

import {
  CalculatorInputs,
  CalculatorOutputs,
  amortizationPayment,
  applyScenarioPreset,
  calculateOutputs,
  formatDollars,
} from './calculator';
import { povertyLine150 } from './specialties';

// ============================================================
// 1) ALL-STRATEGY COMPARISON
// ============================================================

export type StrategyId = 'pslf' | 'standard' | 'aggressive' | 'refinance';

export interface StrategyOutcome {
  id: StrategyId;
  label: string;
  /** Sum of payments made over the strategy's horizon (cash out of pocket). */
  totalPaid: number;
  /** Whole years to debt resolution (forgiveness or zero balance). */
  yearsToDone: number;
  /** Best representative monthly payment (attending phase for std/aggressive; IDR for PSLF). */
  monthlyPayment: number;
  /** "Forgiven (~$Xk tax-free)" or "Fully paid off". */
  outcomeLabel: string;
  /** PSLF only — forgiven balance. */
  forgivenAmount?: number;
  /**
   * "True total cost" — out-of-pocket payments + forgiveness-tax liability
   * (where applicable) + the opportunity cost of not investing extra loan
   * payments instead.
   */
  trueTotalCost: number;
  taxLiability: number;
  opportunityCost: number;
  /**
   * Why `trueTotalCost` differs from `totalPaid` (or "Same — no tax event"
   * when they match). Used as the disclosed math under the column.
   */
  trueCostNote: string;
  /** Whether this strategy is the engine's recommended one. */
  recommended?: boolean;
}

export interface StrategyComparison {
  strategies: StrategyOutcome[];
  /** Convenience pointer at the recommended strategy, or null. */
  recommended: StrategyOutcome | null;
}

/**
 * Run all three strategies against the same input set. Each strategy reuses
 * `applyScenarioPreset` so the rules stay in one place (`calculator.ts`).
 *
 * Performance: this triggers three full month-by-month simulations. For the
 * default 30-year horizon that's ~1k iterations × 3 = trivial in JS, but
 * callers should still memoize on `inputs` to avoid recomputing per render.
 */
export function runAllStrategies(
  inputs: CalculatorInputs,
  recommended?: StrategyId,
): StrategyComparison {
  const isFederal = inputs.loanType === 'federal';

  const stdInputs: CalculatorInputs = {
    ...inputs,
    pslfEnabled: false,
    monthlyPaymentOverride: undefined,
    monthlyPaymentResidencyOverride: undefined,
    scenarioPreset: 'custom',
  };
  const stdOut = calculateOutputs(stdInputs);
  const std = buildStandardOutcome(stdInputs, stdOut);

  const aggInputs = applyScenarioPreset(inputs, 'aggressive');
  const aggOut = calculateOutputs(aggInputs);
  const agg = buildAggressiveOutcome(aggInputs, aggOut);

  let pslf: StrategyOutcome;
  if (isFederal) {
    const pslfInputs = applyScenarioPreset(inputs, 'pslf-optimized');
    const pslfOut = calculateOutputs(pslfInputs);
    pslf = buildPslfOutcome(pslfInputs, pslfOut);
  } else {
    pslf = buildPslfNotEligibleOutcome();
  }

  const strategies: StrategyOutcome[] = [pslf, std, agg];

  // Optional fourth strategy: private refinance. Only modeled when the user
  // opts in — the warning about giving up federal protections is loud in
  // the UI, so we don't force this into the table by default.
  if (inputs.refinanceEnabled) {
    strategies.push(buildRefinanceOutcome(inputs, stdOut));
  }

  if (recommended) {
    for (const s of strategies) s.recommended = s.id === recommended;
  }
  const recommendedOutcome = strategies.find((s) => s.recommended) ?? null;
  return { strategies, recommended: recommendedOutcome };
}

function buildStandardOutcome(
  _inputs: CalculatorInputs,
  out: CalculatorOutputs,
): StrategyOutcome {
  const taxLiability = 0;
  const opportunityCost = out.opportunityCost;
  return {
    id: 'standard',
    label: 'Standard repayment',
    totalPaid: out.standardTotalPaid,
    yearsToDone: out.payoffYears,
    monthlyPayment: out.monthlyPaymentAttending,
    outcomeLabel: 'Fully paid off',
    trueTotalCost: out.standardTotalPaid + taxLiability + opportunityCost,
    taxLiability,
    opportunityCost,
    trueCostNote:
      opportunityCost > 0
        ? 'True cost = total paid + investing opportunity you give up by following the 10-year payoff path.'
        : 'Same as total paid \u2014 no forgiveness tax event and no investing tradeoff to add.',
  };
}

function buildAggressiveOutcome(
  _inputs: CalculatorInputs,
  out: CalculatorOutputs,
): StrategyOutcome {
  const taxLiability = 0;
  const opportunityCost = out.opportunityCost;
  return {
    id: 'aggressive',
    label: 'Aggressive payoff',
    totalPaid: out.standardTotalPaid,
    yearsToDone: out.payoffYears,
    monthlyPayment: out.monthlyPaymentAttending,
    outcomeLabel: 'Fully paid off',
    trueTotalCost: out.standardTotalPaid + taxLiability + opportunityCost,
    taxLiability,
    opportunityCost,
    trueCostNote:
      opportunityCost > 0
        ? 'True cost = total paid + investing opportunity you give up by accelerating payoff.'
        : 'Same as total paid \u2014 no forgiveness tax event and no investing tradeoff to add.',
  };
}

function buildPslfOutcome(
  _inputs: CalculatorInputs,
  out: CalculatorOutputs,
): StrategyOutcome {
  const taxLiability = 0;
  const opportunityCost = 0;
  return {
    id: 'pslf',
    label: 'PSLF (forgiveness)',
    totalPaid: out.pslfTotalPaid,
    yearsToDone: out.pslfYearsToForgiveness,
    monthlyPayment: out.pslfMonthlyPayment,
    outcomeLabel: `Forgiven (~${formatDollars(out.pslfForgiven)} tax-free)`,
    forgivenAmount: out.pslfForgiven,
    // PSLF forgiveness is tax-free per current IRS guidance.
    trueTotalCost: out.pslfTotalPaid + taxLiability + opportunityCost,
    taxLiability,
    opportunityCost,
    trueCostNote:
      'True cost = total paid only because PSLF forgiveness is tax-free and this path does not model extra-paydown opportunity cost.',
  };
}

function buildPslfNotEligibleOutcome(): StrategyOutcome {
  return {
    id: 'pslf',
    label: 'PSLF (forgiveness)',
    totalPaid: 0,
    yearsToDone: 0,
    monthlyPayment: 0,
    outcomeLabel: 'Not eligible \u2014 private loans',
    trueTotalCost: 0,
    taxLiability: 0,
    opportunityCost: 0,
    trueCostNote: 'Private loans are not eligible for PSLF.',
  };
}

/**
 * Build the private-refinance outcome.
 *
 * Physicians rarely refinance mid-training because they lose federal IDR
 * protections with no income to support market-rate payments. The
 * realistic pattern is: keep federal loans through residency + fellowship
 * (making the IDR floor), then refinance the post-training balance at
 * the start of the attending phase. That's what we model here.
 *
 * We deliberately take the standard-path balance at the end of training
 * (which already accounts for capitalization rules the user toggled) as
 * the refi principal. Training-phase payments are counted toward
 * totalPaid so the column is comparable to the others.
 */
function buildRefinanceOutcome(
  inputs: CalculatorInputs,
  stdOut: CalculatorOutputs,
): StrategyOutcome {
  const trainingYears =
    inputs.residencyYears + (inputs.fellowshipYears ?? 0);
  const refiRate = inputs.refinanceRate ?? 4.5;
  const refiTerm = Math.max(1, inputs.refinanceTermYears ?? 10);
  const origFeePct = Math.max(0, inputs.refinanceOrigFeePct ?? 0);

  // Find the balance at the end of training on the standard path. That's
  // what actually gets refinanced. The standard schedule is keyed by year,
  // with year 0 being the day-of-training-start snapshot.
  const balanceAtTrainingEnd =
    stdOut.standardSchedule.find((row) => row.year === trainingYears)
      ?.balance ?? stdOut.standardSchedule[stdOut.standardSchedule.length - 1]?.balance ?? inputs.totalDebt;

  // Sum training-phase payments (years 1..trainingYears) to preserve an
  // honest totalPaid figure (the user really did hand over that money
  // before they refinanced).
  let trainingPaid = 0;
  for (const row of stdOut.standardSchedule) {
    if (row.year >= 1 && row.year <= trainingYears) {
      trainingPaid += row.annualPayment;
    }
  }

  // Apply origination fee by rolling it into principal (most physician
  // refi offers are 0% fee; we support non-zero for completeness).
  const feeAmount = balanceAtTrainingEnd * (origFeePct / 100);
  const refiPrincipal = balanceAtTrainingEnd + feeAmount;

  const months = refiTerm * 12;
  const monthlyPayment = refiPrincipal > 0
    ? amortizationPayment(refiPrincipal, refiRate, months)
    : 0;
  const refiTotalPaid = monthlyPayment * months;

  const totalPaid = Math.round(trainingPaid + refiTotalPaid);
  const yearsToDone = trainingYears + refiTerm;

  const taxLiability = 0;
  // Opportunity cost is already baked into stdOut if refi rate < standard
  // rate, but we don't double-count here — refinancing lowers payments
  // which could free cash for investment. Simplify: treat as 0 for the
  // comparison column. The user can reason about that themselves.
  const opportunityCost = 0;

  return {
    id: 'refinance',
    label: 'Refinance (private)',
    totalPaid,
    yearsToDone,
    monthlyPayment: Math.round(monthlyPayment),
    outcomeLabel: 'Fully paid off \u2014 no federal protections',
    trueTotalCost: totalPaid + taxLiability + opportunityCost,
    taxLiability,
    opportunityCost,
    trueCostNote: `Total paid = ${Math.round(trainingPaid / 1000)}K training-phase IDR + ${refiTerm}-yr refi at ${refiRate}% on ${Math.round(balanceAtTrainingEnd / 1000)}K. Refinancing converts federal loans to private, permanently forfeiting PSLF, IDR, and federal forbearance protections.`,
  };
}

// ============================================================
// 2) PSLF DISRUPTION SCENARIO
// ============================================================

export interface PslfDisruptionResult {
  /** Year (1-9) at which the user loses PSLF eligibility. */
  disruptionYear: number;
  /** Total paid up to (but not including) the disruption point. */
  paidUntilDisruption: number;
  /** Loan balance at the moment of disruption (after capitalization). */
  balanceAtDisruption: number;
  /** Cost to finish paying off the remaining balance via 10-yr standard. */
  costToFinishStandard: number;
  /**
   * Total true cost of the disrupted PSLF path:
   * paidUntilDisruption + costToFinishStandard.
   */
  totalDisruptedCost: number;
  /** Total cost if the user had never pursued PSLF (pure standard from day one). */
  neverPslfCost: number;
  /**
   * Verdict: 'still-worth-it' if disrupted PSLF still beats never-PSLF, else
   * 'not-worth-it'.
   */
  verdict: 'still-worth-it' | 'not-worth-it';
  /** Dollar gap between the two paths (positive = PSLF still ahead). */
  gap: number;
}

/**
 * Simulate losing PSLF eligibility at the start of `disruptionYear` (1-9).
 *
 * Mechanics:
 *   - Run the PSLF math (IDR-floor monthly payments) for years 1..disruptionYear-1.
 *   - At end of disruptionYear-1, capitalize all accrued interest.
 *   - Switch to a 10-yr amortization on the remaining balance using the
 *     ATTENDING-phase salary's after-tax cash flow.
 *   - Compare the resulting total to a pristine "never did PSLF" run.
 *
 * Limitations: we don't re-model income changes during the disruption (a
 * forced job switch usually means a different employer and possibly a
 * different salary), and we don't model partial-year disruption (the slider
 * is integer years). Both keep the UX simple and the numbers conservative.
 */
export function simulatePslfDisruption(
  inputs: CalculatorInputs,
  disruptionYear: number,
): PslfDisruptionResult {
  if (inputs.loanType !== 'federal') {
    return zeroDisruptionResult(disruptionYear);
  }

  const clampedYear = Math.max(1, Math.min(9, Math.round(disruptionYear)));

  // Run PSLF as configured, then read schedule to find the cumulative pay-up
  // and balance at the end of `clampedYear - 1` (i.e. just before disruption
  // takes effect at the START of `clampedYear`). For a year-1 disruption,
  // we say the user has paid 0 and owes the full original balance.
  const pslfInputs = applyScenarioPreset(inputs, 'pslf-optimized');
  const pslfOut = calculateOutputs(pslfInputs);

  let paidUntilDisruption = 0;
  let balanceAtDisruption = inputs.totalDebt;

  if (clampedYear > 1) {
    // Sum annualPayment for years 1..(clampedYear-1) and read the displayed
    // balance at the end of (clampedYear-1).
    let cumulative = 0;
    let balanceAtIndex = inputs.totalDebt;
    for (const row of pslfOut.pslfSchedule) {
      if (row.year === 0) continue;
      cumulative += row.annualPayment;
      balanceAtIndex = row.balance;
      if (row.year === clampedYear - 1) break;
    }
    paidUntilDisruption = Math.round(cumulative);
    balanceAtDisruption = Math.round(balanceAtIndex);
  }

  // Cost to finish: 10-year amortization on the remaining balance.
  const monthlyAtt = balanceAtDisruption > 0
    ? amortizationPayment(balanceAtDisruption, inputs.interestRate, 120)
    : 0;
  const costToFinishStandard = Math.round(monthlyAtt * 120);

  const totalDisruptedCost = paidUntilDisruption + costToFinishStandard;

  // Pure standard-from-day-one comparison.
  const stdOut = calculateOutputs({
    ...applyScenarioPreset(inputs, 'minimum'),
    pslfEnabled: false,
  });
  const neverPslfCost = stdOut.standardTotalPaid;

  const gap = neverPslfCost - totalDisruptedCost;
  return {
    disruptionYear: clampedYear,
    paidUntilDisruption,
    balanceAtDisruption,
    costToFinishStandard,
    totalDisruptedCost,
    neverPslfCost,
    verdict: gap >= 0 ? 'still-worth-it' : 'not-worth-it',
    gap,
  };
}

function zeroDisruptionResult(year: number): PslfDisruptionResult {
  return {
    disruptionYear: year,
    paidUntilDisruption: 0,
    balanceAtDisruption: 0,
    costToFinishStandard: 0,
    totalDisruptedCost: 0,
    neverPslfCost: 0,
    verdict: 'not-worth-it',
    gap: 0,
  };
}

// ============================================================
// 3) IDR TAX BOMB
// ============================================================

/**
 * Federal income-tax brackets (2025 single filer). The IDR forgiveness
 * "tax bomb" is treated as ordinary income in the year forgiven, so we
 * project these brackets forward to the forgiveness year using CPI
 * inflation and use them to estimate the federal tax owed.
 *
 * State tax is intentionally NOT modeled here — it varies too much to
 * give a defensible single number. The TaxBombCard surfaces this caveat.
 */
const FEDERAL_BRACKETS_2025: Array<{ rate: number; threshold: number }> = [
  { rate: 0.10, threshold: 0 },
  { rate: 0.12, threshold: 11_925 },
  { rate: 0.22, threshold: 48_475 },
  { rate: 0.24, threshold: 103_350 },
  { rate: 0.32, threshold: 197_300 },
  { rate: 0.35, threshold: 250_525 },
  { rate: 0.37, threshold: 626_350 },
];

/** Compute federal income tax on a given taxable income using piecewise brackets. */
function progressiveFederalTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < FEDERAL_BRACKETS_2025.length; i++) {
    const bracket = FEDERAL_BRACKETS_2025[i];
    const next = FEDERAL_BRACKETS_2025[i + 1];
    const upper = next ? next.threshold : Infinity;
    if (taxableIncome <= bracket.threshold) break;
    const portion = Math.min(taxableIncome, upper) - bracket.threshold;
    tax += portion * bracket.rate;
  }
  return tax;
}

/** Inflation-adjust each bracket threshold forward by `years` at `cpi`. */
function inflateBrackets(years: number, cpi: number) {
  const factor = Math.pow(1 + cpi / 100, Math.max(0, years));
  return FEDERAL_BRACKETS_2025.map((b) => ({
    rate: b.rate,
    threshold: b.threshold * factor,
  }));
}

function progressiveTaxWith(brackets: typeof FEDERAL_BRACKETS_2025, taxable: number): number {
  if (taxable <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const next = brackets[i + 1];
    const upper = next ? next.threshold : Infinity;
    if (taxable <= bracket.threshold) break;
    const portion = Math.min(taxable, upper) - bracket.threshold;
    tax += portion * bracket.rate;
  }
  return tax;
}

export interface IdrTaxBomb {
  /** Years from today until forgiveness (20 for PAYE / SAVE-style; 25 for IBR). */
  yearsUntilForgiveness: number;
  /** Projected loan balance at the forgiveness moment. */
  forgivenBalance: number;
  /** Estimated federal tax owed on the forgiven amount (treated as ordinary income). */
  federalTaxOwed: number;
  /** Effective federal tax rate on the forgiven balance, %. */
  effectiveRate: number;
  /** Total true cost = sum of IDR payments + tax bomb. */
  trueTotalCost: number;
  /** When false, tax-bomb math doesn't apply (PSLF, private, or no forgiveness expected). */
  applies: boolean;
}

/**
 * The UI only exposes two simplified IDR buckets:
 *   - 10% discretionary income → SAVE / PAYE / IBR (2014+)
 *   - 15% discretionary income → IBR (pre-2014)
 *
 * We derive the forgiveness horizon from that same choice so the tax-bomb
 * card cannot drift out of sync with the selected plan.
 */
export function getIdrForgivenessHorizon(
  idrPaymentPct: number | undefined,
): 20 | 25 {
  const pct = typeof idrPaymentPct === 'number' ? idrPaymentPct : 0.10;
  return pct >= 0.15 ? 25 : 20;
}

/**
 * Calculate the federal "tax bomb" for a borrower on an IDR plan with
 * forgiveness at year 20 (PAYE) or 25 (IBR/SAVE). PSLF and private loans
 * return `applies: false`.
 *
 * We simulate IDR payments for the forgiveness horizon, accruing interest
 * and applying the simplified IDR formula (10% of discretionary income).
 * Whatever balance remains at the end is "forgiven" → treated as ordinary
 * income in that year for federal tax purposes.
 *
 * This intentionally does not call `calculateOutputs` because we need a
 * 20/25-year horizon, and the standard simulation caps at 30 years of
 * amortization which would zero the balance well before the cliff for
 * most attending salaries. We need the IDR-only floor here.
 */
export function calculateIdrTaxBomb(
  inputs: CalculatorInputs,
  horizonYears: number = getIdrForgivenessHorizon(inputs.idrPaymentPct),
): IdrTaxBomb {
  if (inputs.loanType !== 'federal' || inputs.pslfEnabled) {
    return {
      yearsUntilForgiveness: horizonYears,
      forgivenBalance: 0,
      federalTaxOwed: 0,
      effectiveRate: 0,
      trueTotalCost: 0,
      applies: false,
    };
  }

  const {
    totalDebt,
    interestRate,
    residencyYears,
    fellowshipYears = 0,
    idrPaymentPct = 0.10,
  } = inputs;
  const trainingYears = residencyYears + fellowshipYears;
  const totalYears = horizonYears;
  let balance = totalDebt;
  let totalPaid = 0;

  // Household-aware IDR inputs: MFJ counts spouse income, MFS/single
  // don't. Family size adjusts the 150% FPL floor.
  const spouseOn = !!inputs.spouseEnabled;
  const filingIncludesSpouse =
    spouseOn && (inputs.filingStatus ?? 'mfj') === 'mfj';
  const spouseIncome = spouseOn ? Math.max(0, inputs.spouseIncome ?? 0) : 0;
  const spouseGrowth = inputs.spouseIncomeGrowthRate ?? 3;
  const familySize = Math.max(
    1,
    inputs.familySize ?? (spouseOn ? 2 : 1),
  );
  const fpl = povertyLine150(familySize);
  const idrPct = Math.max(0.01, Math.min(0.30, idrPaymentPct));

  for (let yr = 1; yr <= totalYears; yr++) {
    if (balance <= 0) break;
    const inTraining = yr <= trainingYears;
    const grossSalary = inTraining
      ? inputs.residencyStartingSalary *
        Math.pow(1 + inputs.inflationRate / 100, yr - 1) *
        Math.pow(1 + inputs.residentSalaryGrowthRate / 100, yr - 1)
      : inputs.attendingSalary *
        Math.pow(1 + inputs.inflationRate / 100, yr - 1) *
        Math.pow(1 + inputs.attendingSalaryGrowthRate / 100, yr - trainingYears - 1);

    const spouseYearIncome = spouseIncome
      ? spouseIncome *
        Math.pow(1 + inputs.inflationRate / 100, yr - 1) *
        Math.pow(1 + spouseGrowth / 100, yr - 1)
      : 0;
    const agi =
      grossSalary + (filingIncludesSpouse ? spouseYearIncome : 0);
    const annualIdr = Math.max(0, agi - fpl) * idrPct;
    const monthlyIdr = annualIdr / 12;

    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const monthlyInterest = (balance * (interestRate / 100)) / 12;
      const payment = Math.min(monthlyIdr, balance + monthlyInterest);
      balance = balance + monthlyInterest - payment;
      totalPaid += payment;
      if (balance < 0) balance = 0;
    }
  }

  const forgivenBalance = Math.round(Math.max(0, balance));

  if (forgivenBalance <= 0) {
    return {
      yearsUntilForgiveness: horizonYears,
      forgivenBalance: 0,
      federalTaxOwed: 0,
      effectiveRate: 0,
      trueTotalCost: Math.round(totalPaid),
      applies: false,
    };
  }

  // Estimate the borrower's salary in the forgiveness year, then add the
  // forgiven balance on top to estimate the marginal-bracket tax bill.
  const yearsAfterTraining = Math.max(0, horizonYears - trainingYears);
  const salaryAtForgiveness = inputs.attendingSalary *
    Math.pow(1 + inputs.inflationRate / 100, horizonYears - 1) *
    Math.pow(1 + inputs.attendingSalaryGrowthRate / 100, yearsAfterTraining);

  const inflatedBrackets = inflateBrackets(horizonYears, inputs.inflationRate);
  const taxOnSalaryOnly = progressiveTaxWith(inflatedBrackets, salaryAtForgiveness);
  const taxOnSalaryPlusForgiveness = progressiveTaxWith(
    inflatedBrackets,
    salaryAtForgiveness + forgivenBalance,
  );
  const incrementalTax =
    typeof inputs.taxBombRateOverride === 'number' &&
    isFinite(inputs.taxBombRateOverride) &&
    inputs.taxBombRateOverride >= 0
      ? forgivenBalance * (inputs.taxBombRateOverride / 100)
      : Math.max(0, taxOnSalaryPlusForgiveness - taxOnSalaryOnly);

  return {
    yearsUntilForgiveness: horizonYears,
    forgivenBalance,
    federalTaxOwed: Math.round(incrementalTax),
    effectiveRate: forgivenBalance > 0 ? (incrementalTax / forgivenBalance) * 100 : 0,
    trueTotalCost: Math.round(totalPaid + incrementalTax),
    applies: true,
  };
}

/** Re-export for callers that want a one-off straight federal tax estimate. */
export { progressiveFederalTax };

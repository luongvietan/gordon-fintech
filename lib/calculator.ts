import { POVERTY_LINE_150 } from './specialties';

// ============================================================
// TYPES
// ============================================================

export type ScenarioPreset =
  | 'aggressive'
  | 'pslf-optimized'
  | 'minimum'
  | 'custom';

export interface CalculatorInputs {
  totalDebt: number;
  interestRate: number;             // percent (e.g. 6.8)
  loanType: 'federal' | 'private';
  residencyYears: number;
  /**
   * Optional fellowship phase (PDF v4 "Fellowship Modeling as extended
   * low-income phases"). When > 0 this runs immediately after residency
   * with its own stipend before the attending phase starts. Defaults to 0.
   */
  fellowshipYears?: number;
  /** Stipend during fellowship (USD/yr). Optional; falls back to residency salary. */
  fellowshipSalary?: number;
  /** Annual stipend / PGY salary at start of training (PDF default ~$65k). */
  residencyStartingSalary: number;
  attendingSalary: number;
  /** % annual raise during residency & fellowship (PDF ~2%). */
  residentSalaryGrowthRate: number;
  /** % annual growth as attending (PDF ~3%). */
  attendingSalaryGrowthRate: number;
  /** Optional: fixed monthly loan payment during training (standard path). */
  monthlyPaymentResidencyOverride?: number;
  /** Optional: monthly payment as attending (standard path); default = 10-yr amortization on post-training balance. */
  monthlyPaymentOverride?: number;
  pslfEnabled: boolean;
  /**
   * PDF realism fix: "Residency years count toward PSLF only if employment
   * qualifies under federal rules." When false, training months do NOT count
   * toward the 120 qualifying payments — only attending months do.
   * Defaults to true (typical academic / 501(c)(3) residency program).
   */
  pslfResidencyQualifies?: boolean;
  livingExpensesResidency: number;  // monthly
  livingExpensesAttending: number;  // monthly

  // ── v4 additions ─────────────────────────────────────────
  /** Effective tax rate, percent. Typical range 25–40%. */
  taxRate: number;
  /** CPI inflation applied to salaries + expenses. Typical 0–5%. */
  inflationRate: number;
  /** Assumed annual return if extra $ were invested instead. Typical 0–10%. */
  investmentReturn: number;
  /**
   * PDF realism fix: "Unpaid interest may capitalize depending on loan type
   * and repayment plan selection." When true, interest accrued during
   * training does NOT compound monthly — it's tracked separately and
   * capitalized ONCE at the end of training (typical federal IDR behavior).
   * When false, interest compounds monthly throughout (worst-case scenario).
   */
  capitalizeOnlyAfterTraining?: boolean;
  /** Chosen scenario preset (UI hint — math derives from the other fields). */
  scenarioPreset?: ScenarioPreset;
}

export interface YearlySnapshot {
  year: number;
  label: string;
  balance: number;
  annualPayment: number;
  annualIncome: number;
  netWorth: number;
  phase: 'residency' | 'attending' | 'forgiven';
}

export interface CalculatorOutputs {
  // Standard repayment
  monthlyPaymentResidency: number;
  monthlyPaymentAttending: number;
  totalInterestPaid: number;
  standardTotalPaid: number;
  payoffYears: number;
  standardSchedule: YearlySnapshot[];

  // PSLF
  pslfMonthlyPayment: number;
  pslfTotalPaid: number;
  /** Total interest accrued & paid along the PSLF path (before forgiveness). */
  pslfInterestPaid: number;
  pslfForgiven: number;
  pslfSavings: number;
  pslfSchedule: YearlySnapshot[];
  pslfEligible: boolean;
  pslfYearsToForgiveness: number;

  // ── v4 additions ─────────────────────────────────────────
  /** First year index where net worth turns non-negative (null if never within horizon). */
  netWorthCrossoverYear: number | null;
  /**
   * Approximate compound-growth value of the "extra" dollars paid above the
   * floor (federal: simplified IDR; private: interest-only) each month, if
   * invested at `investmentReturn` over the payoff horizon.
   */
  opportunityCost: number;
  /** Convenience: total paid (standard) minus the minimum-payment path. */
  extraDollarsPaid: number;
}

// ============================================================
// HELPERS
// ============================================================

function monthlyRate(annualPercent: number): number {
  return annualPercent / 100 / 12;
}

export function amortizationPayment(
  principal: number,
  annualPercent: number,
  months: number,
): number {
  const r = monthlyRate(annualPercent);
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Simplified income-driven repayment (SAVE/PAYE-style): 10% of discretionary. */
function idrPayment(annualSalary: number): number {
  const discretionary = Math.max(0, annualSalary - POVERTY_LINE_150);
  return (discretionary * 0.10) / 12;
}

/**
 * Standard-path residency: optional override; else federal IDR floor; else
 * private loans = interest-only (no federal IDR).
 */
function standardResidencyMonthlyPayment(
  loanType: 'federal' | 'private',
  residentAnnualGross: number,
  monthlyInterest: number,
  balance: number,
  override?: number,
): number {
  const maxPayable = Math.max(0, balance + monthlyInterest);
  if (override != null && override >= 0) {
    return Math.min(override, maxPayable);
  }
  if (loanType === 'federal') {
    return Math.min(idrPayment(residentAnnualGross), maxPayable);
  }
  return Math.min(monthlyInterest, maxPayable);
}

/** Floor payment for “minimum vs extra” tracking: federal IDR; private = interest-only. */
function attendingFloorMonthlyPayment(
  loanType: 'federal' | 'private',
  annualGrossForIdr: number,
  monthlyInterest: number,
  balance: number,
): number {
  const maxPayable = Math.max(0, balance + monthlyInterest);
  if (loanType === 'federal') {
    return Math.min(idrPayment(annualGrossForIdr), maxPayable);
  }
  return Math.min(monthlyInterest, maxPayable);
}

function accrueInterest(balance: number, annualPercent: number): number {
  return balance * monthlyRate(annualPercent);
}

/** After-tax income using a user-provided effective tax rate. */
function afterTax(gross: number, taxRatePercent: number): number {
  const rate = Math.max(0, Math.min(0.6, taxRatePercent / 100));
  return gross * (1 - rate);
}

/** Compound a salary by `growth + inflation` over `yearsFromStart` years. */
function inflatedSalary(
  baseSalary: number,
  yearsFromStart: number,
  growthPercent: number,
  inflationPercent: number,
): number {
  const g = growthPercent / 100;
  const i = inflationPercent / 100;
  // Multiplicative compounding — both growth and CPI inflation compound yearly.
  return baseSalary * Math.pow(1 + g, yearsFromStart) * Math.pow(1 + i, yearsFromStart);
}

/** Compound future value of a monthly contribution stream. */
function futureValueOfMonthlyStream(
  monthlyContribution: number,
  annualReturnPercent: number,
  months: number,
): number {
  if (monthlyContribution <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualReturnPercent);
  if (r === 0) return monthlyContribution * months;
  return monthlyContribution * ((Math.pow(1 + r, months) - 1) / r);
}

// ============================================================
// MAIN CALCULATION
// ============================================================

export function calculateOutputs(inputs: CalculatorInputs): CalculatorOutputs {
  const {
    totalDebt,
    interestRate,
    loanType,
    residencyYears,
    fellowshipYears = 0,
    fellowshipSalary,
    residencyStartingSalary,
    attendingSalary,
    residentSalaryGrowthRate,
    attendingSalaryGrowthRate,
    monthlyPaymentResidencyOverride,
    monthlyPaymentOverride,
    pslfEnabled,
    pslfResidencyQualifies = true,
    livingExpensesResidency,
    livingExpensesAttending,
    taxRate,
    inflationRate,
    investmentReturn,
    capitalizeOnlyAfterTraining = false,
  } = inputs;

  const pslfEligible = loanType === 'federal' && pslfEnabled;
  const trainingYears = residencyYears + Math.max(0, fellowshipYears);

  /**
   * Salary for a given training year (1-indexed).
   * During residency (yr <= residencyYears) uses residencyStartingSalary;
   * during fellowship falls back to fellowshipSalary (or residency salary
   * if none given). Growth + inflation compound relative to start of training.
   */
  function trainingGross(yr: number): number {
    const inResidency = yr <= residencyYears;
    if (inResidency) {
      return inflatedSalary(
        residencyStartingSalary,
        yr - 1,
        residentSalaryGrowthRate,
        inflationRate,
      );
    }
    // Fellowship: compound growth from start of fellowship, but inflation from
    // start of training (keeps the CPI-adjusted net worth math consistent).
    const yearsIntoFellowship = yr - residencyYears - 1;
    const base = fellowshipSalary ?? residencyStartingSalary;
    const g = residentSalaryGrowthRate / 100;
    const i = inflationRate / 100;
    return (
      base *
      Math.pow(1 + g, yearsIntoFellowship) *
      Math.pow(1 + i, yr - 1)
    );
  }
  function trainingPhase(yr: number): 'residency' | 'fellowship' {
    return yr <= residencyYears ? 'residency' : 'fellowship';
  }

  // ─── STANDARD REPAYMENT ─────────────────────────────────────
  const standardSchedule: YearlySnapshot[] = [];
  let balance = totalDebt;
  /** Unpaid interest bucket when capitalization is deferred to end of training. */
  let accruedInterest = 0;
  let totalInterestPaid = 0;
  let cumulativePaid = 0;
  let cumulativeNetWorth = 0;
  let payoffYear = 0;
  let minimumPaidStandard = 0; // sum of minimum-IDR payments that would have been made

  standardSchedule.push({
    year: 0,
    label: 'Start',
    balance: Math.round(balance),
    annualPayment: 0,
    annualIncome: 0,
    netWorth: -Math.round(balance),
    phase: 'residency',
  });

  // Training phase (residency + optional fellowship)
  for (let yr = 1; yr <= trainingYears; yr++) {
    let yearlyPayment = 0;
    let yearlyMinimum = 0;
    const gross = trainingGross(yr);
    const net = afterTax(gross, taxRate);
    const phase = trainingPhase(yr);

    for (let m = 0; m < 12; m++) {
      // Interest always accrues on the current principal balance.
      const interest = accrueInterest(balance, interestRate);
      // Minimum / target monthly payment — based on effective balance the
      // loan servicer would show (principal + any deferred interest).
      const servicingBalance = balance + accruedInterest;
      const targetPayment = standardResidencyMonthlyPayment(
        loanType,
        gross,
        interest,
        servicingBalance,
        monthlyPaymentResidencyOverride,
      );
      const floorPay = standardResidencyMonthlyPayment(
        loanType,
        gross,
        interest,
        servicingBalance,
        undefined,
      );
      const payment = targetPayment;

      if (capitalizeOnlyAfterTraining) {
        // Deferred-capitalization model: payments hit the accrued-interest
        // bucket first, then any excess reduces principal. Principal itself
        // does NOT compound — it only grows ONCE when training ends.
        let p = payment;
        accruedInterest += interest;
        const toInterest = Math.min(accruedInterest, p);
        accruedInterest -= toInterest;
        p -= toInterest;
        if (p > 0) {
          balance -= p;
        }
      } else {
        // Classic path — interest capitalizes into principal every month.
        balance = balance + interest - payment;
      }

      totalInterestPaid += interest;
      yearlyPayment += payment;
      yearlyMinimum += floorPay;
      cumulativePaid += payment;
      if (balance <= 0) {
        balance = 0;
        accruedInterest = 0;
        break;
      }
    }

    // Both residency and fellowship are modeled as low-income phases with the
    // same baseline monthly living budget (user-provided).
    const yearlyLiving =
      livingExpensesResidency * 12 * Math.pow(1 + inflationRate / 100, yr - 1);
    cumulativeNetWorth += net - yearlyPayment - yearlyLiving;
    minimumPaidStandard += yearlyMinimum;

    const displayedBalance = Math.max(0, balance + accruedInterest);
    standardSchedule.push({
      year: yr,
      label: `Year ${yr}`,
      balance: Math.round(displayedBalance),
      annualPayment: Math.round(yearlyPayment),
      annualIncome: Math.round(gross),
      netWorth: Math.round(cumulativeNetWorth - displayedBalance),
      phase,
    });
  }

  // ── Capitalize accrued interest once training ends ──
  if (accruedInterest > 0) {
    balance += accruedInterest;
    accruedInterest = 0;
  }

  // Attending phase
  const postResidencyBalance = balance;
  const defaultAttendingPayment =
    postResidencyBalance > 0
      ? amortizationPayment(postResidencyBalance, interestRate, 120)
      : 0;
  const monthlyPaymentAttending = monthlyPaymentOverride ?? defaultAttendingPayment;

  const MAX_ATTENDING_YEARS = 30;
  for (let yr = 1; yr <= MAX_ATTENDING_YEARS; yr++) {
    if (balance <= 0) break;

    let yearlyPayment = 0;
    let yearlyMinimum = 0;
    const yearsFromStart = trainingYears + yr - 1;
    const currentGross = inflatedSalary(
      attendingSalary,
      yr - 1,
      attendingSalaryGrowthRate,
      inflationRate,
    );
    const currentNet = afterTax(currentGross, taxRate);

    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = accrueInterest(balance, interestRate);
      const payment = Math.min(monthlyPaymentAttending, balance + interest);
      const floorMonthly = attendingFloorMonthlyPayment(
        loanType,
        currentGross,
        interest,
        balance,
      );
      balance = balance + interest - payment;
      totalInterestPaid += interest;
      yearlyPayment += payment;
      yearlyMinimum += Math.min(floorMonthly, payment);
      cumulativePaid += payment;
      if (balance < 0.01) {
        balance = 0;
        break;
      }
    }

    const yearlyLiving = livingExpensesAttending * 12 * Math.pow(1 + inflationRate / 100, yearsFromStart);
    cumulativeNetWorth += currentNet - yearlyPayment - yearlyLiving;
    minimumPaidStandard += yearlyMinimum;
    const calendarYear = trainingYears + yr;

    standardSchedule.push({
      year: calendarYear,
      label: `Year ${calendarYear}`,
      balance: Math.round(Math.max(0, balance)),
      annualPayment: Math.round(yearlyPayment),
      annualIncome: Math.round(currentGross),
      netWorth: Math.round(cumulativeNetWorth - Math.max(0, balance)),
      phase: balance <= 0 ? 'forgiven' : 'attending',
    });

    if (balance <= 0 && payoffYear === 0) {
      payoffYear = calendarYear;
    }
  }

  const standardTotalPaid = Math.round(cumulativePaid);
  const finalTotalInterest = Math.round(totalInterestPaid);
  const finalPayoffYears = payoffYear || trainingYears + MAX_ATTENDING_YEARS;
  const firstResidentGross = inflatedSalary(
    residencyStartingSalary,
    0,
    residentSalaryGrowthRate,
    inflationRate,
  );
  const firstMonthInterestRes = accrueInterest(totalDebt, interestRate);
  const monthlyPaymentResidency = Math.round(
    standardResidencyMonthlyPayment(
      loanType,
      firstResidentGross,
      firstMonthInterestRes,
      totalDebt,
      monthlyPaymentResidencyOverride,
    ),
  );

  // ─── PSLF SIMULATION ───────────────────────────────────────
  let pslfMonthlyPayment = 0;
  let pslfTotalPaid = 0;
  let pslfInterestPaid = 0;
  let pslfForgiven = 0;
  let pslfSavings = 0;
  let pslfYearsToForgiveness = 0;
  const pslfSchedule: YearlySnapshot[] = [];

  if (pslfEligible) {
    let pslfBalance = totalDebt;
    let pslfAccrued = 0;
    let pslfCumulativePaid = 0;
    let pslfCumulativeInterest = 0;
    let pslfCumulativeNetWorth = 0;
    const PSLF_MONTHS = 120;
    let qualifyingPayments = 0;

    pslfSchedule.push({
      year: 0,
      label: 'Start',
      balance: Math.round(pslfBalance),
      annualPayment: 0,
      annualIncome: 0,
      netWorth: -Math.round(pslfBalance),
      phase: 'residency',
    });

    // Training phase (residency + optional fellowship)
    for (let yr = 1; yr <= trainingYears; yr++) {
      let yearlyPayment = 0;
      const gross = trainingGross(yr);
      const net = afterTax(gross, taxRate);
      const monthlyIDR = idrPayment(gross);
      const phase = trainingPhase(yr);

      for (let m = 0; m < 12; m++) {
        if (qualifyingPayments >= PSLF_MONTHS) break;
        const interest = accrueInterest(pslfBalance, interestRate);
        const servicing = pslfBalance + pslfAccrued;
        const payment = Math.min(monthlyIDR, servicing + interest);

        if (capitalizeOnlyAfterTraining) {
          let p = payment;
          pslfAccrued += interest;
          const toInterest = Math.min(pslfAccrued, p);
          pslfAccrued -= toInterest;
          p -= toInterest;
          if (p > 0) pslfBalance -= p;
        } else {
          pslfBalance = pslfBalance + interest - payment;
        }

        yearlyPayment += payment;
        pslfCumulativePaid += payment;
        pslfCumulativeInterest += interest;
        // PDF: "Residency years count toward PSLF only if employment qualifies."
        if (pslfResidencyQualifies) qualifyingPayments++;
        if (pslfBalance < 0) pslfBalance = 0;
      }

      const yearlyLiving =
        livingExpensesResidency * 12 * Math.pow(1 + inflationRate / 100, yr - 1);
      pslfCumulativeNetWorth += net - yearlyPayment - yearlyLiving;

      const displayed = Math.max(0, pslfBalance + pslfAccrued);
      pslfSchedule.push({
        year: yr,
        label: `Year ${yr}`,
        balance: Math.round(displayed),
        annualPayment: Math.round(yearlyPayment),
        annualIncome: Math.round(gross),
        netWorth: Math.round(pslfCumulativeNetWorth - displayed),
        phase,
      });
    }

    // Capitalize once at end of training (mirrors federal IDR behavior).
    if (pslfAccrued > 0) {
      pslfBalance += pslfAccrued;
      pslfAccrued = 0;
    }

    // Attending phase up to 120 qualifying payments (capped at 12 years since
    // even without training counting, max = residency + 10).
    const MAX_PSLF_ATTENDING = 12;
    for (let yr = 1; yr <= MAX_PSLF_ATTENDING; yr++) {
      if (qualifyingPayments >= PSLF_MONTHS) break;
      let yearlyPayment = 0;
      const yearsFromStart = trainingYears + yr - 1;
      const currentGross = inflatedSalary(
        attendingSalary,
        yr - 1,
        attendingSalaryGrowthRate,
        inflationRate,
      );
      const currentNet = afterTax(currentGross, taxRate);
      const monthlyIDR = idrPayment(currentGross);

      for (let m = 0; m < 12; m++) {
        if (qualifyingPayments >= PSLF_MONTHS) break;
        const interest = accrueInterest(pslfBalance, interestRate);
        const payment = Math.min(monthlyIDR, pslfBalance + interest);
        pslfBalance = pslfBalance + interest - payment;
        yearlyPayment += payment;
        pslfCumulativePaid += payment;
        pslfCumulativeInterest += interest;
        qualifyingPayments++;
        if (pslfBalance < 0) pslfBalance = 0;
      }

      const yearlyLiving = livingExpensesAttending * 12 * Math.pow(1 + inflationRate / 100, yearsFromStart);
      pslfCumulativeNetWorth += currentNet - yearlyPayment - yearlyLiving;
      const calendarYear = trainingYears + yr;
      const isForgiven = qualifyingPayments >= PSLF_MONTHS;

      pslfSchedule.push({
        year: calendarYear,
        label: `Year ${calendarYear}`,
        balance: isForgiven ? 0 : Math.round(Math.max(0, pslfBalance)),
        annualPayment: Math.round(yearlyPayment),
        annualIncome: Math.round(currentGross),
        netWorth: Math.round(
          pslfCumulativeNetWorth - (isForgiven ? 0 : Math.max(0, pslfBalance)),
        ),
        phase: isForgiven ? 'forgiven' : 'attending',
      });
    }

    pslfForgiven = Math.round(Math.max(0, pslfBalance));
    pslfTotalPaid = Math.round(pslfCumulativePaid);
    pslfInterestPaid = Math.round(pslfCumulativeInterest);
    pslfMonthlyPayment = Math.round(idrPayment(attendingSalary));
    pslfSavings = Math.max(0, standardTotalPaid - pslfTotalPaid);
    // Years until 120 qualifying payments reached. When training doesn't
    // qualify, the clock effectively starts at attending-hood.
    const trainingQualifyingMonths = pslfResidencyQualifies ? trainingYears * 12 : 0;
    const attendingMonthsNeeded = Math.max(0, PSLF_MONTHS - trainingQualifyingMonths);
    pslfYearsToForgiveness = trainingYears + Math.ceil(attendingMonthsNeeded / 12);
  }

  // ─── v4: crossover + opportunity cost ───────────────────────
  // Pick the "active" schedule for crossover (PSLF path if user chose it).
  const activeSchedule = pslfEligible ? pslfSchedule : standardSchedule;
  let netWorthCrossoverYear: number | null = null;
  for (const row of activeSchedule) {
    if (row.year > 0 && row.netWorth >= 0) {
      netWorthCrossoverYear = row.year;
      break;
    }
  }

  // Opportunity cost — how much the *extra* dollars (above minimum IDR) would
  // have grown if invested at `investmentReturn` over the same payoff horizon.
  const payoffMonths = Math.max(1, finalPayoffYears * 12);
  const extraDollarsPaid = Math.max(0, standardTotalPaid - Math.round(minimumPaidStandard));
  const avgExtraMonthly = extraDollarsPaid / payoffMonths;
  const opportunityCost = Math.round(
    futureValueOfMonthlyStream(avgExtraMonthly, investmentReturn, payoffMonths),
  );

  return {
    monthlyPaymentResidency,
    monthlyPaymentAttending: Math.round(monthlyPaymentAttending),
    totalInterestPaid: finalTotalInterest,
    standardTotalPaid,
    payoffYears: finalPayoffYears,
    standardSchedule,

    pslfMonthlyPayment,
    pslfTotalPaid,
    pslfInterestPaid,
    pslfForgiven,
    pslfSavings,
    pslfSchedule,
    pslfEligible,
    pslfYearsToForgiveness,

    netWorthCrossoverYear,
    opportunityCost,
    extraDollarsPaid,
  };
}

// ============================================================
// SCENARIO PRESETS
// ============================================================

/**
 * Apply a preset to an input set. Returns a new inputs object — the UI can
 * then feed it straight into `calculateOutputs`.
 *
 * - `aggressive`      — pay 1.5× standard amortization; disable PSLF
 * - `pslf-optimized`  — enable PSLF (if federal); let IDR minimum run
 * - `minimum`         — no override; disable PSLF (pay the federal minimum)
 * - `custom`          — leave inputs as-is
 */
export function applyScenarioPreset(
  inputs: CalculatorInputs,
  preset: ScenarioPreset,
): CalculatorInputs {
  switch (preset) {
    case 'aggressive': {
      const baseOutputs = calculateOutputs({
        ...inputs,
        pslfEnabled: false,
        monthlyPaymentResidencyOverride: undefined,
      });
      const aggressiveMonthly = Math.round(baseOutputs.monthlyPaymentAttending * 1.5);
      return {
        ...inputs,
        pslfEnabled: false,
        monthlyPaymentOverride: aggressiveMonthly,
        monthlyPaymentResidencyOverride: undefined,
        scenarioPreset: 'aggressive',
      };
    }
    case 'pslf-optimized':
      return {
        ...inputs,
        pslfEnabled: inputs.loanType === 'federal',
        monthlyPaymentOverride: undefined,
        monthlyPaymentResidencyOverride: undefined,
        scenarioPreset: 'pslf-optimized',
      };
    case 'minimum':
      return {
        ...inputs,
        pslfEnabled: false,
        monthlyPaymentOverride: undefined,
        monthlyPaymentResidencyOverride: undefined,
        scenarioPreset: 'minimum',
      };
    case 'custom':
    default:
      return { ...inputs, scenarioPreset: 'custom' };
  }
}

// ============================================================
// FORMAT HELPERS
// ============================================================

export function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatDollarsExact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatYears(years: number): string {
  if (years === 0) return '< 1 yr';
  if (years === 1) return '1 yr';
  return `${years} yrs`;
}

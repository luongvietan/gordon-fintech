import { RESIDENT_SALARY, POVERTY_LINE_150 } from './specialties';

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
  attendingSalary: number;
  salaryGrowthRate: number;         // percent per year
  monthlyPaymentOverride?: number;
  pslfEnabled: boolean;
  livingExpensesResidency: number;  // monthly
  livingExpensesAttending: number;  // monthly

  // ── v4 additions ─────────────────────────────────────────
  /** Effective tax rate, percent. Typical range 25–40%. */
  taxRate: number;
  /** CPI inflation applied to salaries + expenses. Typical 0–5%. */
  inflationRate: number;
  /** Assumed annual return if extra $ were invested instead. Typical 0–10%. */
  investmentReturn: number;
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
   * minimum IDR each month, if they had been invested at `investmentReturn`
   * over the payoff horizon. Represents the opportunity cost of aggressive
   * payoff vs. investing.
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
    attendingSalary,
    salaryGrowthRate,
    monthlyPaymentOverride,
    pslfEnabled,
    livingExpensesResidency,
    livingExpensesAttending,
    taxRate,
    inflationRate,
    investmentReturn,
  } = inputs;

  const pslfEligible = loanType === 'federal' && pslfEnabled;

  // ─── STANDARD REPAYMENT ─────────────────────────────────────
  const standardSchedule: YearlySnapshot[] = [];
  let balance = totalDebt;
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

  // Residency phase
  for (let yr = 1; yr <= residencyYears; yr++) {
    let yearlyPayment = 0;
    let yearlyMinimum = 0;
    const residentGross = inflatedSalary(RESIDENT_SALARY, yr - 1, salaryGrowthRate, inflationRate);
    const residentNet = afterTax(residentGross, taxRate);
    const monthlyIDR = idrPayment(residentGross);

    for (let m = 0; m < 12; m++) {
      const interest = accrueInterest(balance, interestRate);
      const payment = Math.min(monthlyIDR, balance + interest);
      balance = balance + interest - payment;
      totalInterestPaid += interest;
      yearlyPayment += payment;
      yearlyMinimum += payment;
      cumulativePaid += payment;
      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    const yearlyLiving = livingExpensesResidency * 12 * Math.pow(1 + inflationRate / 100, yr - 1);
    cumulativeNetWorth += residentNet - yearlyPayment - yearlyLiving;
    minimumPaidStandard += yearlyMinimum;

    standardSchedule.push({
      year: yr,
      label: `Year ${yr}`,
      balance: Math.round(Math.max(0, balance)),
      annualPayment: Math.round(yearlyPayment),
      annualIncome: Math.round(residentGross),
      netWorth: Math.round(cumulativeNetWorth - Math.max(0, balance)),
      phase: 'residency',
    });
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
    const yearsFromStart = residencyYears + yr - 1;
    const currentGross = inflatedSalary(attendingSalary, yr - 1, salaryGrowthRate, inflationRate);
    const currentNet = afterTax(currentGross, taxRate);
    const minMonthly = idrPayment(currentGross);

    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = accrueInterest(balance, interestRate);
      const payment = Math.min(monthlyPaymentAttending, balance + interest);
      balance = balance + interest - payment;
      totalInterestPaid += interest;
      yearlyPayment += payment;
      yearlyMinimum += Math.min(minMonthly, payment);
      cumulativePaid += payment;
      if (balance < 0.01) {
        balance = 0;
        break;
      }
    }

    const yearlyLiving = livingExpensesAttending * 12 * Math.pow(1 + inflationRate / 100, yearsFromStart);
    cumulativeNetWorth += currentNet - yearlyPayment - yearlyLiving;
    minimumPaidStandard += yearlyMinimum;
    const calendarYear = residencyYears + yr;

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
  const finalPayoffYears = payoffYear || residencyYears + MAX_ATTENDING_YEARS;
  const monthlyPaymentResidency = Math.round(idrPayment(RESIDENT_SALARY));

  // ─── PSLF SIMULATION ───────────────────────────────────────
  let pslfMonthlyPayment = 0;
  let pslfTotalPaid = 0;
  let pslfForgiven = 0;
  let pslfSavings = 0;
  let pslfYearsToForgiveness = 0;
  const pslfSchedule: YearlySnapshot[] = [];

  if (pslfEligible) {
    let pslfBalance = totalDebt;
    let pslfCumulativePaid = 0;
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

    // Residency phase
    for (let yr = 1; yr <= residencyYears; yr++) {
      let yearlyPayment = 0;
      const residentGross = inflatedSalary(RESIDENT_SALARY, yr - 1, salaryGrowthRate, inflationRate);
      const residentNet = afterTax(residentGross, taxRate);
      const monthlyIDR = idrPayment(residentGross);

      for (let m = 0; m < 12; m++) {
        if (qualifyingPayments >= PSLF_MONTHS) break;
        const interest = accrueInterest(pslfBalance, interestRate);
        const payment = Math.min(monthlyIDR, pslfBalance + interest);
        pslfBalance = pslfBalance + interest - payment;
        yearlyPayment += payment;
        pslfCumulativePaid += payment;
        qualifyingPayments++;
        if (pslfBalance < 0) pslfBalance = 0;
      }

      const yearlyLiving = livingExpensesResidency * 12 * Math.pow(1 + inflationRate / 100, yr - 1);
      pslfCumulativeNetWorth += residentNet - yearlyPayment - yearlyLiving;

      pslfSchedule.push({
        year: yr,
        label: `Year ${yr}`,
        balance: Math.round(Math.max(0, pslfBalance)),
        annualPayment: Math.round(yearlyPayment),
        annualIncome: Math.round(residentGross),
        netWorth: Math.round(pslfCumulativeNetWorth - Math.max(0, pslfBalance)),
        phase: 'residency',
      });
    }

    // Attending phase up to 120 qualifying payments
    for (let yr = 1; yr <= 12; yr++) {
      if (qualifyingPayments >= PSLF_MONTHS) break;
      let yearlyPayment = 0;
      const yearsFromStart = residencyYears + yr - 1;
      const currentGross = inflatedSalary(attendingSalary, yr - 1, salaryGrowthRate, inflationRate);
      const currentNet = afterTax(currentGross, taxRate);
      const monthlyIDR = idrPayment(currentGross);

      for (let m = 0; m < 12; m++) {
        if (qualifyingPayments >= PSLF_MONTHS) break;
        const interest = accrueInterest(pslfBalance, interestRate);
        const payment = Math.min(monthlyIDR, pslfBalance + interest);
        pslfBalance = pslfBalance + interest - payment;
        yearlyPayment += payment;
        pslfCumulativePaid += payment;
        qualifyingPayments++;
        if (pslfBalance < 0) pslfBalance = 0;
      }

      const yearlyLiving = livingExpensesAttending * 12 * Math.pow(1 + inflationRate / 100, yearsFromStart);
      pslfCumulativeNetWorth += currentNet - yearlyPayment - yearlyLiving;
      const calendarYear = residencyYears + yr;
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
    pslfMonthlyPayment = Math.round(idrPayment(attendingSalary));
    pslfSavings = Math.max(0, standardTotalPaid - pslfTotalPaid);
    pslfYearsToForgiveness =
      residencyYears + Math.ceil(Math.max(0, PSLF_MONTHS - residencyYears * 12) / 12);
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
      const baseOutputs = calculateOutputs({ ...inputs, pslfEnabled: false });
      const aggressiveMonthly = Math.round(baseOutputs.monthlyPaymentAttending * 1.5);
      return {
        ...inputs,
        pslfEnabled: false,
        monthlyPaymentOverride: aggressiveMonthly,
        scenarioPreset: 'aggressive',
      };
    }
    case 'pslf-optimized':
      return {
        ...inputs,
        pslfEnabled: inputs.loanType === 'federal',
        monthlyPaymentOverride: undefined,
        scenarioPreset: 'pslf-optimized',
      };
    case 'minimum':
      return {
        ...inputs,
        pslfEnabled: false,
        monthlyPaymentOverride: undefined,
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

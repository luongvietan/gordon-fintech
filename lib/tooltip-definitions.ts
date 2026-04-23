/**
 * Glossary definitions for the in-calculator `<Tooltip>` component.
 *
 * These are intentionally kept short (1–2 sentences) — just enough to
 * answer "what does this jargon mean?" without forcing a context switch.
 * Longer, calculation-specific explanations live inside the existing
 * `ExplainPopover` ("See breakdown") where we show formulas, input
 * values, and plain-English walkthroughs.
 *
 * Keep definitions neutral + site-voice:
 *   • No "you should …" imperatives — tooltips describe, not advise.
 *   • No dollar figures, no conditional phrasing ("if you qualify …").
 *   • Reference authoritative terminology (studentaid.gov / IRS).
 */

export interface TooltipDefinition {
  /** Display label rendered as the bold header inside the tooltip. */
  term: string;
  /** One-to-two sentence definition shown under the term. */
  definition: string;
}

export const TOOLTIP_DEFINITIONS = {
  trueTotalCost: {
    term: 'True total cost',
    definition:
      'The total amount paid on your loans plus the opportunity cost of money you could have invested instead. It captures the real, after-tax price of a strategy — not just the payments that leave your bank account.',
  },
  netWorthCrossover: {
    term: 'Net-worth crossover',
    definition:
      'The year your net worth turns positive — when assets finally exceed liabilities and you start building wealth instead of digging out of debt.',
  },
  opportunityCost: {
    term: 'Opportunity cost',
    definition:
      "The investment returns you'd earn if the money you used for extra loan payments were invested instead. Calculated using your assumed market return.",
  },
  idr: {
    term: 'Income-driven repayment (IDR)',
    definition:
      'Federal repayment plans where the monthly payment is a fixed percentage of your discretionary income rather than a fixed amortization amount. SAVE, PAYE, and IBR are all IDR plans.',
  },
  pslf: {
    term: 'Public Service Loan Forgiveness (PSLF)',
    definition:
      'A federal program that forgives the remaining balance on Direct Loans after 120 qualifying monthly payments while working full-time for a nonprofit, government, or public-health employer.',
  },
  refinancing: {
    term: 'Refinancing',
    definition:
      'Replacing federal loans with a private loan at a new (usually lower) rate. This permanently ends PSLF eligibility and federal IDR protections — a one-way door.',
  },
  capitalization: {
    term: 'Capitalization',
    definition:
      'When unpaid interest is added to your principal balance. Once capitalized, future interest accrues on the larger balance, which compounds the cost over time.',
  },
  discretionaryIncome: {
    term: 'Discretionary income',
    definition:
      'Your adjusted gross income minus 150% of the federal poverty line for your family size. This is the figure IDR plans use to set your monthly payment.',
  },
} as const satisfies Record<string, TooltipDefinition>;

export type TooltipKey = keyof typeof TOOLTIP_DEFINITIONS;

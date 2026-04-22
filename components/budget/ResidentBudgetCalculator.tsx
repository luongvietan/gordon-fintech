'use client';

import { useState, useMemo } from 'react';
import { povertyLine150 } from '@/lib/specialties';

// ── Cost-of-living multipliers by city tier ────────────────────────────────
const COL_TIERS = [
  { id: 'low',    label: 'Low COL (rural / small city)', multiplier: 1.00 },
  { id: 'medium', label: 'Medium COL (mid-size city)',   multiplier: 1.25 },
  { id: 'high',   label: 'High COL (NYC, SF, Boston)',   multiplier: 1.65 },
] as const;

type ColTier = (typeof COL_TIERS)[number]['id'];

// Baseline monthly living expenses for a single resident at low COL.
const BASE_EXPENSES = {
  rent:           1_400,
  food:           500,
  transport:      250,
  utilities:      120,
  misc:           230,
};

function idrMonthlyPayment(grossAnnual: number, familySize: number): number {
  const fpl = povertyLine150(familySize);
  const discretionary = Math.max(0, grossAnnual - fpl);
  return Math.round((discretionary * 0.10) / 12);
}

function afterTaxMonthly(grossAnnual: number, taxRate: number): number {
  return Math.round((grossAnnual * (1 - taxRate / 100)) / 12);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ResidentBudgetCalculator() {
  const [grossStipend, setGrossStipend] = useState(65_000);
  const [pgyYear, setPgyYear]           = useState(1);
  const [colTier, setColTier]           = useState<ColTier>('medium');
  const [familySize, setFamilySize]     = useState(1);
  const [taxRate, setTaxRate]           = useState(22);

  const col = COL_TIERS.find((t) => t.id === colTier)!;

  const results = useMemo(() => {
    const stipend = grossStipend + (pgyYear - 1) * 2_000; // ~$2K raise per PGY year
    const atMonthly    = afterTaxMonthly(stipend, taxRate);
    const idrPayment   = idrMonthlyPayment(stipend, familySize);
    const expenses     = Object.entries(BASE_EXPENSES).reduce<Record<string, number>>(
      (acc, [k, v]) => {
        acc[k] = Math.round(v * col.multiplier);
        return acc;
      },
      {},
    );
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const afterLoansAndExpenses = atMonthly - idrPayment - totalExpenses;
    return { stipend, atMonthly, idrPayment, expenses, totalExpenses, afterLoansAndExpenses };
  }, [grossStipend, pgyYear, colTier, familySize, taxRate, col.multiplier]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
      {/* ── Inputs ── */}
      <div className="flex flex-col gap-4 bg-white rounded-[var(--r-card)] p-5 md:p-6" style={{ boxShadow: 'var(--shadow-ring)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Your situation
        </p>

        <Field label="Base PGY-1 stipend (annual gross)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[color:var(--text-muted)]">$</span>
            <input
              type="number"
              className="w-full pl-7 pr-3 py-2.5 rounded-[var(--r-input,8px)] border border-[color:var(--border-subtle)] text-[14px] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-wise-green)]"
              min={40_000}
              max={120_000}
              step={1_000}
              value={grossStipend}
              onChange={(e) => setGrossStipend(Number(e.target.value))}
            />
          </div>
          <p className="text-[11px] text-[color:var(--text-muted)] mt-1">
            AAMC 2024 median PGY-1: ~$65K. Each PGY year adds ~$2K.
          </p>
        </Field>

        <Field label="PGY year">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setPgyYear(y)}
                className={`flex-1 py-2 rounded-[var(--r-card-sm)] text-[13px] font-bold transition-colors ${
                  pgyYear === y
                    ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
                    : 'bg-[color:var(--color-off-white)] text-[color:var(--text-secondary)] hover:bg-[color:var(--color-light-mint)]'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Cost of living">
          <div className="flex flex-col gap-1.5">
            {COL_TIERS.map((t) => (
              <label key={t.id} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="col-tier"
                  value={t.id}
                  checked={colTier === t.id}
                  onChange={() => setColTier(t.id)}
                  className="accent-[color:var(--color-wise-green)]"
                />
                <span className="text-[13px] font-medium text-[color:var(--color-near-black)]">
                  {t.label}
                </span>
              </label>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Family size">
            <input
              type="number"
              className="w-full px-3 py-2.5 rounded-[var(--r-input,8px)] border border-[color:var(--border-subtle)] text-[14px] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-wise-green)]"
              min={1}
              max={8}
              step={1}
              value={familySize}
              onChange={(e) => setFamilySize(Number(e.target.value))}
            />
            <p className="text-[11px] text-[color:var(--text-muted)] mt-1">Affects IDR poverty-line floor</p>
          </Field>
          <Field label="Estimated tax rate">
            <div className="relative">
              <input
                type="number"
                className="w-full px-3 pr-7 py-2.5 rounded-[var(--r-input,8px)] border border-[color:var(--border-subtle)] text-[14px] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-wise-green)]"
                min={10}
                max={45}
                step={1}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[color:var(--text-muted)]">%</span>
            </div>
            <p className="text-[11px] text-[color:var(--text-muted)] mt-1">Federal + state blended</p>
          </Field>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="flex flex-col gap-3">
        <div className="bg-[color:var(--color-near-black)] text-white rounded-[var(--r-card)] p-5 md:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 mb-1">
            PGY-{pgyYear} estimated gross stipend
          </p>
          <p className="text-[2.5rem] font-black tabular-nums leading-none tracking-[-0.025em]" style={{ fontFamily: 'var(--font-numbers)' }}>
            ${results.stipend.toLocaleString()}
          </p>
          <p className="text-[12px] text-white/55 font-medium mt-1">
            After {taxRate}% tax: <strong className="text-white">${results.atMonthly.toLocaleString()}/mo</strong>
          </p>
        </div>

        <div className="bg-white rounded-[var(--r-card)] p-5 md:p-6" style={{ boxShadow: 'var(--shadow-ring)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] mb-3">
            Monthly budget breakdown
          </p>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <BudgetRow label="After-tax income" value={results.atMonthly} positive />
            <div className="border-t border-[color:var(--border-subtle)] pt-2.5 flex flex-col gap-2">
              <BudgetRow label="Rent (estimated)" value={-results.expenses.rent} />
              <BudgetRow label="Food & groceries" value={-results.expenses.food} />
              <BudgetRow label="Transportation" value={-results.expenses.transport} />
              <BudgetRow label="Utilities" value={-results.expenses.utilities} />
              <BudgetRow label="Misc / personal" value={-results.expenses.misc} />
              <BudgetRow label="IDR loan payment" value={-results.idrPayment} accent />
            </div>
            <div className="border-t-2 border-[color:var(--color-near-black)] pt-2.5">
              <BudgetRow
                label="Remaining (savings potential)"
                value={results.afterLoansAndExpenses}
                bold
                positive={results.afterLoansAndExpenses >= 0}
                negative={results.afterLoansAndExpenses < 0}
              />
            </div>
          </div>
          <p className="text-[11px] text-[color:var(--text-muted)] mt-3 leading-snug">
            Expenses scaled to <strong>{col.label}</strong>. IDR payment uses 10% of discretionary income above 150% of the federal poverty line for a family of {familySize}.
          </p>
        </div>

        <div className="bg-[color:var(--color-light-mint)] rounded-[var(--r-card)] p-4 text-[12.5px] font-medium text-[color:var(--color-dark-green)] leading-snug" style={{ boxShadow: 'var(--shadow-ring)' }}>
          <strong>Tip:</strong> Contributing to your 403(b)/401(k) and HSA reduces your AGI,
          which lowers your IDR payment AND your tax bill. Even $200/month pre-tax
          contributions can improve your cash flow.
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold text-[color:var(--color-near-black)] uppercase tracking-[0.08em]">
        {label}
      </label>
      {children}
    </div>
  );
}

function BudgetRow({
  label,
  value,
  positive,
  negative,
  bold,
  accent,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
  bold?: boolean;
  accent?: boolean;
}) {
  const color = accent
    ? 'text-[#b5651d]'
    : positive
    ? 'text-[color:var(--color-dark-green)]'
    : negative
    ? 'text-red-600'
    : 'text-[color:var(--text-primary)]';

  return (
    <div className={`flex justify-between items-center gap-3 ${bold ? 'font-bold' : 'font-semibold'}`}>
      <span className="text-[color:var(--text-secondary)]">{label}</span>
      <span className={`tabular-nums ${color}`}>
        {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}/mo
      </span>
    </div>
  );
}

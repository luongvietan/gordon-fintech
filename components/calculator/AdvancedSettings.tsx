'use client';

import type { CalculatorInputs } from '@/lib/calculator';
import NumberField from '@/components/ui/NumberField';
import Slider from '@/components/ui/Slider';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import Tooltip from '@/components/ui/Tooltip';

interface Props {
  inputs: CalculatorInputs;
  onChange: (updated: Partial<CalculatorInputs>) => void;
}

const IDR_PLANS = [
  { pct: 0.10, label: 'SAVE / PAYE / IBR (2014+)', note: '10% of discretionary income — default for most borrowers' },
  { pct: 0.15, label: 'IBR (pre-2014 loans)', note: '15% of discretionary income — older borrowers who have not switched' },
] as const;

export default function AdvancedSettings({ inputs, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceBadge
          source="IRS + HHS"
          title="Tax and poverty-line assumptions follow current IRS and HHS guidance, with optional overrides for edge cases."
          compact
        />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <Slider
          label="Effective tax rate"
          displayValue={`${inputs.taxRate}%`}
          min={15}
          max={50}
          step={1}
          value={inputs.taxRate}
          onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
        />
        <NumberField
          label=""
          suffix="%"
          min={15}
          max={50}
          step={1}
          value={inputs.taxRate}
          onValueChange={(v) => onChange({ taxRate: v })}
          hint=""
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <Slider
          label="CPI inflation"
          displayValue={`${inputs.inflationRate.toFixed(1)}%`}
          min={0}
          max={5}
          step={0.1}
          value={inputs.inflationRate}
          onChange={(e) => onChange({ inflationRate: Number(e.target.value) })}
        />
        <NumberField
          label=""
          suffix="%"
          min={0}
          max={5}
          step={0.1}
          allowDecimals
          value={inputs.inflationRate}
          onValueChange={(v) => onChange({ inflationRate: v })}
          hint=""
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <Slider
          label="Expected market return"
          displayValue={`${inputs.investmentReturn.toFixed(1)}%`}
          min={0}
          max={12}
          step={0.5}
          value={inputs.investmentReturn}
          onChange={(e) => onChange({ investmentReturn: Number(e.target.value) })}
        />
        <NumberField
          label=""
          suffix="%"
          min={0}
          max={12}
          step={0.5}
          allowDecimals
          value={inputs.investmentReturn}
          onValueChange={(v) => onChange({ investmentReturn: v })}
          hint=""
        />
      </div>

      <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed -mt-1">
        Tax + inflation drive after-tax income; market return is the opportunity
        cost of overpaying loans vs investing.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <NumberField
          label="Salary growth (training)"
          suffix="%/yr"
          min={0}
          max={10}
          step={0.5}
          allowDecimals
          value={inputs.residentSalaryGrowthRate}
          onValueChange={(v) => onChange({ residentSalaryGrowthRate: v })}
        />
        <NumberField
          label="Salary growth (attending)"
          suffix="%/yr"
          min={0}
          max={10}
          step={0.5}
          allowDecimals
          value={inputs.attendingSalaryGrowthRate}
          onValueChange={(v) => onChange({ attendingSalaryGrowthRate: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[color:var(--border-subtle)]">
        <NumberField
          label="Living expenses (residency)"
          prefix="$"
          suffix="/mo"
          min={0}
          max={20000}
          step={100}
          value={inputs.livingExpensesResidency}
          onValueChange={(v) => onChange({ livingExpensesResidency: v })}
        />
        <NumberField
          label="Living expenses (attending)"
          prefix="$"
          suffix="/mo"
          min={0}
          max={50000}
          step={100}
          value={inputs.livingExpensesAttending}
          onValueChange={(v) => onChange({ livingExpensesAttending: v })}
        />
      </div>

      <details className="group rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 ring-1 ring-inset ring-[color:var(--border-subtle)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <span className="text-[13px] font-bold text-[color:var(--color-near-black)]">
            Advanced settings
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] group-open:hidden">
            Expert
          </span>
        </summary>

        <div className="mt-4 flex flex-col gap-3">
          {/* IDR plan selection */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--color-near-black)] mb-1.5 flex items-center">
              IDR plan
              <Tooltip termKey="idr" size="xs" />
            </p>
            <div className="flex flex-col gap-1.5">
              {IDR_PLANS.map((plan) => (
                <label key={plan.pct} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="idr-plan"
                    className="mt-0.5 accent-[color:var(--color-wise-green)]"
                    checked={Math.abs((inputs.idrPaymentPct ?? 0.10) - plan.pct) < 0.001}
                    onChange={() => onChange({ idrPaymentPct: plan.pct })}
                  />
                  <span className="text-[12px] font-semibold text-[color:var(--color-near-black)] leading-snug">
                    {plan.label}
                    <span className="font-medium text-[color:var(--text-muted)]"> — {plan.note}</span>
                  </span>
                </label>
              ))}
            </div>
            {/* Helper hint: the "2014+" label in the first radio is easy
                to miss, so we restate the guidance in plain English
                directly under the group. Borrowers who took loans after
                July 2014 are the overwhelming majority, so defaulting to
                SAVE/PAYE/IBR (10%) is the right nudge. */}
            <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed mt-2">
              Not sure which applies to you? Most borrowers who took out loans
              after July 2014 should select SAVE/PAYE/IBR.
            </p>
          </div>

          {/* Capitalization toggle */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-[color:var(--border-subtle)]">
            <input
              type="checkbox"
              className="mt-0.5 accent-[color:var(--color-wise-green)]"
              checked={inputs.capitalizeOnlyAfterTraining ?? false}
              onChange={(e) => onChange({ capitalizeOnlyAfterTraining: e.target.checked })}
            />
            <span className="text-[12px] font-semibold text-[color:var(--color-near-black)] leading-snug">
              <span className="inline-flex items-center">
                Defer interest capitalization to end of training
                <Tooltip termKey="capitalization" size="xs" />
              </span>
              <span className="block font-medium text-[color:var(--text-muted)] mt-0.5">
                Federal IDR: unpaid interest accrues without compounding during training, then capitalizes once at attending phase. Unchecked = worst-case monthly compounding.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-[color:var(--border-subtle)]">
            <NumberField
              label="MFS extra tax drag"
              suffix="%"
              min={0}
              max={8}
              step={0.5}
              allowDecimals
              value={inputs.mfsExtraTaxRatePct ?? 2}
              onValueChange={(v) => onChange({ mfsExtraTaxRatePct: v })}
              hint="Extra blended tax cost of filing separately vs jointly. Adjusts tax drag only — does not model spouse income or joint IDR calculations."
            />
            <NumberField
              label="Forgiveness tax override"
              suffix="%"
              min={0}
              max={50}
              step={0.5}
              allowDecimals
              clearable
              value={inputs.taxBombRateOverride}
              onValueChange={(v) => onChange({ taxBombRateOverride: v })}
              onClear={() => onChange({ taxBombRateOverride: undefined })}
              placeholder="Auto (IRS brackets)"
              hint="Optional manual override for IDR tax-bomb estimates."
            />
          </div>
        </div>
      </details>
    </div>
  );
}

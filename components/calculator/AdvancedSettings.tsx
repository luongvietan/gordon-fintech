'use client';

import type { CalculatorInputs } from '@/lib/calculator';
import NumberField from '@/components/ui/NumberField';
import Select from '@/components/ui/Select';
import Slider from '@/components/ui/Slider';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import Tooltip from '@/components/ui/Tooltip';
import {
  IDR_PLANS,
  resolveIdrPlan,
  type IdrPlanId,
} from '@/lib/idr-plans';

interface Props {
  inputs: CalculatorInputs;
  onChange: (updated: Partial<CalculatorInputs>) => void;
}

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
          {/* IDR plan selection.
              R3 feedback: the previous two-radio list ("10% vs 15%") made
              it look like we lumped SAVE, PAYE, and IBR into a single
              bucket. They have distinct forgiveness horizons and
              discretionary-income floors that materially move the
              tax-bomb number, so we surface them individually here. The
              dropdown writes to `idrPlan` and the engine honors each
              plan's paymentPct + fplMultiplier + forgivenessYears
              through `resolveIdrPlan()`. */}
          {(() => {
            const activePlan = resolveIdrPlan(inputs);
            return (
              <div className="flex flex-col gap-2">
                {/* Custom label so we can park the glossary tooltip
                    next to the text — the shared Select component
                    only accepts a string label. */}
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--color-near-black)] flex items-center">
                  IDR plan
                  <Tooltip termKey="idr" size="xs" />
                </p>
                <Select
                  value={activePlan.id}
                  onChange={(e) => {
                    const id = e.target.value as IdrPlanId;
                    const next = IDR_PLANS.find((p) => p.id === id);
                    if (!next) return;
                    onChange({
                      idrPlan: next.id,
                      idrPaymentPct: next.paymentPct,
                    });
                  }}
                  options={IDR_PLANS.map((p) => ({
                    value: p.id,
                    label: `${p.label} — ${p.summary}`,
                  }))}
                />
                <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed">
                  Not sure which applies? Most post-July-2014 borrowers land
                  on SAVE or PAYE. Plan choice affects monthly payment, the
                  forgiveness horizon, and the projected IDR tax bomb.
                </p>
                {activePlan.caveats && (
                  <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed italic">
                    {activePlan.caveats}
                  </p>
                )}
              </div>
            );
          })()}

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

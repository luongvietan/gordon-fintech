'use client';

import type { CalculatorInputs } from '@/lib/calculator';
import NumberField from '@/components/ui/NumberField';
import Slider from '@/components/ui/Slider';
import DataSourceBadge from '@/components/ui/DataSourceBadge';

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

      <Slider
        label="Effective tax rate"
        displayValue={`${inputs.taxRate}%`}
        min={25}
        max={40}
        step={1}
        value={inputs.taxRate}
        onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
      />
      <Slider
        label="CPI inflation"
        displayValue={`${inputs.inflationRate.toFixed(1)}%`}
        min={0}
        max={5}
        step={0.1}
        value={inputs.inflationRate}
        onChange={(e) => onChange({ inflationRate: Number(e.target.value) })}
      />
      <Slider
        label="Expected market return"
        displayValue={`${inputs.investmentReturn.toFixed(1)}%`}
        min={0}
        max={10}
        step={0.5}
        value={inputs.investmentReturn}
        onChange={(e) => onChange({ investmentReturn: Number(e.target.value) })}
      />

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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <NumberField
            label="MFS extra tax drag"
            suffix="%"
            min={0}
            max={8}
            step={0.5}
            allowDecimals
            value={inputs.mfsExtraTaxRatePct ?? 2}
            onValueChange={(v) => onChange({ mfsExtraTaxRatePct: v })}
            hint="Approximate extra blended tax cost when filing separately."
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
      </details>
    </div>
  );
}

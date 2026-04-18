'use client';

import { CalculatorInputs } from '@/lib/calculator';
import { SPECIALTIES } from '@/lib/specialties';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Slider from '@/components/ui/Slider';
import Toggle from '@/components/ui/Toggle';

interface Props {
  inputs: CalculatorInputs;
  onChange: (updated: Partial<CalculatorInputs>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] mb-3 mt-6 first:mt-0">
      {children}
    </p>
  );
}

export default function CalculatorInputsForm({ inputs, onChange }: Props) {
  const specialtyOptions = SPECIALTIES.map((s) => ({
    value: s.id,
    label: `${s.label} · $${Math.round(s.attendingSalary / 1000)}K · ${s.residencyYears}y`,
  }));

  const currentSpecialtyId =
    SPECIALTIES.find(
      (s) =>
        s.attendingSalary === inputs.attendingSalary &&
        s.residencyYears === inputs.residencyYears,
    )?.id ?? '';

  return (
    <div className="flex flex-col">

      {/* ── SPECIALTY ──────────────────────────────────── */}
      <SectionLabel>Specialty</SectionLabel>
      <div className="flex flex-col gap-3">
        <Select
          value={currentSpecialtyId}
          onChange={(e) => {
            const specialty = SPECIALTIES.find((s) => s.id === e.target.value);
            if (specialty)
              onChange({
                attendingSalary: specialty.attendingSalary,
                residencyYears: specialty.residencyYears,
              });
          }}
          options={[{ value: '', label: 'Choose a specialty…' }, ...specialtyOptions]}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Residency"
            suffix="yrs"
            type="number"
            min={1}
            max={10}
            step={1}
            value={inputs.residencyYears}
            onChange={(e) => onChange({ residencyYears: Number(e.target.value) })}
          />
          <Input
            label="Attending salary"
            prefix="$"
            type="number"
            min={100000}
            max={2000000}
            step={5000}
            value={inputs.attendingSalary}
            onChange={(e) => onChange({ attendingSalary: Number(e.target.value) })}
          />
        </div>
        <Input
          label="Salary growth per year"
          suffix="%/yr"
          type="number"
          min={0}
          max={10}
          step={0.5}
          value={inputs.salaryGrowthRate}
          onChange={(e) => onChange({ salaryGrowthRate: Number(e.target.value) })}
        />
      </div>

      {/* ── LOAN ──────────────────────────────────────── */}
      <SectionLabel>Loan</SectionLabel>
      <div className="flex flex-col gap-3">
        <Input
          label="Total student debt"
          prefix="$"
          type="number"
          min={10000}
          max={1000000}
          step={1000}
          value={inputs.totalDebt}
          onChange={(e) => onChange({ totalDebt: Number(e.target.value) })}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Interest rate"
            suffix="%"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={inputs.interestRate}
            onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
          />
          <Select
            label="Loan type"
            value={inputs.loanType}
            onChange={(e) =>
              onChange({
                loanType: e.target.value as 'federal' | 'private',
                pslfEnabled:
                  e.target.value === 'private' ? false : inputs.pslfEnabled,
              })
            }
            options={[
              { value: 'federal', label: 'Federal' },
              { value: 'private', label: 'Private' },
            ]}
          />
        </div>
      </div>

      {/* ── LIFESTYLE ────────────────────────────────── */}
      <SectionLabel>Living expenses</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="Residency"
          prefix="$"
          suffix="/mo"
          type="number"
          min={0}
          max={20000}
          step={100}
          value={inputs.livingExpensesResidency}
          onChange={(e) =>
            onChange({ livingExpensesResidency: Number(e.target.value) })
          }
        />
        <Input
          label="Attending"
          prefix="$"
          suffix="/mo"
          type="number"
          min={0}
          max={50000}
          step={100}
          value={inputs.livingExpensesAttending}
          onChange={(e) =>
            onChange({ livingExpensesAttending: Number(e.target.value) })
          }
        />
      </div>

      {/* ── TAX + INFLATION ──────────────────────────── */}
      <SectionLabel>Tax & inflation</SectionLabel>
      <div className="flex flex-col gap-4">
        <Slider
          label="Effective tax rate"
          displayValue={`${inputs.taxRate}%`}
          min={25}
          max={40}
          step={1}
          value={inputs.taxRate}
          onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
          hint="Federal + state blended — typical physician range is 28–35%."
        />
        <Slider
          label="CPI inflation"
          displayValue={`${inputs.inflationRate.toFixed(1)}%`}
          min={0}
          max={5}
          step={0.1}
          value={inputs.inflationRate}
          onChange={(e) => onChange({ inflationRate: Number(e.target.value) })}
          hint="Applied to salaries + expenses. 2–3% is the Fed target."
        />
      </div>

      {/* ── INVESTMENT ASSUMPTION ────────────────────── */}
      <SectionLabel>Investment assumption</SectionLabel>
      <Slider
        label="Expected market return"
        displayValue={`${inputs.investmentReturn.toFixed(1)}%`}
        min={0}
        max={10}
        step={0.5}
        value={inputs.investmentReturn}
        onChange={(e) => onChange({ investmentReturn: Number(e.target.value) })}
        hint="Used to estimate the opportunity cost of paying off vs investing."
      />

      {/* ── REPAYMENT ────────────────────────────────── */}
      <SectionLabel>Repayment strategy</SectionLabel>
      <div className="flex flex-col gap-3">
        <Input
          label="Monthly payment override"
          prefix="$"
          type="number"
          min={0}
          max={50000}
          step={100}
          value={inputs.monthlyPaymentOverride ?? ''}
          placeholder="Auto (10-yr amortization)"
          onChange={(e) =>
            onChange({
              monthlyPaymentOverride: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          hint="Attending-phase override. Leave blank for 10-yr amortization."
        />

        {/* PSLF toggle */}
        <div
          className={`
            p-4 rounded-[var(--r-card-sm)] transition-colors duration-200
            ${inputs.pslfEnabled
              ? 'bg-[color:var(--color-light-mint)]'
              : 'bg-[color:var(--color-off-white)]'}
          `}
          style={{ boxShadow: 'var(--shadow-ring)' }}
        >
          <Toggle
            id="pslf-toggle"
            checked={inputs.pslfEnabled}
            onChange={(checked) => onChange({ pslfEnabled: checked })}
            disabled={inputs.loanType === 'private'}
            label="Model PSLF forgiveness"
            description={
              inputs.loanType === 'private'
                ? 'PSLF requires federal loans.'
                : '10 years of qualifying payments, then tax-free forgiveness.'
            }
          />
        </div>
      </div>

      <p className="text-[11px] text-[color:var(--text-muted)] mt-5 leading-relaxed">
        Estimates only. Tax, inflation, and investment-return assumptions compound
        annually. Not financial advice.
      </p>
    </div>
  );
}

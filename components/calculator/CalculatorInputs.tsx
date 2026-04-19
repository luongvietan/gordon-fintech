'use client';

import {
  ChevronDown,
  CircleDollarSign,
  GraduationCap,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { CalculatorInputs } from '@/lib/calculator';
import { SPECIALTIES } from '@/lib/specialties';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Slider from '@/components/ui/Slider';
import Toggle from '@/components/ui/Toggle';
import InputSection from './InputSection';

interface Props {
  inputs: CalculatorInputs;
  onChange: (updated: Partial<CalculatorInputs>) => void;
}

// ── Section icon glyphs (lucide-react) ───────────────────
const SECTION_ICON_CLASS = 'w-3.5 h-3.5';
const SECTION_ICON_STROKE = 1.75;

function IconCareer() {
  return <GraduationCap aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}
function IconLoan() {
  return <CircleDollarSign aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}
function IconStrategy() {
  return <TrendingUp aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}
function IconAssumptions() {
  return <SlidersHorizontal aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}

export default function CalculatorInputsForm({ inputs, onChange }: Props) {
  const specialtyOptions = SPECIALTIES.map((s) => ({
    value: s.id,
    label: `${s.label} \u00b7 $${Math.round(s.attendingSalary / 1000)}K \u00b7 ${
      s.trainingLabel ?? `${s.residencyYears}y`
    }`,
  }));

  const matchedSpecialty = SPECIALTIES.find((s) => {
    const totalTraining = inputs.residencyYears + (inputs.fellowshipYears ?? 0);
    return (
      s.attendingSalary === inputs.attendingSalary &&
      s.residencyYears === totalTraining
    );
  });
  const isCustom = !matchedSpecialty;
  const currentSpecialtyId = matchedSpecialty?.id ?? '__custom';

  const fellowshipYears = inputs.fellowshipYears ?? 0;
  const showFellowship = fellowshipYears > 0;

  // Section summaries shown in the collapsed-header right-aligned hint.
  const careerSummary = matchedSpecialty
    ? `${matchedSpecialty.label} \u00b7 $${Math.round(inputs.attendingSalary / 1000)}K`
    : `Custom \u00b7 $${Math.round(inputs.attendingSalary / 1000)}K`;
  const loanSummary = `$${Math.round(inputs.totalDebt / 1000)}K \u00b7 ${inputs.interestRate}% \u00b7 ${inputs.loanType === 'federal' ? 'Federal' : 'Private'}`;
  const strategySummary = inputs.pslfEnabled ? 'PSLF on' : 'Standard repayment';
  const assumptionsSummary = `${inputs.taxRate}% tax \u00b7 ${inputs.investmentReturn.toFixed(1)}% return`;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
          Your inputs
        </p>
        <p className="text-[11px] font-medium text-[color:var(--text-muted)]">
          {SPECIALTIES.length} specialty presets
        </p>
      </div>

      {/* ── 1. Career ────────────────────────────────────── */}
      <InputSection
        step={1}
        title="Career"
        hint={careerSummary}
        icon={<IconCareer />}
        defaultOpen
      >
        <Select
          label="Specialty"
          value={currentSpecialtyId}
          onChange={(e) => {
            const specialty = SPECIALTIES.find((s) => s.id === e.target.value);
            if (specialty) {
              const fellow = specialty.fellowshipYears ?? 0;
              const residencyOnly = Math.max(1, specialty.residencyYears - fellow);
              onChange({
                attendingSalary: specialty.attendingSalary,
                residencyYears: residencyOnly,
                fellowshipYears: fellow,
              });
            }
          }}
          options={
            isCustom
              ? [
                  { value: '__custom', label: 'Custom (manually tuned)' },
                  ...specialtyOptions,
                ]
              : [
                  { value: '', label: 'Choose a specialty\u2026' },
                  ...specialtyOptions,
                ]
          }
          hint={
            isCustom
              ? 'Tweaked off the preset \u2014 pick a specialty to reset.'
              : undefined
          }
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
          label="Residency stipend"
          prefix="$"
          suffix="/yr"
          type="number"
          min={40000}
          max={150000}
          step={1000}
          value={inputs.residencyStartingSalary}
          onChange={(e) =>
            onChange({ residencyStartingSalary: Number(e.target.value) })
          }
        />

        {showFellowship ? (
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label="Fellowship"
              suffix="yrs"
              type="number"
              min={0}
              max={6}
              step={1}
              value={fellowshipYears}
              onChange={(e) => onChange({ fellowshipYears: Number(e.target.value) })}
            />
            <Input
              label="Fellowship salary"
              prefix="$"
              type="number"
              min={40000}
              max={200000}
              step={1000}
              value={inputs.fellowshipSalary ?? 75000}
              onChange={(e) => onChange({ fellowshipSalary: Number(e.target.value) })}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              onChange({
                fellowshipYears: 2,
                fellowshipSalary: inputs.fellowshipSalary ?? 75000,
              })
            }
            className="self-start text-[12px] font-semibold text-[color:var(--color-dark-green)] hover:underline"
          >
            + Add fellowship phase
          </button>
        )}
      </InputSection>

      {/* ── 2. Loans ─────────────────────────────────────── */}
      <InputSection
        step={2}
        title="Loans"
        hint={loanSummary}
        icon={<IconLoan />}
        defaultOpen
      >
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
      </InputSection>

      {/* ── 3. Repayment strategy ───────────────────────── */}
      <InputSection
        step={3}
        title="Repayment"
        hint={strategySummary}
        icon={<IconStrategy />}
      >
        {/* PSLF block — fill change instead of extra ring so the section
            feels lighter when PSLF is off. */}
        <div
          className={`
            p-4 rounded-[var(--r-card-sm)] transition-colors duration-200 flex flex-col gap-3
            ${inputs.pslfEnabled
              ? 'bg-[color:var(--color-light-mint)]'
              : 'bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)]'}
          `}
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
                : '120 qualifying payments at a 501(c)(3), then tax-free forgiveness.'
            }
          />

          {inputs.pslfEnabled && inputs.loanType === 'federal' && (
            <div className="pl-[60px]">
              <Toggle
                id="pslf-residency-qualifies"
                checked={inputs.pslfResidencyQualifies ?? true}
                onChange={(checked) =>
                  onChange({ pslfResidencyQualifies: checked })
                }
                label="Residency employer is PSLF-qualified"
                description="Most academic & non-profit hospital programs qualify. Toggle off if your training is at a for-profit site."
              />
            </div>
          )}
        </div>

        {inputs.loanType === 'federal' && (
          <div className="p-4 rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)]">
            <Toggle
              id="capitalize-after-training"
              checked={inputs.capitalizeOnlyAfterTraining ?? false}
              onChange={(checked) =>
                onChange({ capitalizeOnlyAfterTraining: checked })
              }
              label="Capitalize interest only after training"
              description="Realistic federal IDR behavior."
            />
          </div>
        )}

        <details className="group rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 ring-1 ring-inset ring-[color:var(--border-subtle)]">
          <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
            <span className="text-[13px] font-bold text-[color:var(--color-near-black)]">
              Override monthly payments
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] group-open:hidden">
              Advanced
            </span>
            <ChevronDown
              aria-hidden="true"
              className="w-2.5 h-2.5 text-[color:var(--text-muted)] transition-transform group-open:rotate-180"
              strokeWidth={2}
            />
          </summary>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Training-phase payment"
              prefix="$"
              suffix="/mo"
              type="number"
              min={0}
              max={50000}
              step={100}
              value={inputs.monthlyPaymentResidencyOverride ?? ''}
              placeholder="Auto"
              onChange={(e) =>
                onChange({
                  monthlyPaymentResidencyOverride: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              label="Attending-phase payment"
              prefix="$"
              suffix="/mo"
              type="number"
              min={0}
              max={50000}
              step={100}
              value={inputs.monthlyPaymentOverride ?? ''}
              placeholder="Auto (10-yr amortization)"
              onChange={(e) =>
                onChange({
                  monthlyPaymentOverride: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed">
              Leave blank for the model defaults: federal IDR floor during training,
              10-year amortization once attending.
            </p>
          </div>
        </details>
      </InputSection>

      {/* ── 4. Assumptions (collapsed) ──────────────────── */}
      <InputSection
        step={4}
        title="Assumptions"
        hint={assumptionsSummary}
        icon={<IconAssumptions />}
      >
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
          Tax + inflation drive after-tax income; market return is the
          opportunity cost of overpaying loans vs investing.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Salary growth (training)"
            suffix="%/yr"
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={inputs.residentSalaryGrowthRate}
            onChange={(e) =>
              onChange({ residentSalaryGrowthRate: Number(e.target.value) })
            }
          />
          <Input
            label="Salary growth (attending)"
            suffix="%/yr"
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={inputs.attendingSalaryGrowthRate}
            onChange={(e) =>
              onChange({ attendingSalaryGrowthRate: Number(e.target.value) })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[color:var(--border-subtle)]">
          <Input
            label="Living expenses (residency)"
            prefix="$"
            suffix="/mo"
            type="number"
            min={0}
            max={20000}
            step={100}
            value={inputs.livingExpensesResidency}
            onChange={(e) => onChange({ livingExpensesResidency: Number(e.target.value) })}
          />
          <Input
            label="Living expenses (attending)"
            prefix="$"
            suffix="/mo"
            type="number"
            min={0}
            max={50000}
            step={100}
            value={inputs.livingExpensesAttending}
            onChange={(e) => onChange({ livingExpensesAttending: Number(e.target.value) })}
          />
        </div>
      </InputSection>

      <p className="text-[11px] text-[color:var(--text-muted)] mt-3 leading-relaxed px-1">
        Estimates only. Not financial, tax, or legal advice.
      </p>
    </div>
  );
}

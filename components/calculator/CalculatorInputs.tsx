'use client';

import {
  AlertTriangle,
  ChevronDown,
  CircleDollarSign,
  GraduationCap,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { CalculatorInputs } from '@/lib/calculator';
import { SPECIALTIES } from '@/lib/specialties';
import Input from '@/components/ui/Input';
import NumberField from '@/components/ui/NumberField';
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
          <NumberField
            label="Residency"
            suffix="yrs"
            min={1}
            max={10}
            step={1}
            value={inputs.residencyYears}
            onValueChange={(v) => onChange({ residencyYears: v })}
          />
          <NumberField
            label="Attending salary"
            prefix="$"
            min={0}
            max={2000000}
            step={5000}
            value={inputs.attendingSalary}
            onValueChange={(v) => onChange({ attendingSalary: v })}
            hint="via MGMA 2024"
          />
        </div>
        <NumberField
          label="Residency stipend"
          prefix="$"
          suffix="/yr"
          min={0}
          max={150000}
          step={1000}
          value={inputs.residencyStartingSalary}
          onValueChange={(v) => onChange({ residencyStartingSalary: v })}
          hint="via AAMC Resident Survey"
        />

        {showFellowship ? (
          <div className="grid grid-cols-2 gap-2.5">
            <NumberField
              label="Fellowship"
              suffix="yrs"
              min={0}
              max={6}
              step={1}
              value={fellowshipYears}
              onValueChange={(v) => onChange({ fellowshipYears: v })}
            />
            <NumberField
              label="Fellowship salary"
              prefix="$"
              min={0}
              max={200000}
              step={1000}
              value={inputs.fellowshipSalary ?? 75000}
              onValueChange={(v) => onChange({ fellowshipSalary: v })}
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
        <NumberField
          label="Total student debt"
          prefix="$"
          min={0}
          max={1000000}
          step={1000}
          value={inputs.totalDebt}
          onValueChange={(v) => onChange({ totalDebt: v })}
          hint="via AAMC GQ median"
        />
        <div className="grid grid-cols-2 gap-2.5">
          <NumberField
            label="Interest rate"
            suffix="%"
            min={0}
            max={15}
            step={0.01}
            allowDecimals
            value={inputs.interestRate}
            onValueChange={(v) => onChange({ interestRate: v })}
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

          {inputs.pslfEnabled && inputs.loanType === 'federal' && (
            // Consolidation trap: borrowers with legacy FFEL or Perkins loans
            // are often shocked to learn those types can't count toward PSLF
            // until they're consolidated into a Direct Consolidation Loan,
            // and that consolidating *resets* qualifying payments. This
            // callout is flagged by PSLF servicers as the #1 costly mistake
            // for new enrollees, so we surface it inline the moment PSLF is
            // turned on — not buried in a methodology page.
            <div
              role="note"
              className="flex items-start gap-2.5 p-3 rounded-[var(--r-card-sm)] bg-[#fff4e6] ring-1 ring-inset ring-[#e8a87c]/40"
            >
              <AlertTriangle
                aria-hidden="true"
                className="w-3.5 h-3.5 mt-[2px] flex-shrink-0 text-[#b5651d]"
                strokeWidth={2.25}
              />
              <div className="text-[11.5px] leading-snug">
                <p className="font-bold text-[#7a3f0a] mb-0.5">
                  PSLF requires Direct Loans
                </p>
                <p className="text-[#7a3f0a]/85 font-medium">
                  Have FFEL or Perkins loans? You&rsquo;ll need to consolidate
                  into a Direct Consolidation Loan first &mdash; and
                  consolidation restarts your qualifying payment count. Add
                  roughly 6&ndash;12 months to the timeline modeled here.
                </p>
              </div>
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
      </InputSection>

      <p className="text-[11px] text-[color:var(--text-muted)] mt-3 leading-relaxed px-1">
        Estimates only. Not financial, tax, or legal advice.
      </p>
    </div>
  );
}

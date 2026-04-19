'use client';

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

// ── Section icon glyphs ───────────────────────────────────
function IconBriefcase() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.75" y="3.5" width="10.5" height="8" rx="1.25" />
      <path d="M5 3.5V2.25C5 1.84 5.34 1.5 5.75 1.5h2.5c.41 0 .75.34.75.75V3.5" />
      <path d="M1.75 7h10.5" />
    </svg>
  );
}
function IconLoan() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="5.25" />
      <path d="M7 4.25v5.5M5.25 5.5h2.62a1.13 1.13 0 0 1 0 2.25H6.13a1.13 1.13 0 0 0 0 2.25h2.62" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 6.5 7 2l5 4.5V11.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5z" />
      <path d="M5.5 12.5V8h3v4.5" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 11.5h10" />
      <path d="M3.5 11.5V8M6.25 11.5V5M9 11.5V7.5M11.75 11.5V3" />
    </svg>
  );
}
function IconStrategy() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 11.5 6 7.5 8.5 10l3.5-4" />
      <path d="M9 6h3v3" />
    </svg>
  );
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

  const debtSummary = `$${Math.round(inputs.totalDebt / 1000)}K \u00b7 ${inputs.interestRate}% \u00b7 ${inputs.loanType === 'federal' ? 'Federal' : 'Private'}`;
  const careerSummary = matchedSpecialty
    ? `${matchedSpecialty.label} \u00b7 $${Math.round(inputs.attendingSalary / 1000)}K`
    : `Custom \u00b7 $${Math.round(inputs.attendingSalary / 1000)}K`;
  const livingSummary = `$${(inputs.livingExpensesResidency / 1000).toFixed(1)}K \u2192 $${(inputs.livingExpensesAttending / 1000).toFixed(1)}K /mo`;
  const taxSummary = `${inputs.taxRate}% tax \u00b7 ${inputs.investmentReturn.toFixed(1)}% return`;
  const strategySummary = inputs.pslfEnabled ? 'PSLF on' : 'Standard repayment';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] mb-1">
        Your inputs
      </p>

      {/* ── Career ──────────────────────────────────────── */}
      <InputSection
        step={1}
        title="Career &amp; specialty"
        hint={careerSummary}
        icon={<IconBriefcase />}
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

      {/* ── Loans ───────────────────────────────────────── */}
      <InputSection
        step={2}
        title="Loans"
        hint={debtSummary}
        icon={<IconLoan />}
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

      {/* ── Living expenses ─────────────────────────────── */}
      <InputSection
        step={3}
        title="Living expenses"
        hint={livingSummary}
        icon={<IconHome />}
      >
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
            onChange={(e) => onChange({ livingExpensesResidency: Number(e.target.value) })}
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
            onChange={(e) => onChange({ livingExpensesAttending: Number(e.target.value) })}
          />
        </div>
      </InputSection>

      {/* ── Tax & investing ─────────────────────────────── */}
      <InputSection
        step={4}
        title="Tax &amp; investing"
        hint={taxSummary}
        icon={<IconChart />}
      >
        <Slider
          label="Effective tax rate"
          displayValue={`${inputs.taxRate}%`}
          min={25}
          max={40}
          step={1}
          value={inputs.taxRate}
          onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
          hint="Federal + state blended (typical physician range 28\u201335%)."
        />
        <Slider
          label="CPI inflation"
          displayValue={`${inputs.inflationRate.toFixed(1)}%`}
          min={0}
          max={5}
          step={0.1}
          value={inputs.inflationRate}
          onChange={(e) => onChange({ inflationRate: Number(e.target.value) })}
          hint="Applied to salaries + expenses. Fed target is 2\u20133%."
        />
        <Slider
          label="Expected market return"
          displayValue={`${inputs.investmentReturn.toFixed(1)}%`}
          min={0}
          max={10}
          step={0.5}
          value={inputs.investmentReturn}
          onChange={(e) => onChange({ investmentReturn: Number(e.target.value) })}
          hint="Used for opportunity cost of paying off vs investing."
        />
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
      </InputSection>

      {/* ── Repayment strategy ──────────────────────────── */}
      <InputSection
        step={5}
        title="Repayment strategy"
        hint={strategySummary}
        icon={<IconStrategy />}
      >
        {/* PSLF block */}
        <div
          className={`
            p-4 rounded-[var(--r-card-sm)] transition-colors duration-200 flex flex-col gap-3
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

        {/* Capitalization */}
        {inputs.loanType === 'federal' && (
          <div
            className="p-4 rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)]"
            style={{ boxShadow: 'var(--shadow-ring)' }}
          >
            <Toggle
              id="capitalize-after-training"
              checked={inputs.capitalizeOnlyAfterTraining ?? false}
              onChange={(checked) =>
                onChange({ capitalizeOnlyAfterTraining: checked })
              }
              label="Capitalize interest only after training"
              description="Realistic federal IDR behavior. Off = worst-case monthly compounding."
            />
          </div>
        )}

        {/* Payment overrides — advanced, hidden behind a sub-disclosure */}
        <details className="group rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4" style={{ boxShadow: 'var(--shadow-ring)' }}>
          <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
            <span className="text-[13px] font-bold text-[color:var(--color-near-black)]">
              Override monthly payments
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] group-open:hidden">
              Advanced
            </span>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-[color:var(--text-muted)] transition-transform group-open:rotate-180">
              <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

      <p className="text-[11px] text-[color:var(--text-muted)] mt-3 leading-relaxed px-1">
        Estimates only. Forgiveness, tax treatment, and loan-program rules may
        change. Not financial, tax, or legal advice.
      </p>
    </div>
  );
}

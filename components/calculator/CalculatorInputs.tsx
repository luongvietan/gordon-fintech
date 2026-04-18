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
    // PDF-accurate range when a specialty has variable training length
    // (e.g. Cardiology 6–8y, General Surgery 5–7y, EM 3–4y).
    label: `${s.label} · $${Math.round(s.attendingSalary / 1000)}K · ${
      s.trainingLabel ?? `${s.residencyYears}y`
    }`,
  }));

  const matchedSpecialty = SPECIALTIES.find((s) => {
    const totalTraining =
      inputs.residencyYears + (inputs.fellowshipYears ?? 0);
    return (
      s.attendingSalary === inputs.attendingSalary &&
      s.residencyYears === totalTraining
    );
  });
  const isCustom = !matchedSpecialty;
  const currentSpecialtyId = matchedSpecialty?.id ?? '__custom';

  const fellowshipYears = inputs.fellowshipYears ?? 0;
  const showFellowship = fellowshipYears > 0;

  return (
    <div className="flex flex-col">

      {/* ── SPECIALTY ──────────────────────────────────── */}
      <SectionLabel>
        <span className="inline-flex items-center gap-2">
          Specialty
          {isCustom && (
            <span className="px-1.5 py-0.5 rounded-[var(--r-pill)] text-[9px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)] normal-case tracking-normal">
              Custom
            </span>
          )}
        </span>
      </SectionLabel>
      <div className="flex flex-col gap-3">
        <Select
          value={currentSpecialtyId}
          onChange={(e) => {
            const specialty = SPECIALTIES.find((s) => s.id === e.target.value);
            if (specialty) {
              // Split total training into residency-only + typical fellowship
              // when the specialty has a known fellowship (e.g. Cardio, GI).
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
                  { value: '', label: 'Choose a specialty…' },
                  ...specialtyOptions,
                ]
          }
          hint={
            isCustom
              ? 'You\u2019ve tweaked salary or training off the preset. Pick a specialty to reset to standard values.'
              : 'Some specialties have variable training length (e.g. 3–4y, 5–7y, 6–8y) — adjust if yours differs.'
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
            label="Attending salary (start)"
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
          label="Residency starting salary"
          prefix="$"
          type="number"
          min={40000}
          max={150000}
          step={1000}
          value={inputs.residencyStartingSalary}
          onChange={(e) =>
            onChange({ residencyStartingSalary: Number(e.target.value) })
          }
          hint="Typical PGY stipend; PDF default ~$65k."
        />

        {/* Fellowship — PDF v4: "Fellowship Modeling as extended low-income phases" */}
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
              onChange={(e) =>
                onChange({ fellowshipYears: Number(e.target.value) })
              }
              hint="Extended low-income phase after residency."
            />
            <Input
              label="Fellowship salary"
              prefix="$"
              type="number"
              min={40000}
              max={200000}
              step={1000}
              value={inputs.fellowshipSalary ?? 75000}
              onChange={(e) =>
                onChange({ fellowshipSalary: Number(e.target.value) })
              }
              hint="PGY-4+ stipend or fellow pay."
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
            className="self-start text-xs font-semibold text-[color:var(--color-dark-green)] hover:underline"
          >
            + Add fellowship phase
          </button>
        )}
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
          label="Monthly payment override (training)"
          prefix="$"
          type="number"
          min={0}
          max={50000}
          step={100}
          value={inputs.monthlyPaymentResidencyOverride ?? ''}
          placeholder="Auto — federal: IDR; private: interest-only"
          onChange={(e) =>
            onChange({
              monthlyPaymentResidencyOverride: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          hint="Standard repayment path during residency. Blank = model default by loan type."
        />
        <Input
          label="Monthly payment override (attending)"
          prefix="$"
          type="number"
          min={0}
          max={50000}
          step={100}
          value={inputs.monthlyPaymentOverride ?? ''}
          placeholder="Auto (10-yr amortization after training)"
          onChange={(e) =>
            onChange({
              monthlyPaymentOverride: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          hint="After residency: fixed monthly until paid off, unless blank (then 10-year amortization on balance)."
        />

        {/* PSLF toggle */}
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
                : '120 qualifying monthly payments (~10 years) on an IDR plan, then forgiveness of the remaining federal balance.'
            }
          />

          {inputs.pslfEnabled && inputs.loanType === 'federal' && (
            <>
              <div className="pl-[60px]">
                <Toggle
                  id="pslf-residency-qualifies"
                  checked={inputs.pslfResidencyQualifies ?? true}
                  onChange={(checked) =>
                    onChange({ pslfResidencyQualifies: checked })
                  }
                  label="Residency employer PSLF-qualified"
                  description="Toggle ON if your training program is at a 501(c)(3) non-profit, government, or military hospital. OFF means training months do NOT count toward the 120 — the clock effectively starts at attending."
                />
              </div>

              <div
                className="rounded-[var(--r-card-sm)] px-3 py-2.5 text-[11px] leading-relaxed bg-white/60 text-[color:var(--color-dark-green)] border border-[color:var(--color-dark-green)]/15"
              >
                <strong className="font-bold">Heads up:</strong>{' '}
                Current federal law treats PSLF forgiveness as tax-free, but this
                is <em>not guaranteed under all future policy scenarios</em>. 20-
                and 25-year IDR forgiveness is separately taxable. These
                projections assume current rules.
              </div>
            </>
          )}
        </div>

        {/* Capitalization behavior — PDF: "Unpaid interest may capitalize…" */}
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
              description="Realistic federal IDR: unpaid interest accrues during training but does NOT compound until plan change / end of deferment, then capitalizes once. Turn OFF for the worst-case (monthly compound) projection."
            />
          </div>
        )}
      </div>

      <p className="text-[11px] text-[color:var(--text-muted)] mt-5 leading-relaxed">
        Estimates only. Tax, inflation, and investment-return assumptions compound
        annually. Forgiveness, tax treatment, and loan-program rules may change.
        Not financial, tax, or legal advice.
      </p>
    </div>
  );
}

'use client';

import {
  AlertTriangle,
  Briefcase,
  ChevronDown,
  CircleDollarSign,
  GraduationCap,
  RefreshCw,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react';
import { CalculatorInputs } from '@/lib/calculator';
import { SPECIALTIES } from '@/lib/specialties';
import { track } from '@/lib/analytics';
import { useExpertMode } from '@/hooks/useExpertMode';
import NumberField from '@/components/ui/NumberField';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import AdvancedSettings from './AdvancedSettings';
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
function IconRefi() {
  return <RefreshCw aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}
function IconHousehold() {
  return <Users aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}
function IconJobChange() {
  return <Briefcase aria-hidden="true" className={SECTION_ICON_CLASS} strokeWidth={SECTION_ICON_STROKE} />;
}

export default function CalculatorInputsForm({ inputs, onChange }: Props) {
  const [expert, setExpert] = useExpertMode();

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
  const refiSummary = inputs.refinanceEnabled
    ? `${inputs.refinanceRate ?? 4.5}% \u00b7 ${inputs.refinanceTermYears ?? 10}y`
    : 'Off';
  const householdSummary = inputs.spouseEnabled
    ? `${(inputs.filingStatus ?? 'mfj').toUpperCase()} \u00b7 $${Math.round(
        (inputs.spouseIncome ?? 0) / 1000,
      )}K spouse \u00b7 $${Math.round((inputs.spouseDebt ?? 0) / 1000)}K debt`
    : 'Single filer';
  const jobChangeSummary = inputs.jobChangeEnabled
    ? `Year ${inputs.jobChangeYear ?? 3} \u2192 $${Math.round(
        (inputs.jobChangeAttendingSalary ?? 0) / 1000,
      )}K${inputs.jobChangePslfQualifies ? '' : ' (PSLF off)'}`
    : 'Off';

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between mb-1.5 gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
          Your inputs
        </p>
        {/* Expert mode toggle — persists in localStorage so power users
            don't have to re-enable each visit. When off, the refi /
            household / job-change sections stay out of the way. */}
        <button
          type="button"
          onClick={() => setExpert(!expert)}
          aria-pressed={expert}
          className={`
            text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-[var(--r-pill)]
            transition-colors
            ${expert
              ? 'bg-[color:var(--color-dark-green)] text-white'
              : 'bg-[color:var(--color-off-white)] text-[color:var(--text-muted)] ring-1 ring-inset ring-[color:var(--border-subtle)] hover:ring-[color:var(--border-default)]'}
          `}
        >
          Expert mode · {expert ? 'on' : 'off'}
        </button>
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
              track('specialty_selected', { specialty_id: specialty.id });
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

        {/*
          Per-PGY override block. By default we compound residency stipend
          by (growth + inflation) — fine as a first pass, but real PGY
          raises don't always match the formula (some programs give flat
          $2k/yr, others scale faster). When the user opts in, we show
          one numeric input per residency year and commit the array to
          `residencySalaryByYear`; the calculator then prefers those
          values over the compounded default.
        */}
        <details className="group rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] p-4 ring-1 ring-inset ring-[color:var(--border-subtle)]">
          <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
            <span className="text-[13px] font-bold text-[color:var(--color-near-black)]">
              Override year-by-year stipend
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)] group-open:hidden">
              {inputs.residencySalaryByYear?.some((v) => typeof v === 'number' && v > 0)
                ? 'Customized'
                : 'Advanced'}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="w-2.5 h-2.5 text-[color:var(--text-muted)] transition-transform group-open:rotate-180"
              strokeWidth={2}
            />
          </summary>
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-[11.5px] text-[color:var(--text-muted)] leading-relaxed font-medium">
              Leave blank for the compounded default. Tune each PGY year
              independently when your program publishes real stipend
              figures or your fellowship salary deviates from residency.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: inputs.residencyYears + fellowshipYears }, (_, i) => {
                const pgyLabel = `PGY-${i + 1}`;
                const inResidency = i < inputs.residencyYears;
                const fallback = inResidency
                  ? Math.round(
                      inputs.residencyStartingSalary *
                        Math.pow(1 + inputs.residentSalaryGrowthRate / 100, i) *
                        Math.pow(1 + inputs.inflationRate / 100, i),
                    )
                  : inputs.fellowshipSalary ?? 75000;
                const current = inputs.residencySalaryByYear?.[i];
                return (
                  <NumberField
                    key={`pgy-${i}`}
                    label={pgyLabel}
                    prefix="$"
                    suffix="/yr"
                    min={0}
                    max={200000}
                    step={1000}
                    clearable
                    value={typeof current === 'number' ? current : undefined}
                    onValueChange={(v) => {
                      const next = [...(inputs.residencySalaryByYear ?? [])];
                      while (next.length < inputs.residencyYears + fellowshipYears) {
                        next.push(undefined);
                      }
                      next[i] = v > 0 ? v : undefined;
                      onChange({ residencySalaryByYear: next });
                    }}
                    onClear={() => {
                      const next = [...(inputs.residencySalaryByYear ?? [])];
                      if (i < next.length) {
                        next[i] = undefined;
                      }
                      const allEmpty = next.every((x) => typeof x !== 'number' || x <= 0);
                      onChange({ residencySalaryByYear: allEmpty ? undefined : next });
                    }}
                    placeholder={`Auto: $${Math.round(fallback / 1000)}K`}
                  />
                );
              })}
            </div>
            {inputs.residencySalaryByYear?.some((v) => typeof v === 'number' && v > 0) && (
              <button
                type="button"
                onClick={() => onChange({ residencySalaryByYear: undefined })}
                className="self-start text-[11.5px] font-bold text-[color:var(--color-dark-green)] hover:underline"
              >
                Reset all PGY overrides
              </button>
            )}
          </div>
        </details>

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
            {/*
              Both overrides use `clearable` so emptying the field lifts
              `undefined` (not 0) to the parent — which is how the
              calculator distinguishes "Auto" (model default) from
              "explicit $0/mo". NumberField gives us the same
              leading-zero / negative-value protection as the rest of
              the form; without it these advanced fields would be the
              last place the old `<Input type="number">` bugs could
              still surface.
            */}
            <NumberField
              label="Training-phase payment"
              prefix="$"
              suffix="/mo"
              min={0}
              max={50000}
              step={100}
              clearable
              value={inputs.monthlyPaymentResidencyOverride}
              onValueChange={(v) =>
                onChange({ monthlyPaymentResidencyOverride: v })
              }
              onClear={() =>
                onChange({ monthlyPaymentResidencyOverride: undefined })
              }
              placeholder="Auto"
            />
            <NumberField
              label="Attending-phase payment"
              prefix="$"
              suffix="/mo"
              min={0}
              max={50000}
              step={100}
              clearable
              value={inputs.monthlyPaymentOverride}
              onValueChange={(v) => onChange({ monthlyPaymentOverride: v })}
              onClear={() => onChange({ monthlyPaymentOverride: undefined })}
              placeholder="Auto (10-yr amortization)"
            />
            <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed">
              Leave blank for the model defaults: federal IDR floor during training,
              10-year amortization once attending.
            </p>
          </div>
        </details>
      </InputSection>

      {/* ── 4. Refinance (optional, expert-gated) ───────── */}
      {expert && (
      <InputSection
        step={4}
        title="Refinance"
        hint={refiSummary}
        icon={<IconRefi />}
      >
        <div
          className={`
            p-4 rounded-[var(--r-card-sm)] transition-colors duration-200 flex flex-col gap-3
            ${inputs.refinanceEnabled
              ? 'bg-[color:var(--color-light-mint)]'
              : 'bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)]'}
          `}
        >
          <Toggle
            id="refi-toggle"
            checked={!!inputs.refinanceEnabled}
            onChange={(checked) => onChange({ refinanceEnabled: checked })}
            label="Model private refinance"
            description="Compare a private refinance as a fourth strategy. Refinance happens the moment attending starts; federal IDR floor during training."
          />
        </div>

        {inputs.refinanceEnabled && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <NumberField
                label="Refi rate"
                suffix="%"
                min={0}
                max={15}
                step={0.01}
                allowDecimals
                value={inputs.refinanceRate ?? 4.5}
                onValueChange={(v) => onChange({ refinanceRate: v })}
              />
              <NumberField
                label="Refi term"
                suffix="yrs"
                min={1}
                max={20}
                step={1}
                value={inputs.refinanceTermYears ?? 10}
                onValueChange={(v) => onChange({ refinanceTermYears: v })}
              />
            </div>
            <NumberField
              label="Origination fee"
              suffix="%"
              min={0}
              max={5}
              step={0.1}
              allowDecimals
              value={inputs.refinanceOrigFeePct ?? 0}
              onValueChange={(v) => onChange({ refinanceOrigFeePct: v })}
              hint="Most physician refi lenders charge 0%."
            />

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
                  Refinancing is permanent
                </p>
                <p className="text-[#7a3f0a]/85 font-medium">
                  Refinancing converts federal loans to private. You&rsquo;ll
                  lose PSLF, IDR plans, federal forbearance, and the death /
                  disability discharge protections &mdash; forever. Only
                  attractive if you&rsquo;re certain you won&rsquo;t pursue
                  PSLF.
                </p>
              </div>
            </div>
          </>
        )}
      </InputSection>
      )}

      {/* ── 5. Household & filing (optional, expert-gated) ─ */}
      {expert && (
      <InputSection
        step={5}
        title="Household"
        hint={householdSummary}
        icon={<IconHousehold />}
      >
        <div
          className={`
            p-4 rounded-[var(--r-card-sm)] transition-colors duration-200 flex flex-col gap-3
            ${inputs.spouseEnabled
              ? 'bg-[color:var(--color-light-mint)]'
              : 'bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)]'}
          `}
        >
          <Toggle
            id="spouse-toggle"
            checked={!!inputs.spouseEnabled}
            onChange={(checked) =>
              onChange({
                spouseEnabled: checked,
                // Seed a sane filing status + family size on first enable so
                // the math starts in a reasonable place. Flip back to single
                // defaults on disable so the badge shows "Single filer".
                filingStatus: checked
                  ? inputs.filingStatus && inputs.filingStatus !== 'single'
                    ? inputs.filingStatus
                    : 'mfj'
                  : 'single',
                familySize: checked
                  ? Math.max(2, inputs.familySize ?? 2)
                  : 1,
              })
            }
            label="Model spouse / household income"
            description="Dual-income filing affects IDR payments (MFJ pulls spouse income into AGI; MFS shields it) and household net worth."
          />
        </div>

        {inputs.spouseEnabled && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <NumberField
                label="Spouse income"
                prefix="$"
                suffix="/yr"
                min={0}
                max={2_000_000}
                step={1000}
                value={inputs.spouseIncome ?? 0}
                onValueChange={(v) => onChange({ spouseIncome: v })}
              />
              <NumberField
                label="Spouse raise"
                suffix="%/yr"
                min={0}
                max={10}
                step={0.5}
                allowDecimals
                value={inputs.spouseIncomeGrowthRate ?? 3}
                onValueChange={(v) => onChange({ spouseIncomeGrowthRate: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <NumberField
                label="Spouse debt"
                prefix="$"
                min={0}
                max={1_000_000}
                step={1000}
                value={inputs.spouseDebt ?? 0}
                onValueChange={(v) => onChange({ spouseDebt: v })}
                hint="Household-only modeling. Used in net-worth and filing comparisons."
              />
              <Select
                label="Spouse repayment"
                value={inputs.spouseRepaymentStrategy ?? 'standard'}
                onChange={(e) =>
                  onChange({
                    spouseRepaymentStrategy: e.target.value as
                      | 'minimum'
                      | 'standard'
                      | 'aggressive',
                  })
                }
                options={[
                  { value: 'minimum', label: 'Minimum / interest-only' },
                  { value: 'standard', label: 'Standard 10-year' },
                  { value: 'aggressive', label: 'Aggressive payoff' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Select
                label="Filing status"
                value={inputs.filingStatus ?? 'mfj'}
                onChange={(e) =>
                  onChange({
                    filingStatus: e.target.value as 'mfj' | 'mfs',
                  })
                }
                options={[
                  { value: 'mfj', label: 'Married filing jointly' },
                  { value: 'mfs', label: 'Married filing separately' },
                ]}
              />
              <NumberField
                label="Household size"
                min={1}
                max={10}
                step={1}
                value={inputs.familySize ?? 2}
                onValueChange={(v) => onChange({ familySize: v })}
                hint="Kids + dependents lower IDR payments."
              />
            </div>

            {inputs.filingStatus === 'mfs' && (
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
                    MFS trade-off
                  </p>
                  <p className="text-[#7a3f0a]/85 font-medium">
                    Filing separately keeps your spouse&rsquo;s income off your
                    IDR payment, but typically raises your combined federal tax
                    by ~1&ndash;3% and disqualifies student-loan interest
                    deduction + several credits. Bump the tax rate below if you
                    want the full picture.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </InputSection>
      )}

      {/* ── 6. Job change (optional, expert-gated) ────── */}
      {expert && (
      <InputSection
        step={6}
        title="Job change"
        hint={jobChangeSummary}
        icon={<IconJobChange />}
      >
        <div
          className={`
            p-4 rounded-[var(--r-card-sm)] transition-colors duration-200 flex flex-col gap-3
            ${inputs.jobChangeEnabled
              ? 'bg-[color:var(--color-light-mint)]'
              : 'bg-[color:var(--color-off-white)] ring-1 ring-inset ring-[color:var(--border-subtle)]'}
          `}
        >
          <Toggle
            id="jobchange-toggle"
            checked={!!inputs.jobChangeEnabled}
            onChange={(checked) => onChange({ jobChangeEnabled: checked })}
            label="Model a mid-attending job change"
            description="Academic \u2192 private, nonprofit \u2192 for-profit, or any other salary step-change. Affects both your income and PSLF eligibility from that year forward."
          />
        </div>

        {inputs.jobChangeEnabled && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <NumberField
                label="Change at attending year"
                min={1}
                max={20}
                step={1}
                value={inputs.jobChangeYear ?? 3}
                onValueChange={(v) => onChange({ jobChangeYear: v })}
              />
              <NumberField
                label="New attending salary"
                prefix="$"
                suffix="/yr"
                min={0}
                max={2_000_000}
                step={5000}
                value={inputs.jobChangeAttendingSalary ?? 300000}
                onValueChange={(v) =>
                  onChange({ jobChangeAttendingSalary: v })
                }
                hint="Today's dollars. Growth + CPI re-base from this year."
              />
            </div>

            {inputs.pslfEnabled && inputs.loanType === 'federal' && (
              <div className="p-4 rounded-[var(--r-card-sm)] bg-white ring-1 ring-inset ring-[color:var(--border-subtle)]">
                <Toggle
                  id="jobchange-pslf-toggle"
                  checked={!!inputs.jobChangePslfQualifies}
                  onChange={(checked) =>
                    onChange({ jobChangePslfQualifies: checked })
                  }
                  label="New employer qualifies for PSLF"
                  description="If off, PSLF-qualifying payments freeze when the change takes effect \u2014 a common scenario when moving from academic/nonprofit to private practice."
                />
              </div>
            )}

            {inputs.pslfEnabled &&
              inputs.loanType === 'federal' &&
              !inputs.jobChangePslfQualifies && (
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
                      PSLF clock freezes
                    </p>
                    <p className="text-[#7a3f0a]/85 font-medium">
                      Months worked at a non-qualifying employer won&rsquo;t
                      count toward the 120-payment threshold. If you don&rsquo;t
                      return to a PSLF-qualifying job, the remaining balance
                      stays your responsibility &mdash; nothing gets forgiven.
                    </p>
                  </div>
                </div>
              )}
          </>
        )}
      </InputSection>
      )}

      {/* ── 7. Assumptions (collapsed) ──────────────────── */}
      <InputSection
        step={7}
        title="Assumptions"
        hint={assumptionsSummary}
        icon={<IconAssumptions />}
      >
        <AdvancedSettings inputs={inputs} onChange={onChange} />
      </InputSection>

      <p className="text-[11px] text-[color:var(--text-muted)] mt-3 leading-relaxed px-1">
        Estimates only. Not financial, tax, or legal advice.
      </p>
    </div>
  );
}

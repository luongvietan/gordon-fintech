'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface TrackerState {
  paymentsMade: number;
  employerType: 'nonprofit' | 'government' | 'publicService' | '';
  lastCertDate: string;
}

const TOTAL_PAYMENTS = 120;

function formatRemainingYears(remaining: number): string {
  const years = Math.ceil(remaining / 12);
  if (years <= 1) return '~1 year';
  return `~${years} years`;
}

function nextCertificationDate(lastCertDate: string): string | null {
  if (!lastCertDate) return null;
  try {
    const d = new Date(lastCertDate);
    if (isNaN(d.getTime())) return null;
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

/**
 * PSLF Progress Tracker
 *
 * Standalone component that shows how many of the 120 qualifying payments
 * a physician has made, how many remain, and when they should recertify.
 * Connects conceptually to the "Already making payments" inputs in the
 * main calculator (uses the same 120-payment framework).
 */
export default function PslfProgressTracker() {
  const [state, setState] = useState<TrackerState>({
    paymentsMade: 0,
    employerType: '',
    lastCertDate: '',
  });
  const [calculated, setCalculated] = useState(false);

  const paymentsMade = Math.min(Math.max(0, state.paymentsMade), TOTAL_PAYMENTS);
  const remaining = TOTAL_PAYMENTS - paymentsMade;
  const progressPct = Math.round((paymentsMade / TOTAL_PAYMENTS) * 100);

  const nextCert = useMemo(
    () => nextCertificationDate(state.lastCertDate),
    [state.lastCertDate],
  );

  function handleCalculate() {
    setCalculated(true);
  }

  return (
    <div
      className="rounded-[var(--r-card)] bg-white overflow-hidden"
      style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
    >
      {/* Header */}
      <div
        className="px-5 md:px-7 py-4 md:py-5 border-b border-[color:var(--border-subtle)]"
        style={{ background: 'var(--color-near-black)' }}
      >
        <h3
          className="text-base md:text-lg text-white tracking-[-0.015em] leading-none"
          style={{ fontWeight: 900 }}
        >
          PSLF Progress Tracker
        </h3>
        <p className="text-[12px] text-white/55 mt-1.5 font-medium">
          Track your path to 120 qualifying payments and tax-free forgiveness
        </p>
      </div>

      <div className="p-5 md:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Inputs */}
        <div className="flex flex-col gap-4">
          {/* Payments made */}
          <div>
            <label
              htmlFor="pslf-payments"
              className="block text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-1.5"
            >
              Qualifying payments made so far
            </label>
            <p className="text-[11px] text-[color:var(--text-muted)] font-medium mb-2">
              Includes PSLF consolidation credits from prior employment
            </p>
            <input
              id="pslf-payments"
              type="number"
              min={0}
              max={120}
              value={state.paymentsMade === 0 ? '' : state.paymentsMade}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setState((s) => ({
                  ...s,
                  paymentsMade: isNaN(v) ? 0 : Math.min(120, Math.max(0, v)),
                }));
                setCalculated(false);
              }}
              placeholder="e.g. 24"
              className="w-full rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--color-near-black)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)]"
            />
          </div>

          {/* Employer type */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-2">
              Qualifying employer type
            </p>
            <div className="flex flex-col gap-2">
              {[
                { id: 'nonprofit', label: 'Non-profit hospital (501(c)(3))' },
                { id: 'government', label: 'Government agency / VA' },
                { id: 'publicService', label: 'Public service organization' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="employer-type"
                    value={opt.id}
                    checked={state.employerType === opt.id}
                    onChange={() => {
                      setState((s) => ({ ...s, employerType: opt.id as TrackerState['employerType'] }));
                      setCalculated(false);
                    }}
                    className="w-4 h-4 accent-[color:var(--color-dark-green)]"
                  />
                  <span className="text-[13px] font-semibold text-[color:var(--color-near-black)]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Last certification date */}
          <div>
            <label
              htmlFor="pslf-cert-date"
              className="block text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-1.5"
            >
              Last PSLF certification date
            </label>
            <input
              id="pslf-cert-date"
              type="date"
              value={state.lastCertDate}
              onChange={(e) => {
                setState((s) => ({ ...s, lastCertDate: e.target.value }));
                setCalculated(false);
              }}
              className="w-full rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--color-near-black)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)]"
            />
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={paymentsMade === 0 && !state.employerType}
            className="mt-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-[var(--r-pill)] text-sm font-bold bg-[color:var(--color-near-black)] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            Calculate my remaining payments
          </button>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4">
          {calculated ? (
            <>
              {/* Progress bar */}
              <div>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <p
                    className="text-[1.5rem] text-[color:var(--color-near-black)] tracking-[-0.02em] leading-none tabular-nums"
                    style={{ fontWeight: 900 }}
                  >
                    {paymentsMade}{' '}
                    <span className="text-[1rem] text-[color:var(--text-muted)] font-bold">
                      of {TOTAL_PAYMENTS}
                    </span>
                  </p>
                  <span className="text-[13px] font-bold text-[color:var(--color-dark-green)]">
                    {progressPct}%
                  </span>
                </div>

                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-light-mint)' }}
                  role="progressbar"
                  aria-valuenow={paymentsMade}
                  aria-valuemin={0}
                  aria-valuemax={TOTAL_PAYMENTS}
                  aria-label={`${paymentsMade} of ${TOTAL_PAYMENTS} qualifying PSLF payments made`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: 'var(--color-dark-green)',
                    }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Remaining payments"
                  value={String(remaining)}
                  sub="to forgiveness"
                />
                <StatCard
                  label="At current pace"
                  value={formatRemainingYears(remaining)}
                  sub="to forgiveness"
                  accent
                />
                {paymentsMade >= TOTAL_PAYMENTS ? (
                  <div className="col-span-2 flex items-center gap-2 p-3 rounded-[var(--r-card-sm)] bg-[color:var(--color-light-mint)]">
                    <CheckCircle2
                      aria-hidden
                      className="w-4 h-4 text-[color:var(--color-dark-green)] flex-shrink-0"
                      strokeWidth={2}
                    />
                    <p className="text-[13px] font-bold text-[color:var(--color-dark-green)]">
                      You&rsquo;ve reached 120 qualifying payments! Apply for PSLF forgiveness now.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Certification reminder */}
              {nextCert && (
                <div
                  className="flex items-start gap-3 p-4 rounded-[var(--r-card-sm)]"
                  style={{ background: 'var(--color-light-mint)' }}
                >
                  <Clock
                    aria-hidden
                    className="w-4 h-4 text-[color:var(--color-dark-green)] flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-[13px] font-bold text-[color:var(--color-dark-green)]">
                      Next certification due: {nextCert}
                    </p>
                    <p className="text-[12px] font-medium text-[color:var(--color-dark-green)]/80 mt-0.5">
                      Submit your Employment Certification Form (ECF) annually to
                      ensure your payments keep counting toward forgiveness.
                    </p>
                  </div>
                </div>
              )}

              {/* Warning */}
              {!state.employerType && (
                <div
                  className="flex items-start gap-2 p-3 rounded-[var(--r-card-sm)] bg-amber-50 border border-amber-200"
                >
                  <AlertTriangle
                    aria-hidden
                    className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <p className="text-[12px] font-semibold text-amber-700">
                    Select your employer type to confirm PSLF eligibility.
                    Payments only count if your employer qualifies.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-light-mint)' }}
              >
                <Clock
                  aria-hidden
                  className="w-7 h-7 text-[color:var(--color-dark-green)]"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-[14px] font-semibold text-[color:var(--text-secondary)] max-w-xs">
                Enter your qualifying payments and hit calculate to see your path to
                PSLF forgiveness.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--r-card-sm)] p-4 flex flex-col gap-1 ${accent ? 'bg-[color:var(--color-wise-green)]' : 'bg-[color:var(--color-off-white)]'}`}
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.10em] ${accent ? 'text-[color:var(--color-dark-green)]/70' : 'text-[color:var(--text-muted)]'}`}
      >
        {label}
      </p>
      <p
        className={`text-[1.5rem] leading-none tabular-nums tracking-[-0.02em] ${accent ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--color-near-black)]'}`}
        style={{ fontWeight: 900 }}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] font-semibold ${accent ? 'text-[color:var(--color-dark-green)]/75' : 'text-[color:var(--text-muted)]'}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { CalculatorInputs } from '@/lib/calculator';

interface Props {
  inputs: CalculatorInputs;
}

const TOTAL_PAYMENTS = 120;

/** Returns "Month YYYY" for a date offset by `monthsAhead` from today. */
function estimateForgiveness(monthsAhead: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + Math.max(0, monthsAhead));
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * PSLF Progress Tracker tab.
 *
 * Tracks real-world progress toward 120 qualifying PSLF payments. Results
 * update live as the user types — no "calculate" button needed.
 *
 * Accepts the main form's `inputs` so it can use `residencyYears` to
 * inform the estimated forgiveness date projection.
 */
export default function PslfProgressTracker({ inputs }: Props) {
  const [paymentsMade, setPaymentsMade] = useState(0);

  const clamped = Math.min(Math.max(0, paymentsMade), TOTAL_PAYMENTS);
  const paymentsRemaining = TOTAL_PAYMENTS - clamped;
  const progressPct = Math.min((clamped / TOTAL_PAYMENTS) * 100, 100);

  // Each payment = 1 calendar month; project forward from today.
  const forgivenessMoYr = estimateForgiveness(paymentsRemaining);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Qualifying employer note ─────────────────────── */}
      <p className="text-[13px] font-semibold text-[color:var(--text-secondary)] leading-relaxed">
        PSLF requires employment at a 501(c)(3) nonprofit or government
        organization. Private practice does not qualify.
      </p>

      {/* ── Payments-made input ───────────────────────────── */}
      <div>
        <label
          htmlFor="pslf-tracker-payments"
          className="block text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-1.5"
        >
          Qualifying payments made so far
        </label>
        <input
          id="pslf-tracker-payments"
          type="number"
          min={0}
          max={120}
          value={paymentsMade === 0 ? '' : paymentsMade}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setPaymentsMade(isNaN(v) ? 0 : v);
          }}
          placeholder="0"
          className="w-full max-w-[200px] rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--color-near-black)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)]"
        />
      </div>

      {/* ── Progress bar ─────────────────────────────────── */}
      <div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--color-light-mint)' }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={TOTAL_PAYMENTS}
          aria-label={`${clamped} of ${TOTAL_PAYMENTS} qualifying PSLF payments made`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: '#84cc16' }}
          />
        </div>
        <p className="mt-2 text-[13px] font-semibold text-[color:var(--text-secondary)]">
          {clamped} / {TOTAL_PAYMENTS} qualifying payments
        </p>
      </div>

      {/* ── Completion callout ───────────────────────────── */}
      {clamped >= TOTAL_PAYMENTS && (
        <div
          className="flex items-start gap-3 p-4 rounded-[var(--r-card-sm)]"
          style={{ background: 'var(--color-light-mint)' }}
        >
          <CheckCircle2
            aria-hidden
            className="w-5 h-5 text-[color:var(--color-dark-green)] flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <p className="text-[14px] font-bold text-[color:var(--color-dark-green)]">
            You&rsquo;ve reached 120 qualifying payments! Apply for PSLF forgiveness now.
          </p>
        </div>
      )}

      {/* ── Estimated forgiveness date ───────────────────── */}
      {clamped < TOTAL_PAYMENTS && (
        <div
          className="rounded-[var(--r-card-sm)] p-4 flex flex-col gap-1"
          style={{ background: 'var(--color-off-white)', boxShadow: 'var(--shadow-ring)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)]">
            Estimated forgiveness date
          </p>
          <p
            className="text-[1.5rem] tracking-[-0.02em] text-[color:var(--color-near-black)] tabular-nums"
            style={{ fontWeight: 900 }}
          >
            {forgivenessMoYr}
          </p>
          <p className="text-[11px] font-semibold text-[color:var(--text-muted)]">
            {paymentsRemaining} payment{paymentsRemaining !== 1 ? 's' : ''} remaining &middot;{' '}
            based on {inputs.residencyYears}yr residency + 1 payment/month
          </p>
        </div>
      )}

      {/* ── Certification reminder callout ───────────────── */}
      <div
        className="flex items-start gap-3 p-4 rounded-[var(--r-card-sm)] border"
        style={{ background: '#fefce8', borderColor: '#fde047' }}
        role="note"
      >
        <AlertCircle
          aria-hidden
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: '#a16207' }}
          strokeWidth={2}
        />
        <p className="text-[13px] font-semibold leading-relaxed" style={{ color: '#713f12' }}>
          <span className="font-bold">Reminder:</span> Submit your Employment Certification Form
          (ECF) annually and whenever you change employers. Use the{' '}
          <a
            href="https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity"
          >
            PSLF Help Tool at studentaid.gov
          </a>
          .
        </p>
      </div>

      {/* ── Privacy note ─────────────────────────────────── */}
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--text-muted)]">
        <Info aria-hidden className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
        This tracker stays on your device — nothing is saved or sent.
      </p>
    </div>
  );
}

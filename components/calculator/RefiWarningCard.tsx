'use client';

import { AlertTriangle, X } from 'lucide-react';

/**
 * Prominent warning shown above the strategy comparison when the user enables
 * the private refinancing option. Refinancing is irreversible — the user gives
 * up all federal loan protections permanently — so this card is intentionally
 * high-contrast and hard to miss.
 */
export default function RefiWarningCard() {
  return (
    <div
      role="alert"
      className="rounded-[var(--r-card)] p-5 md:p-6 border-2 border-amber-500/60 bg-amber-50"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <div className="flex gap-3">
        <AlertTriangle
          aria-hidden
          className="flex-shrink-0 w-5 h-5 text-amber-600 mt-0.5"
          strokeWidth={2}
        />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-amber-900 mb-2 tracking-[-0.01em]">
            Refinancing permanently ends federal loan protections
          </p>
          <p className="text-[12px] text-amber-800/90 font-medium leading-relaxed mb-3">
            Converting to a private loan means you will <strong>immediately and
            permanently</strong> lose:
          </p>
          <ul className="text-[12px] text-amber-800/90 font-medium leading-relaxed space-y-1 mb-3">
            {[
              'Public Service Loan Forgiveness (PSLF) eligibility',
              'Income-Driven Repayment (IDR) plans — PAYE, SAVE, IBR, REPAYE',
              'Federal deferment, forbearance, and income-based payment floors',
              'Teacher and military loan forgiveness benefits',
              'Death and total-disability discharge protections',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <X aria-hidden className="flex-shrink-0 w-3.5 h-3.5 text-amber-600 mt-0.5" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-amber-900 font-semibold leading-snug">
            Refinancing is typically only beneficial if you have stable, high income,
            are certain you won&rsquo;t pursue public service work, and can pay off
            the loan quickly. <strong>Consult a fiduciary financial advisor before
            refinancing.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

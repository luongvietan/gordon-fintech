'use client';

import { useState } from 'react';
import { Check, Loader2, Mail } from 'lucide-react';
import { trackEmailSignup } from '@/lib/analytics';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Inline email capture rendered inside the results section, AFTER the user
 * has seen output. Higher conversion than a footer signup because the user
 * is engaged at peak interest. Subscribers are tagged `calculator-user` so
 * the email provider can segment them from generic newsletter signups.
 *
 * Intentionally NOT a modal/popup — the brief explicitly calls that out as
 * an anti-pattern for this audience.
 */
export default function InlineEmailCapture() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          tag: 'calculator-user',
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || 'Subscription failed');
      }
      setStatus('success');
      // Payload is PII-free: no email address, just boolean shape of
      // what was submitted and which surface it came from. Lets us
      // measure results-page email conversion separately from the
      // homepage newsletter footer.
      trackEmailSignup('calculator', {
        has_name: !!firstName.trim(),
      });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <section
        aria-live="polite"
        className="rounded-[var(--r-card)] bg-[color:var(--color-light-mint)] p-6 md:p-7 flex items-start gap-4"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <span
          aria-hidden
          className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} aria-hidden />
        </span>
        <div>
          <p
            className="text-[16px] text-[color:var(--color-dark-green)] tracking-[-0.005em]"
            style={{ fontWeight: 900 }}
          >
            You&rsquo;re on the list{firstName ? `, ${firstName}` : ''}.
          </p>
          <p className="text-[13px] text-[color:var(--color-dark-green)]/80 font-medium leading-relaxed mt-1.5">
            We&rsquo;ll email a summary of these results plus our monthly digest
            of doctor-finance tactics. One-click unsubscribe in every email.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Email a summary of these results"
      className="rounded-[var(--r-card)] bg-white p-5 md:p-6 lg:p-7 flex flex-col 2xl:flex-row 2xl:items-center gap-5 2xl:gap-7"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <div className="w-full 2xl:flex-1 min-w-0 flex items-start gap-3 md:gap-4">
        <span
          aria-hidden
          className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]"
        >
          <Mail className="w-4 h-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="flex-1 min-w-0 max-w-[36rem]">
          <p
            className="text-[15px] md:text-[16px] text-[color:var(--color-near-black)] tracking-[-0.005em]"
            style={{ fontWeight: 900 }}
          >
            Want to save your results?
          </p>
          <p className="text-[12.5px] md:text-[13px] text-[color:var(--text-secondary)] font-medium leading-snug mt-1">
            We&rsquo;ll email a summary of this scenario so you can come back to
            it later. No spam &mdash; one digest a month, unsubscribe anytime.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-none 2xl:flex-shrink-0 2xl:w-auto 2xl:min-w-[380px] 2xl:max-w-[420px] flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name (optional)"
          aria-label="First name (optional)"
          autoComplete="given-name"
          disabled={status === 'submitting'}
          className="
            sm:w-32
            px-4 py-2.5 rounded-[var(--r-pill)]
            text-[14px] font-semibold text-[color:var(--color-near-black)]
            bg-[color:var(--color-off-white)]
            ring-1 ring-inset ring-[color:var(--border-default)]
            focus:outline-none focus:ring-[color:var(--color-near-black)]
            placeholder:text-[color:var(--text-muted)] placeholder:font-medium
            transition-all
          "
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@hospital.org"
          aria-label="Email address"
          autoComplete="email"
          disabled={status === 'submitting'}
          className="
            flex-1 min-w-0
            px-4 py-2.5 rounded-[var(--r-pill)]
            text-[14px] font-semibold text-[color:var(--color-near-black)]
            bg-[color:var(--color-off-white)]
            ring-1 ring-inset ring-[color:var(--border-default)]
            focus:outline-none focus:ring-[color:var(--color-near-black)]
            placeholder:text-[color:var(--text-muted)] placeholder:font-medium
            transition-all
          "
        />
        <button
          type="submit"
          disabled={status === 'submitting' || !email}
          className="
            inline-flex items-center justify-center gap-1.5
            px-5 py-2.5 rounded-[var(--r-pill)]
            text-[13px] font-bold whitespace-nowrap
            bg-[color:var(--color-near-black)] text-white
            transition-all duration-200
            hover:scale-[1.04] active:scale-[0.96]
            disabled:opacity-50 disabled:pointer-events-none
          "
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} aria-hidden />
              Sending&hellip;
            </>
          ) : (
            'Email me a summary'
          )}
        </button>
        {status === 'error' && (
          <p
            role="alert"
            className="basis-full text-[12px] font-semibold text-[color:var(--color-danger)]"
          >
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}

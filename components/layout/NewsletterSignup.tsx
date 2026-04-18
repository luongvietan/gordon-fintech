'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NEWSLETTER_SUBSCRIBER_COUNT } from '@/lib/trust-content';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function formatSubscriberCount(n: number): string {
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    return `${thousands.toLocaleString('en-US')},000+`;
  }
  // Round down to the nearest 100 for a conservative display.
  return `${(Math.floor(n / 100) * 100).toLocaleString('en-US')}+`;
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Subscription failed');
      setStatus('success');
      setMessage("You're in. Check your inbox for the doctor-finance digest.");
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong — please try again.');
    }
  }

  return (
    <section className="container py-12 sm:py-14 md:py-20">
      <div
        className="
          relative overflow-hidden
          rounded-[var(--r-card)] md:rounded-[var(--r-card-lg)]
          bg-[color:var(--color-near-black)] text-white
          px-6 py-10 sm:px-8 sm:py-12 md:px-14 md:py-14
        "
      >
        {/* Soft lime glow — smaller on mobile so it doesn't dominate */}
        <div
          aria-hidden
          className="
            pointer-events-none absolute rounded-full opacity-20 blur-3xl
            -right-16 -top-16 w-52 h-52
            sm:-right-24 sm:-top-24 sm:w-80 sm:h-80
          "
          style={{ background: 'var(--color-wise-green)' }}
        />
        <div
          aria-hidden
          className="
            pointer-events-none absolute rounded-full opacity-[0.08] blur-3xl
            -left-12 -bottom-12 w-40 h-40
            sm:-left-16 sm:-bottom-16 sm:w-64 sm:h-64
          "
          style={{ background: 'var(--color-wise-green)' }}
        />

        <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--r-pill)] text-[11px] sm:text-xs font-semibold bg-white/10 text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)]" />
                Doctor Finance Digest
              </span>
              {NEWSLETTER_SUBSCRIBER_COUNT !== null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-pill)] text-[11px] sm:text-xs font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Join {formatSubscriberCount(NEWSLETTER_SUBSCRIBER_COUNT)} physicians
                </span>
              )}
            </div>
            <h2
              className="display-sub text-white mt-4 sm:mt-5"
              style={{ fontWeight: 900 }}
            >
              Smarter money for doctors, delivered monthly.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70 max-w-md font-medium">
              One email a month. Actionable strategies on PSLF, refi, and net worth —
              written for residents and attendings. No spam, unsubscribe any time.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-wise-green)] hover:text-white transition-colors"
            >
              See a sample issue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7h9m-4-4.5L11.5 7 7.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
            {/* Mobile: stacked full-width input + button.
                ≥sm: combined pill. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 sm:p-1.5 sm:rounded-[var(--r-pill)] sm:bg-white/10 sm:ring-1 sm:ring-inset sm:ring-white/20 sm:focus-within:ring-white/60 sm:transition-all">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                aria-label="Email address"
                disabled={status === 'submitting'}
                className="
                  w-full sm:flex-1 min-w-0
                  bg-white/10 sm:bg-transparent
                  border-none outline-none
                  px-4 py-3 sm:py-2
                  text-base font-semibold text-white
                  placeholder:text-white/45 placeholder:font-medium
                  rounded-[var(--r-pill)]
                  ring-1 ring-inset ring-white/20 focus:ring-white/60 sm:ring-0
                  transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="
                  inline-flex items-center justify-center gap-1.5
                  px-5 py-3 sm:py-2.5
                  rounded-[var(--r-pill)]
                  text-sm font-semibold
                  bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]
                  transition-transform duration-200
                  hover:scale-[1.04] active:scale-[0.96]
                  disabled:opacity-50 disabled:pointer-events-none
                  whitespace-nowrap
                  w-full sm:w-auto
                "
              >
                {status === 'submitting' ? 'Joining…' : 'Subscribe'}
              </button>
            </div>

            {status === 'success' && (
              <p
                role="status"
                className="text-sm font-semibold text-[color:var(--color-wise-green)]"
              >
                {message}
              </p>
            )}
            {status === 'error' && (
              <p
                role="alert"
                className="text-sm font-semibold text-[color:var(--color-danger)]"
              >
                {message}
              </p>
            )}
            {status === 'idle' && (
              <p className="text-xs text-white/50 leading-relaxed">
                By subscribing you agree to receive monthly emails. See our privacy practices.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

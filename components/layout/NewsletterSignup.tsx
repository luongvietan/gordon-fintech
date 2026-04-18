'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

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
    <section className="container py-14 md:py-20">
      <div className="relative overflow-hidden rounded-[var(--r-card-lg)] bg-[color:var(--color-near-black)] text-white p-8 md:p-14">
        {/* Soft lime glow */}
        <div
          aria-hidden
          className="absolute -right-24 -top-24 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-wise-green)' }}
        />
        <div
          aria-hidden
          className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--color-wise-green)' }}
        />

        <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--r-pill)] text-xs font-semibold bg-white/10 text-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)]" />
              Doctor Finance Digest
            </span>
            <h2
              className="display-sub text-white mt-4"
              style={{ fontWeight: 900 }}
            >
              Smarter money for doctors, delivered monthly.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70 max-w-md font-medium">
              One email a month. Actionable strategies on PSLF, refi, and net worth —
              written for residents and attendings. No spam, unsubscribe any time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 p-1.5 rounded-[var(--r-pill)] bg-white/10 ring-1 ring-inset ring-white/20 focus-within:ring-white/60 transition-all">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                aria-label="Email address"
                disabled={status === 'submitting'}
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-base font-semibold text-white placeholder:text-white/45 placeholder:font-medium"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
              >
                {status === 'submitting' ? 'Joining…' : 'Subscribe'}
              </button>
            </div>

            {status === 'success' && (
              <p className="text-sm font-semibold text-[color:var(--color-wise-green)]">
                {message}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm font-semibold text-[color:var(--color-danger)]">
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

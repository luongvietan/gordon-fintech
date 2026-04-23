'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Users } from 'lucide-react';
import { track, trackEmailSignup } from '@/lib/analytics';
import { NEWSLETTER_SUBSCRIBER_COUNT } from '@/lib/trust-content';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function formatSubscriberCount(n: number): string {
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    return `${thousands.toLocaleString('en-US')},000+`;
  }
  return `${(Math.floor(n / 100) * 100).toLocaleString('en-US')}+`;
}

const PROMISES = [
  'One email a month — never more',
  'Specific PSLF, IDR, refi, and tax-bomb tactics',
  'Written for residents and attendings, not the general public',
  'Unsubscribe with one click, any time',
];

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
      // Newsletter CTA is site-wide (mostly homepage footer + /blog);
      // tagging `source: 'newsletter_footer'` keeps it distinct from
      // the post-calculation `results_inline` capture for funnel
      // analysis.
      trackEmailSignup('homepage', { has_name: false });
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
          px-6 py-10 sm:px-8 sm:py-12 md:px-14 md:py-16
        "
      >
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

        <div className="relative grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-16 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--r-pill)] text-[11px] sm:text-xs font-bold bg-white/10 text-white/80 uppercase tracking-[0.10em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)]" />
                Doctor Finance Digest
              </span>
              {NEWSLETTER_SUBSCRIBER_COUNT !== null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-pill)] text-[11px] sm:text-xs font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
                  <Users aria-hidden="true" className="w-3 h-3" strokeWidth={2.5} />
                  Join {formatSubscriberCount(NEWSLETTER_SUBSCRIBER_COUNT)} physicians
                </span>
              )}
            </div>
            <h2
              className="text-white mt-5"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
              }}
            >
              Smarter money for doctors,{' '}
              <span style={{ color: 'var(--color-wise-green)' }}>monthly</span>.
            </h2>
            <p className="mt-5 text-[15px] md:text-base leading-relaxed text-white/72 max-w-md font-medium">
              The one newsletter that talks to physicians like adults with
              six-figure debt and complicated tax situations.
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-2.5 max-w-md">
              {PROMISES.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2.5 text-[13.5px] text-white/85 font-medium leading-snug"
                >
                  <Check
                    aria-hidden="true"
                    className="flex-shrink-0 mt-1 text-[color:var(--color-wise-green)] w-3.5 h-3.5"
                    strokeWidth={2.5}
                  />
                  {p}
                </li>
              ))}
            </ul>

            <Link
              href="/blog"
              onClick={() =>
                track('blog_cta_clicked', {
                  location: 'newsletter_sample_issue',
                  slug: 'blog_index',
                })
              }
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-wise-green)] hover:text-white transition-colors"
            >
              See a sample issue
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
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
                  px-4 py-3.5 sm:py-2.5
                  text-base font-bold text-white
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
                  px-6 py-3.5 sm:py-2.5
                  rounded-[var(--r-pill)]
                  text-sm font-bold
                  bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]
                  transition-all duration-200
                  hover:scale-[1.04] hover:bg-[color:var(--color-pastel-green)] active:scale-[0.96]
                  disabled:opacity-50 disabled:pointer-events-none
                  whitespace-nowrap
                  w-full sm:w-auto
                "
              >
                {status === 'submitting' ? 'Joining\u2026' : 'Subscribe — free'}
              </button>
            </div>

            {status === 'success' && (
              <p
                role="status"
                className="text-sm font-bold text-[color:var(--color-wise-green)]"
              >
                {message}
              </p>
            )}
            {status === 'error' && (
              <p
                role="alert"
                className="text-sm font-bold text-[color:var(--color-danger)]"
              >
                {message}
              </p>
            )}
            {status === 'idle' && (
              <p className="text-[11.5px] text-white/45 leading-relaxed font-medium">
                We&apos;ll only email the digest. We never sell, share, or rent your address.
                See our{' '}
                <Link href="/privacy" className="underline hover:text-white">
                  privacy practices
                </Link>
                .
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

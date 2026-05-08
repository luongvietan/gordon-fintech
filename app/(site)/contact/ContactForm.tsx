'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Contact form that submits to Formspree.
 *
 * To activate, set NEXT_PUBLIC_FORMSPREE_ID to your Formspree form ID
 * (the random hash after https://formspree.io/f/). Without the env var
 * the form renders normally but submissions are no-ops in dev.
 */
export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);

    // If no Formspree ID is configured, fall back to mailto
    if (!formspreeId) {
      const name = data.get('name') as string;
      const email = data.get('email') as string;
      const message = data.get('message') as string;
      const subject = encodeURIComponent('Message from MedDebt Contact Form');
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`,
      );
      window.location.href = `mailto:hello@medschooldebtcalculator.com?subject=${subject}&body=${body}`;
      setState('success');
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setState('success');
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(
          (json as { error?: string }).error ??
            'Something went wrong. Please try emailing us directly.',
        );
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try emailing us directly.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div
        className="rounded-[var(--r-card)] p-8 flex flex-col items-center gap-4 text-center"
        style={{ background: 'var(--color-light-mint)', boxShadow: 'var(--shadow-ring)' }}
      >
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-dark-green)] text-[color:var(--color-wise-green)]">
          <Check className="w-6 h-6" strokeWidth={2.5} />
        </span>
        <p
          className="text-[1.25rem] text-[color:var(--color-near-black)] tracking-[-0.01em]"
          style={{ fontWeight: 900 }}
        >
          Message sent!
        </p>
        <p className="text-[15px] text-[color:var(--text-secondary)] font-medium max-w-sm">
          We&rsquo;ll get back to you at the email you provided. Usually within a day or two.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      aria-label="Contact form"
    >
      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-1.5"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          placeholder="Dr. Jane Smith"
          autoComplete="name"
          className="w-full rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-4 py-3 text-[14px] font-semibold text-[color:var(--color-near-black)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)] transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-1.5"
        >
          Email address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="jane@hospital.org"
          autoComplete="email"
          className="w-full rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-4 py-3 text-[14px] font-semibold text-[color:var(--color-near-black)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)] transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-[12px] font-bold uppercase tracking-[0.10em] text-[color:var(--text-muted)] mb-1.5"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Question, feedback, or feature suggestion…"
          className="w-full rounded-[var(--r-card-sm)] border border-[color:var(--border-default)] px-4 py-3 text-[14px] font-semibold text-[color:var(--color-near-black)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--color-wise-green)] focus:ring-1 focus:ring-[color:var(--color-wise-green)] transition-colors resize-none"
        />
      </div>

      {state === 'error' && (
        <p className="text-[13px] font-semibold text-[color:var(--color-danger)]" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-[var(--r-pill)] text-[14px] font-bold bg-[color:var(--color-near-black)] text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
      >
        {state === 'submitting' ? (
          <Loader2 aria-hidden className="w-4 h-4 animate-spin" strokeWidth={2} />
        ) : (
          <ArrowRight aria-hidden className="w-4 h-4" strokeWidth={2} />
        )}
        {state === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Have a question about the calculator, found something that looks off, or want to suggest a feature? We read every message.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-2xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)] mb-8"
        >
          <a href="/" className="hover:text-[color:var(--color-near-black)] transition-colors">
            Home
          </a>
          <span>/</span>
          <span className="text-[color:var(--color-near-black)]">Contact</span>
        </nav>

        <p className="eyebrow mb-4">Get in touch</p>
        <h1
          className="text-[color:var(--color-near-black)] tracking-[-0.025em] leading-[0.95] mb-5"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          }}
        >
          We read every message.
        </h1>
        <p className="text-lg text-[color:var(--text-secondary)] leading-relaxed font-medium mb-10 max-w-lg">
          Have a question about the calculator, found something that looks off,
          or want to suggest a feature? Drop us a note.{' '}
          <span className="text-[color:var(--color-near-black)] font-semibold">
            — Suhin &amp; Kevin
          </span>
        </p>

        <ContactForm />

        {/* Direct email fallback */}
        <p className="mt-8 text-[13px] text-[color:var(--text-muted)] font-medium">
          Prefer email?{' '}
          <a
            href="mailto:hello@medschooldebtcalculator.com"
            className="text-[color:var(--color-dark-green)] font-semibold hover:underline"
          >
            hello@medschooldebtcalculator.com
          </a>
        </p>
      </div>
    </section>
  );
}

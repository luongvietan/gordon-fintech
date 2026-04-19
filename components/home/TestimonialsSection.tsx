import Image from 'next/image';
import { Quote } from 'lucide-react';
import { TESTIMONIALS, type Testimonial } from '@/lib/trust-content';

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join('')
    .toUpperCase() || '—';
}

function Avatar({ t }: { t: Testimonial }) {
  if (t.photoUrl) {
    return (
      <Image
        src={t.photoUrl}
        alt={t.name}
        width={44}
        height={44}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex-shrink-0 w-11 h-11 rounded-full bg-[color:var(--color-near-black)] text-white flex items-center justify-center text-sm"
      style={{ fontWeight: 900 }}
    >
      {initials(t.name)}
    </div>
  );
}

/**
 * Testimonials grid. Renders nothing when no real quotes are configured —
 * we never ship a lorem-ipsum quote to the public site.
 */
export default function TestimonialsSection() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <div className="max-w-3xl mb-10 md:mb-14">
          <p className="eyebrow mb-4">What doctors say</p>
          <h2
            className="display-section text-[color:var(--color-near-black)]"
            style={{ fontWeight: 900 }}
          >
            Trusted by doctors from coast to coast.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={`${t.name}-${i}`}
              className="flex flex-col gap-5 p-6 md:p-7 rounded-[var(--r-card)] bg-white"
              style={{ boxShadow: 'var(--shadow-ring)' }}
            >
              <Quote
                aria-hidden="true"
                className="text-[color:var(--color-wise-green)] w-7 h-7"
                fill="currentColor"
                strokeWidth={0}
              />
              <blockquote
                className="text-[17px] md:text-[18px] text-[color:var(--text-primary)] leading-[1.4] font-medium tracking-[-0.005em]"
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-auto pt-2 border-t border-[color:var(--border-subtle)]">
                <Avatar t={t} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[color:var(--color-near-black)] truncate">
                    {t.name}
                  </p>
                  <p className="text-xs font-semibold text-[color:var(--text-secondary)] truncate">
                    {t.specialty} · {t.program}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

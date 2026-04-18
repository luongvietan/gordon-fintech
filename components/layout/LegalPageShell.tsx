import Link from 'next/link';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper for /methodology, /privacy, /terms. Mirrors the look of a
 * blog post so these pages feel cohesive without re-doing the typography.
 */
export default function LegalPageShell({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
}: Props) {
  return (
    <>
      <section className="pt-10 md:pt-16 pb-6 md:pb-10 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-muted)] mb-6"
            >
              <Link href="/" className="hover:text-[color:var(--color-near-black)] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[color:var(--color-near-black)]">{eyebrow}</span>
            </nav>

            <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)] mb-5">
              {eyebrow}
            </span>

            <h1
              className="text-[color:var(--color-near-black)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.025em',
              }}
            >
              {title}
            </h1>

            <p className="mt-5 text-lg md:text-xl text-[color:var(--text-secondary)] leading-relaxed font-medium">
              {description}
            </p>

            <p className="mt-6 text-xs font-semibold text-[color:var(--text-muted)]">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-white">
        <div className="container">
          <article className="prose max-w-3xl">{children}</article>
        </div>
      </section>
    </>
  );
}

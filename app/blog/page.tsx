import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Doctor Finance Blog — Medical School Debt & Loan Repayment Guides',
  description:
    'Research-backed guides on medical school debt, PSLF, doctor salaries, and the best loan repayment strategies for physicians and medical students.',
  openGraph: {
    title: 'Doctor Finance Blog | MedDebt Calculator',
    description: 'Guides on med school debt, PSLF, and repayment strategies for doctors.',
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div style={{ background: 'var(--color-off-white)' }}>
      {/* ─── Header ──────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Guides</p>
            <h1
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Med school debt, repayment, and PSLF — explained.
            </h1>
            <p className="mt-5 text-lg text-[color:var(--text-secondary)] max-w-xl leading-relaxed font-medium">
              Research-backed guides written for medical students and doctors. Every article
              links back to the free calculator so you can run your own numbers.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Posts grid ──────────────────────────────────── */}
      <section className="pt-10 md:pt-14 pb-16 md:pb-24">
        <div className="container">
          {posts.length === 0 ? (
            <p className="text-[color:var(--text-muted)] text-center py-16 font-medium">
              No articles yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-4 p-6 md:p-7 rounded-[var(--r-card)] bg-white transition-transform duration-200 hover:scale-[1.01]"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
                      {post.readingTime}
                    </span>
                    {post.date && (
                      <time className="text-xs font-semibold text-[color:var(--text-muted)]">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                  <h2
                    className="text-xl md:text-2xl text-[color:var(--color-near-black)] leading-[1.05] tracking-[-0.015em]"
                    style={{ fontWeight: 900 }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed line-clamp-3 font-medium flex-1">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-dark-green)] mt-2">
                    Read article
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 7h9m-4-4.5L11.5 7 7.5 11.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* CTA back to calculator */}
          <div
            className="mt-14 md:mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-7 md:p-9 rounded-[var(--r-card-lg)] bg-[color:var(--color-near-black)] text-white"
          >
            <div className="max-w-lg">
              <p
                className="text-2xl md:text-3xl text-white leading-[0.95] tracking-[-0.015em]"
                style={{ fontWeight: 900 }}
              >
                Ready to run your own numbers?
              </p>
              <p className="text-[15px] text-white/70 mt-2 font-medium">
                Free calculator. Specialty presets. PSLF comparison baked in.
              </p>
            </div>
            <Link
              href="/#calculator"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95]"
            >
              Try the Calculator
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
        </div>
      </section>
    </div>
  );
}

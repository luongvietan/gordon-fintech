import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import AdSlot from '@/components/ads/AdSlot';

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meddebtcalc.com';

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url: `/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'MedDebt Calculator' },
    publisher: { '@type': 'Organization', name: 'MedDebt Calculator' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };

  const faqLd =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* ─── Article header ───────────────────────────────── */}
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
              <Link href="/blog" className="hover:text-[color:var(--color-near-black)] transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-[color:var(--color-near-black)] truncate">{post.title}</span>
            </nav>

            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
                {post.readingTime}
              </span>
              {post.date && (
                <time className="text-xs font-semibold text-[color:var(--text-muted)]">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              )}
            </div>

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
              {post.title}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-[color:var(--text-secondary)] leading-relaxed font-medium">
              {post.description}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Article body ─────────────────────────────────── */}
      <section className="pb-16 md:pb-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 md:gap-14 max-w-5xl mx-auto">
            <article className="prose max-w-none">
              <MDXRemote
                source={post.content}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />

              {post.faqs && post.faqs.length > 0 && (
                <section
                  className="mt-14 p-6 md:p-8 rounded-[var(--r-card)] bg-[color:var(--color-off-white)] not-prose"
                  style={{ boxShadow: 'var(--shadow-ring)' }}
                >
                  <h2
                    className="text-2xl md:text-3xl text-[color:var(--color-near-black)] tracking-[-0.015em] mb-5"
                    style={{ fontWeight: 900, fontFamily: 'var(--font-display)' }}
                  >
                    Frequently asked
                  </h2>
                  <div className="flex flex-col gap-3">
                    {post.faqs.map((f) => (
                      <details
                        key={f.q}
                        className="group rounded-[var(--r-card-sm)] bg-white p-4 md:p-5"
                        style={{ boxShadow: 'var(--shadow-ring)' }}
                      >
                        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                          <h3 className="text-base font-bold text-[color:var(--color-near-black)] leading-snug">
                            {f.q}
                          </h3>
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[color:var(--color-near-black)]/[0.06] group-open:bg-[color:var(--color-wise-green)] transition-colors">
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 10 10"
                              className="transition-transform duration-200 group-open:rotate-45"
                              aria-hidden="true"
                            >
                              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                            </svg>
                          </span>
                        </summary>
                        <p className="mt-3 text-[15px] text-[color:var(--text-secondary)] leading-relaxed font-medium">
                          {f.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              {/* Calculator CTA */}
              <div
                className="p-6 rounded-[var(--r-card)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
              >
                <p
                  className="text-[22px] leading-[0.95] tracking-[-0.015em]"
                  style={{ fontWeight: 900, fontFamily: 'var(--font-display)' }}
                >
                  Run your own numbers.
                </p>
                <p className="text-sm font-medium mt-2 leading-relaxed text-[color:var(--color-dark-green)]/85">
                  Specialty presets, PSLF comparison, net-worth crossover — free.
                </p>
                <Link
                  href="/#calculator"
                  className="inline-flex items-center justify-center gap-1.5 mt-5 w-full py-3 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-near-black)] text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
                >
                  Try Calculator
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

              {/* Sidebar ad */}
              <AdSlot
                variant="sidebar"
                slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT}
              />
            </aside>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ───────────────────────────────────── */}
      <section style={{ background: 'var(--color-near-black)' }} className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
              }}
            >
              See <span style={{ color: 'var(--color-wise-green)' }}>your</span> payoff timeline.
            </h2>
            <p className="mt-5 text-lg text-white/70 max-w-lg mx-auto font-medium">
              Enter your specialty, residency, and loan details. Get a customized projection in seconds.
            </p>
            <Link
              href="/#calculator"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-[var(--r-pill)] text-base font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95]"
            >
              Calculate my payoff — free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10m-5-5 5 5-5 5"
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
    </>
  );
}

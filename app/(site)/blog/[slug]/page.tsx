import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import AdSlot from '@/components/ads/AdSlot';
import ArticleCard from '@/components/blog/ArticleCard';

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medschooldebtcalculator.com';

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  // The dynamic OG/Twitter images are auto-attached by Next from the
  // sibling `opengraph-image.tsx` + `twitter-image.tsx` files. We don't
  // need to pass `images` here — that would override the file-based
  // metadata convention.
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

  const related = await getRelatedPosts(slug);

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

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
              {(post.categories ?? []).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog#${cat.slug}`}
                  className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-near-black)] text-[color:var(--color-wise-green)] hover:bg-[color:var(--color-dark-green)] transition-colors"
                >
                  {cat.title}
                </Link>
              ))}
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
                            <Plus
                              aria-hidden="true"
                              className="w-2.5 h-2.5 transition-transform duration-200 group-open:rotate-45"
                              strokeWidth={2}
                            />
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

            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="p-6 rounded-[var(--r-card)] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]">
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
                  <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
                </Link>
              </div>

              <AdSlot variant="sidebar" slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT} />
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 md:py-20 bg-[color:var(--color-off-white)] border-t border-[color:var(--border-subtle)]">
          <div className="container">
            <div className="flex items-end justify-between gap-4 mb-8 md:mb-10 max-w-5xl mx-auto">
              <div>
                <p className="eyebrow mb-2">Keep reading</p>
                <h2
                  className="text-2xl md:text-3xl text-[color:var(--color-near-black)] tracking-[-0.015em] leading-[1.05]"
                  style={{ fontWeight: 900, fontFamily: 'var(--font-display)' }}
                >
                  Related guides
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-dark-green)] hover:text-[color:var(--color-near-black)] transition-colors"
              >
                All articles
                <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

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
              <ArrowRight aria-hidden="true" className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

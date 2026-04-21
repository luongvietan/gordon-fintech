'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';
import type { Category, PostMeta } from '@/lib/blog';
import { track } from '@/lib/analytics';

interface Props {
  posts: PostMeta[];
  categories: Category[];
}

const ALL = '__all__';

export default function BlogIndex({ posts, categories }: Props) {
  const [active, setActive] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (active === ALL) return posts;
    return posts.filter((p) =>
      (p.categories ?? []).some((c) => c.slug === active),
    );
  }, [active, posts]);

  // The lead is the first featured post in the active filter; otherwise the most-recent.
  const lead =
    filtered.find((p) => p.featured) ?? filtered[0] ?? null;
  const rest = filtered.filter((p) => p.slug !== lead?.slug);

  // Pre-compute per-category counts so the chips show the catalog at a glance.
  const counts = useMemo(() => {
    const c: Record<string, number> = { [ALL]: posts.length };
    for (const p of posts) {
      for (const cat of p.categories ?? []) {
        c[cat.slug] = (c[cat.slug] ?? 0) + 1;
      }
    }
    return c;
  }, [posts]);

  if (posts.length === 0) {
    return (
      <section className="container py-20 md:py-28 text-center">
        <p className="text-[color:var(--text-muted)] font-medium">
          No articles yet. Check back soon.
        </p>
      </section>
    );
  }

  // Only show category chips that actually have posts assigned.
  const visibleCategories = categories.filter((c) => (counts[c.slug] ?? 0) > 0);

  return (
    <>
      {visibleCategories.length > 0 && (
        <section className="container pt-2">
          <div
            className="flex flex-wrap items-center gap-2 pb-1"
            role="tablist"
            aria-label="Filter articles by category"
          >
            <CategoryPill
              label="All"
              count={counts[ALL]}
              active={active === ALL}
              onClick={() => setActive(ALL)}
            />
            {visibleCategories.map((c) => (
              <CategoryPill
                key={c.slug}
                label={c.title}
                count={counts[c.slug] ?? 0}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="container pt-8 md:pt-10 pb-16 md:pb-24">
        {filtered.length === 0 ? (
          <p className="text-[color:var(--text-muted)] text-center py-16 font-medium">
            No articles in this category yet.
          </p>
        ) : (
          <div className="flex flex-col gap-8 md:gap-10">
            {lead && <ArticleCard post={lead} variant="feature" />}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {rest.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-14 md:mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-7 md:p-9 rounded-[var(--r-card-lg)] bg-[color:var(--color-near-black)] text-white">
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
            href="/calculator"
            onClick={() =>
              track('calculator_cta_clicked', {
                location: 'blog_index_cta',
                target: 'calculator',
              })
            }
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-[var(--r-pill)] text-sm font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95]"
          >
            Try the calculator
            <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </>
  );
}

interface PillProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CategoryPill({ label, count, active, onClick }: PillProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-pill)]
        text-[13px] font-bold transition-all duration-150
        ${
          active
            ? 'bg-[color:var(--color-near-black)] text-white shadow-[var(--shadow-ring-strong)]'
            : 'bg-white text-[color:var(--text-primary)] shadow-[var(--shadow-ring)] hover:shadow-[var(--shadow-ring-strong)] hover:-translate-y-0.5'
        }
      `}
    >
      {label}
      <span
        className={`
          inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full
          text-[10px] font-bold tabular-nums
          ${
            active
              ? 'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]'
              : 'bg-[color:var(--color-off-white)] text-[color:var(--text-muted)]'
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}

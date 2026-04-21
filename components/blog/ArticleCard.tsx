'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PostThumbnail from '@/components/home/PostThumbnail';
import type { PostMeta } from '@/lib/blog';
import { track } from '@/lib/analytics';

interface Props {
  post: PostMeta;
  /** When true, renders a wider hero card (used for the lead/featured post). */
  variant?: 'default' | 'feature';
}

export default function ArticleCard({ post, variant = 'default' }: Props) {
  const isFeature = variant === 'feature';
  const primaryCategory = post.categories?.[0];

  if (isFeature) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        onClick={() =>
          track('blog_cta_clicked', {
            location: isFeature ? 'article_card_feature' : 'article_card',
            slug: post.slug,
          })
        }
        className="group grid md:grid-cols-2 gap-6 md:gap-10 p-5 md:p-7 rounded-[var(--r-card-lg)] bg-white transition-all duration-200 hover:-translate-y-0.5"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        <PostThumbnail
          slug={post.slug}
          title={post.title}
          coverImageUrl={post.coverImageUrl}
          className="md:aspect-[5/4] md:h-full"
        />
        <div className="flex flex-col justify-center gap-4 md:py-2 md:pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-[0.10em] bg-[color:var(--color-near-black)] text-[color:var(--color-wise-green)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)]" />
              Featured
            </span>
            {primaryCategory && (
              <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
                {primaryCategory.title}
              </span>
            )}
          </div>
          <h2
            className="text-[color:var(--color-near-black)] tracking-[-0.02em] leading-[0.95] group-hover:text-[color:var(--color-dark-green)] transition-colors"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)',
            }}
          >
            {post.title}
          </h2>
          <p className="text-[15px] md:text-base text-[color:var(--text-secondary)] leading-relaxed font-medium line-clamp-3">
            {post.description}
          </p>
          <div className="flex items-center gap-3 text-xs font-semibold text-[color:var(--text-muted)] pt-1">
            {post.date && (
              <time>
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            )}
            <span aria-hidden>·</span>
            <span>{post.readingTime}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-dark-green)] mt-2">
            Read the full guide
            <ArrowRight
              aria-hidden="true"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      onClick={() =>
        track('blog_cta_clicked', {
          location: 'article_card',
          slug: post.slug,
        })
      }
      className="group flex flex-col rounded-[var(--r-card)] bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <div className="p-3 pb-0">
        <PostThumbnail
          slug={post.slug}
          title={post.title}
          coverImageUrl={post.coverImageUrl}
        />
      </div>

      <div className="flex flex-col flex-1 gap-3 p-5 md:p-6">
        <div className="flex items-center justify-between gap-2">
          {primaryCategory ? (
            <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[10.5px] font-bold uppercase tracking-wider bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]">
              {primaryCategory.title}
            </span>
          ) : (
            <span className="inline-flex px-2.5 py-1 rounded-[var(--r-pill)] text-[10.5px] font-bold uppercase tracking-wider bg-[color:var(--color-off-white)] text-[color:var(--text-secondary)]">
              {post.readingTime}
            </span>
          )}
          {post.date && (
            <time className="text-[11px] font-semibold text-[color:var(--text-muted)]">
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          )}
        </div>

        <h3
          className="text-lg md:text-xl text-[color:var(--color-near-black)] leading-[1.1] tracking-[-0.015em] group-hover:text-[color:var(--color-dark-green)] transition-colors"
          style={{ fontWeight: 900 }}
        >
          {post.title}
        </h3>

        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed line-clamp-2 font-medium flex-1">
          {post.description}
        </p>

        <div className="flex items-center justify-between pt-2 mt-auto">
          {primaryCategory ? (
            <span className="text-[11px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">
              {post.readingTime}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[color:var(--color-dark-green)]">
            Read
            <ArrowRight
              aria-hidden="true"
              className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

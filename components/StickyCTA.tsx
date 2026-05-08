'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { track } from '@/lib/analytics';

/**
 * Context-specific sticky CTA for blog articles.
 *
 * Behavior:
 *  - Sticky bar appears when the user has scrolled past 30% of the article.
 *  - Dismissible with an X button; dismissed state is stored in
 *    sessionStorage so it won't come back within the same browsing session.
 *  - Mid-article callout (embedded in content) renders at ~60% scroll.
 *  - CTA copy is context-specific based on the article's categories.
 */

const DISMISSED_KEY = 'meddebt_sticky_cta_dismissed';

export type ArticleCategory = 'pslf' | 'idr' | 'salary' | 'refi' | 'general';

interface StickyCTAProps {
  /** Article slug — used for analytics. */
  slug: string;
  /** Primary category of the article, drives copy. */
  primaryCategory?: ArticleCategory;
}

function ctaCopy(category: ArticleCategory): { message: string; cta: string } {
  switch (category) {
    case 'pslf':
      return {
        message: 'Ready to model your PSLF scenario for your specialty?',
        cta: 'Try calculator free',
      };
    case 'idr':
      return {
        message: 'Compare IDR plans for your specialty',
        cta: 'Try calculator free',
      };
    case 'salary':
      return {
        message: 'See how your specialty salary affects your payoff',
        cta: 'Try calculator free',
      };
    case 'refi':
      return {
        message: 'Run the PSLF vs refinance comparison',
        cta: 'Try calculator free',
      };
    default:
      return {
        message: 'Model your debt payoff scenario',
        cta: 'Try calculator free',
      };
  }
}

export default function StickyCTA({ slug, primaryCategory = 'general' }: StickyCTAProps) {
  const [showBar, setShowBar] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showMidCta, setShowMidCta] = useState(false);
  const barFiredRef = useRef(false);
  const midFiredRef = useRef(false);

  useEffect(() => {
    // Check if dismissed this session
    if (typeof sessionStorage !== 'undefined') {
      const prev = sessionStorage.getItem(DISMISSED_KEY);
      if (prev === 'true') {
        setDismissed(true);
      }
    }

    function handleScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) return;
      const pct = scrolled / total;

      // 30% threshold → sticky bar
      if (pct >= 0.3 && !barFiredRef.current) {
        barFiredRef.current = true;
        setShowBar(true);
        track('sticky_cta_shown', { slug, category: primaryCategory });
      }

      // 60% threshold → mid-article callout
      if (pct >= 0.6 && !midFiredRef.current) {
        midFiredRef.current = true;
        setShowMidCta(true);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, primaryCategory]);

  function handleDismiss() {
    setDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
    }
    track('sticky_cta_dismissed', { slug, category: primaryCategory });
  }

  const copy = ctaCopy(primaryCategory);

  return (
    <>
      {/* Sticky bottom bar */}
      {showBar && !dismissed && (
        <div
          className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-3.5 text-white"
          style={{
            background: 'var(--color-near-black)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -8px 32px -8px rgba(0,0,0,0.4)',
          }}
          role="complementary"
          aria-label="Calculator prompt"
        >
          <p className="text-[13px] md:text-[14px] font-semibold text-white/90 min-w-0 truncate">
            {copy.message}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/calculator"
              onClick={() =>
                track('sticky_cta_clicked', {
                  slug,
                  category: primaryCategory,
                  location: 'sticky_bar',
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-pill)] text-[13px] font-bold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96] whitespace-nowrap"
            >
              {copy.cta}
              <ArrowRight aria-hidden className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss this banner"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Mid-article callout (rendered inline at ~60% scroll) */}
      {showMidCta && (
        <MidArticleCallout slug={slug} category={primaryCategory} />
      )}
    </>
  );
}

/**
 * Mid-article callout box.
 * Rendered inline in the article stream once the user has scrolled 60%.
 */
export function MidArticleCallout({
  slug,
  category = 'general',
}: {
  slug: string;
  category?: ArticleCategory;
}) {
  return (
    <div
      className="not-prose my-8 rounded-[var(--r-card)] p-5 md:p-6"
      style={{
        background: 'var(--color-light-mint)',
        boxShadow: 'var(--shadow-ring)',
      }}
      role="complementary"
      aria-label="Calculator prompt"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex-shrink-0 text-[20px] mt-0.5"
        >
          💡
        </span>
        <div className="min-w-0">
          <p
            className="text-[color:var(--color-dark-green)] tracking-[-0.01em] leading-snug mb-1.5"
            style={{ fontWeight: 900, fontSize: '1.125rem' }}
          >
            Don&rsquo;t just read — model your actual numbers
          </p>
          <p className="text-[14px] text-[color:var(--color-dark-green)]/80 font-medium leading-relaxed">
            Enter your specialty and debt. See exactly when you&rsquo;ll reach
            forgiveness and how much you save.
          </p>
          <Link
            href="/calculator"
            onClick={() =>
              track('sticky_cta_clicked', {
                slug,
                category,
                location: 'mid_article',
              })
            }
            className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-[var(--r-pill)] text-[13px] font-bold bg-[color:var(--color-near-black)] text-white transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96]"
          >
            Try the calculator free — no email required
            <ArrowRight aria-hidden className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}

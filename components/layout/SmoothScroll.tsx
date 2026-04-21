'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Site-wide smooth scrolling powered by Lenis.
 *
 * Why Lenis (over plain CSS `scroll-behavior: smooth`):
 *  - Frame-driven inertia that feels "premium", not just OS-eased.
 *  - Works on programmatic scroll, anchor links, and trackpad gestures.
 *  - Plays nicely with `position: sticky` and IntersectionObserver.
 *
 * Behaviour rules baked in:
 *  - Disabled when the user prefers reduced motion (a11y).
 *  - Disabled inside the embedded Sanity Studio (/studio) — Studio
 *    needs native scroll for its own panes; we mount this only inside
 *    the (site) layout so that's already handled by route grouping,
 *    but we still bail if the path slips through.
 *  - Anchor links (`<a href="#x">`) are intercepted so they ride the
 *    Lenis tween instead of jumping.
 *  - Sticky elements (header, calculator sidebar) keep working because
 *    Lenis transforms `window.scrollY` rather than wrapping content.
 *  - On route changes, scroll is reset to top instantly (no awkward
 *    smooth scroll across page transitions).
 */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    if (pathname?.startsWith('/studio')) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Standard "ease-out-expo" — fast start, soft landing.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch handled natively for performance + correct momentum on iOS.
      syncTouch: false,
      wheelMultiplier: 1,
      lerp: 0.1,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // ── Anchor link interception ────────────────────────────────
    // Catches <a href="/calculator">, <a href="/#faq">, etc., and
    // routes them through Lenis so the scroll feels uniform.
    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('a');
      if (!target) return;

      // Respect modifier keys + non-primary clicks.
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only handle in-page hashes that belong to the current document.
      const url = new URL(href, window.location.href);
      const samePage =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname;
      if (!samePage || !url.hash) return;

      const id = decodeURIComponent(url.hash.slice(1));
      if (!id) return;

      const el = document.getElementById(id);
      if (!el) return;

      event.preventDefault();
      lenis.scrollTo(el, { offset: -64, duration: 1.2 });
      // Keep the URL in sync so back/forward + share-link still work.
      window.history.replaceState(null, '', url.hash);
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  // Reset to top instantly on route change so the next page doesn't
  // inherit the previous page's scroll position.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

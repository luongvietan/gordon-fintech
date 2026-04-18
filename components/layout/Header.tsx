'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { href: '/#calculator', label: 'Calculator' },
  { href: '/blog', label: 'Guides' },
  { href: '/#how-it-works', label: 'How it works' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[color:var(--border-subtle)]">
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            onClick={() => setOpen(false)}
          >
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] font-black text-sm transition-transform duration-200 group-hover:scale-105"
            >
              M
            </span>
            <span
              className="text-lg text-[color:var(--color-near-black)] tracking-[-0.02em]"
              style={{ fontWeight: 900 }}
            >
              MedDebt
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[color:var(--color-wise-green)] after:transition-[width] after:duration-200 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/#calculator"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95]"
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

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-[color:var(--color-near-black)] hover:bg-[color:var(--color-near-black)]/[0.06] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-[color:var(--border-subtle)] bg-white">
          <div className="container py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 px-2 text-base font-semibold text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--color-light-mint)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#calculator"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
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
        </div>
      )}
    </header>
  );
}

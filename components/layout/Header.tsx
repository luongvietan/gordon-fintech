'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { track } from '@/lib/analytics';

const NAV = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/blog', label: 'Guides' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
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
              href="/calculator"
              onClick={() =>
                track('calculator_cta_clicked', {
                  location: 'header_desktop',
                  target: 'calculator',
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95]"
            >
              Try Calculator
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
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
            {open ? (
              <X aria-hidden="true" className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Menu aria-hidden="true" className="w-5 h-5" strokeWidth={2} />
            )}
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
              href="/calculator"
              onClick={() => {
                track('calculator_cta_clicked', {
                  location: 'header_mobile',
                  target: 'calculator',
                });
                setOpen(false);
              }}
              aria-label="Open the calculator"
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-[var(--r-pill)] text-sm font-semibold bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
            >
              Try Calculator
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

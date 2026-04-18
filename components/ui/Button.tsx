'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'subtle' | 'ghost-dark' | 'ghost-light' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  as?: 'button';
}

const base =
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap ' +
  'font-semibold leading-none ' +
  'transition-transform duration-200 ease-out ' +
  'hover:scale-[1.05] active:scale-[0.95] ' +
  'focus-visible:outline-none focus-visible:ring-[3px] ' +
  'focus-visible:ring-[color:var(--color-wise-green)]/60 ' +
  'disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100';

const variants: Record<Variant, string> = {
  primary:
    'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)] ' +
    'hover:bg-[color:var(--color-pastel-green)]',
  subtle:
    'bg-[color:var(--color-near-black)]/[0.08] text-[color:var(--color-near-black)] ' +
    'hover:bg-[color:var(--color-near-black)]/[0.14]',
  'ghost-dark':
    'bg-transparent text-[color:var(--color-near-black)] ' +
    'hover:bg-[color:var(--color-near-black)]/[0.06]',
  'ghost-light':
    'bg-transparent text-white ring-1 ring-inset ring-white/30 ' +
    'hover:bg-white/10 hover:ring-white/60',
  outline:
    'bg-white text-[color:var(--color-near-black)] ' +
    'ring-1 ring-inset ring-[color:var(--border-default)] ' +
    'hover:ring-[color:var(--border-strong)]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm rounded-[var(--r-pill)]',
  md: 'px-4 py-2.5 text-[0.9375rem] rounded-[var(--r-pill)]',
  lg: 'px-6 py-3.5 text-base rounded-[var(--r-pill)]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', className = '', children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;

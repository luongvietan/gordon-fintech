'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, prefix, suffix, error, className = '', id, ...props },
    ref,
  ) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[color:var(--text-primary)] tracking-[-0.005em]"
          >
            {label}
          </label>
        )}
        {hint && (
          <p className="text-[11px] text-[color:var(--text-muted)] leading-snug">
            {hint}
          </p>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm font-semibold text-[color:var(--text-muted)] pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 px-3.5 text-sm font-semibold
              bg-white text-[color:var(--text-primary)]
              placeholder:text-[color:var(--text-muted)] placeholder:font-normal
              rounded-[var(--r-input)]
              shadow-[var(--shadow-ring)]
              transition-shadow duration-150 ease-out
              outline-none
              hover:shadow-[var(--shadow-ring-strong)]
              focus:shadow-[var(--shadow-ring-inset)]
              disabled:bg-[color:var(--color-light-surface)] disabled:cursor-not-allowed
              ${prefix ? 'pl-7' : ''}
              ${suffix ? 'pr-12' : ''}
              ${error ? 'shadow-[rgba(208,50,56,0.8)_0_0_0_1px]' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-sm font-semibold text-[color:var(--text-muted)] pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs font-semibold text-[color:var(--color-danger)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;

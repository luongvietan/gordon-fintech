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
            className="text-[11.5px] font-bold text-[color:var(--text-primary)] tracking-[-0.005em] uppercase tracking-[0.04em]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3.5 text-[14px] font-bold text-[color:var(--text-muted)] pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 px-3.5 text-[14px] font-bold tabular-nums
              bg-white text-[color:var(--text-primary)]
              placeholder:text-[color:var(--text-muted)] placeholder:font-medium
              rounded-[var(--r-input)]
              shadow-[var(--shadow-ring)]
              transition-shadow duration-150 ease-out
              outline-none
              hover:shadow-[var(--shadow-ring-strong)]
              focus:shadow-[rgba(159,232,112,0.6)_0_0_0_2px,rgba(14,15,12,0.24)_0_0_0_1px]
              disabled:bg-[color:var(--color-light-surface)] disabled:cursor-not-allowed
              ${prefix ? 'pl-7' : ''}
              ${suffix ? 'pr-14' : ''}
              ${error ? 'shadow-[rgba(208,50,56,0.8)_0_0_0_1px]' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-[12px] font-bold text-[color:var(--text-muted)] pointer-events-none select-none uppercase tracking-wider">
              {suffix}
            </span>
          )}
        </div>
        {hint && (
          <p className="text-[11px] text-[color:var(--text-muted)] leading-snug font-medium">
            {hint}
          </p>
        )}
        {error && (
          <p className="text-[11px] font-semibold text-[color:var(--color-danger)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;

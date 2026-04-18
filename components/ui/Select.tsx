'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: SelectOption[];
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, options, error, className = '', id, ...props },
    ref,
  ) => {
    const selectId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
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
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-11 pl-3.5 pr-10 text-sm font-semibold appearance-none
              bg-white text-[color:var(--text-primary)]
              rounded-[var(--r-input)]
              shadow-[var(--shadow-ring)]
              transition-shadow duration-150 ease-out
              outline-none cursor-pointer
              hover:shadow-[var(--shadow-ring-strong)]
              focus:shadow-[var(--shadow-ring-inset)]
              disabled:bg-[color:var(--color-light-surface)] disabled:cursor-not-allowed
              ${error ? 'shadow-[rgba(208,50,56,0.8)_0_0_0_1px]' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M3.5 5.25L7 8.75l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[color:var(--text-secondary)]"
              />
            </svg>
          </div>
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

Select.displayName = 'Select';
export default Select;

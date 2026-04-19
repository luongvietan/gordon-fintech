'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
            className="text-[11.5px] font-bold text-[color:var(--text-primary)] uppercase tracking-[0.04em]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-11 pl-3.5 pr-10 text-[14px] font-bold appearance-none
              bg-white text-[color:var(--text-primary)]
              rounded-[var(--r-input)]
              shadow-[var(--shadow-ring)]
              transition-shadow duration-150 ease-out
              outline-none cursor-pointer
              hover:shadow-[var(--shadow-ring-strong)]
              focus:shadow-[rgba(159,232,112,0.6)_0_0_0_2px,rgba(14,15,12,0.24)_0_0_0_1px]
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
            <ChevronDown
              aria-hidden="true"
              className="w-3.5 h-3.5 text-[color:var(--text-secondary)]"
              strokeWidth={2}
            />
          </div>
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

Select.displayName = 'Select';
export default Select;

'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: ToggleProps) {
  const toggleId = id ?? 'toggle';
  const descriptionId = description ? `${toggleId}-desc` : undefined;

  return (
    <div className="flex min-h-[44px] items-start gap-3">
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative flex-shrink-0 w-12 h-7 mt-1 rounded-[var(--r-pill)]
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]
          ${checked && !disabled
            ? 'bg-[color:var(--color-wise-green)]'
            : 'bg-[color:var(--color-near-black)]/[0.14]'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.03] active:scale-95'}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-5 h-5 rounded-full bg-white
            shadow-[0_1px_3px_rgba(14,15,12,0.25)]
            transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={toggleId}
              className={`text-sm font-semibold ${
                disabled
                  ? 'text-[color:var(--text-muted)]'
                  : 'text-[color:var(--text-primary)]'
              } cursor-pointer min-h-[44px] flex items-center`}
              onClick={() => !disabled && onChange(!checked)}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descriptionId}
              className={`text-xs leading-snug ${
                disabled
                  ? 'text-[color:var(--text-muted)]/60'
                  : 'text-[color:var(--text-muted)]'
              }`}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

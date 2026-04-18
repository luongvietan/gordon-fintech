'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: string;
  displayValue?: string;
  min: number;
  max: number;
  step?: number;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    { label, hint, displayValue, min, max, step = 1, className = '', id, value, ...props },
    ref,
  ) => {
    const sliderId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const numValue = Number(value ?? min);
    const progress = ((numValue - min) / (max - min)) * 100;

    return (
      <div className="flex flex-col gap-2">
        {(label || displayValue) && (
          <div className="flex items-baseline justify-between gap-2">
            {label && (
              <label
                htmlFor={sliderId}
                className="text-xs font-semibold text-[color:var(--text-primary)] tracking-[-0.005em]"
              >
                {label}
              </label>
            )}
            {displayValue && (
              <span
                className="text-sm font-bold tabular-nums text-[color:var(--text-primary)]"
                style={{ fontFamily: 'var(--font-numbers)' }}
              >
                {displayValue}
              </span>
            )}
          </div>
        )}

        <input
          ref={ref}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={`wise-slider ${className}`}
          style={{
            background: `linear-gradient(to right,
              var(--color-wise-green) 0%,
              var(--color-wise-green) ${progress}%,
              rgba(14,15,12,0.10) ${progress}%,
              rgba(14,15,12,0.10) 100%)`,
          }}
          {...props}
        />

        {hint && (
          <p className="text-[11px] text-[color:var(--text-muted)] leading-snug">
            {hint}
          </p>
        )}

        <style jsx>{`
          .wise-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 9999px;
            outline: none;
            cursor: pointer;
            transition: background 150ms ease-out;
          }
          .wise-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--color-near-black);
            border: 3px solid #ffffff;
            box-shadow: var(--shadow-ring);
            cursor: grab;
            transition: transform 150ms ease-out;
          }
          .wise-slider::-webkit-slider-thumb:hover {
            transform: scale(1.12);
          }
          .wise-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(0.96);
          }
          .wise-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--color-near-black);
            border: 3px solid #ffffff;
            box-shadow: var(--shadow-ring);
            cursor: grab;
            transition: transform 150ms ease-out;
          }
          .wise-slider:focus-visible {
            box-shadow: var(--shadow-focus);
          }
        `}</style>
      </div>
    );
  },
);

Slider.displayName = 'Slider';
export default Slider;

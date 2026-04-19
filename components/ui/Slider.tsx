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
      <div className="flex flex-col gap-2.5">
        {(label || displayValue) && (
          <div className="flex items-baseline justify-between gap-2">
            {label && (
              <label
                htmlFor={sliderId}
                className="text-[11.5px] font-bold text-[color:var(--text-primary)] uppercase tracking-[0.04em]"
              >
                {label}
              </label>
            )}
            {displayValue && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-[var(--r-pill)] text-[12px] font-black tabular-nums bg-[color:var(--color-near-black)] text-white"
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
              rgba(14,15,12,0.08) ${progress}%,
              rgba(14,15,12,0.08) 100%)`,
          }}
          {...props}
        />

        {hint && (
          <p className="text-[11px] text-[color:var(--text-muted)] leading-snug font-medium">
            {hint}
          </p>
        )}

        <style jsx>{`
          .wise-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 9999px;
            outline: none;
            cursor: pointer;
            transition: background 150ms ease-out;
          }
          .wise-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid var(--color-near-black);
            box-shadow: 0 2px 8px rgba(14, 15, 12, 0.25);
            cursor: grab;
            transition: transform 150ms ease-out, box-shadow 150ms ease-out;
          }
          .wise-slider::-webkit-slider-thumb:hover {
            transform: scale(1.14);
            box-shadow: 0 4px 14px rgba(14, 15, 12, 0.30);
          }
          .wise-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(0.96);
          }
          .wise-slider::-moz-range-thumb {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid var(--color-near-black);
            box-shadow: 0 2px 8px rgba(14, 15, 12, 0.25);
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

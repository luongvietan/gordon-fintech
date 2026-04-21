'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';

/**
 * NumberField — a controlled numeric input that fixes three recurring
 * React + `<input type="number">` bugs:
 *
 *   1. Leading zero: when a field holds 0 and the user types, the DOM
 *      value is serialized back in from `value={0}` before their
 *      keystroke, producing artifacts like "0270000".
 *   2. Decimal append: clearing a field whose committed value is a
 *      decimal (e.g. 6.5) and typing a new decimal (5.25) would end up
 *      as "6.2525" because the browser re-applied the stale numeric
 *      value between keystrokes.
 *   3. Negative values on fields where negatives are nonsensical
 *      (salary, debt, rate).
 *
 * The fix: we keep the *displayed* text in local string state and only
 * lift a numeric value up to the parent when the user has typed
 * something parseable. Empty string never serializes as 0 — it stays
 * empty while focused, and commits to `min ?? 0` on blur so downstream
 * calculations always see a real number.
 *
 * When the parent pushes a new value down (e.g. selecting a specialty
 * preset, loading a URL share, or hitting Reset), the local text syncs
 * if and only if the new number differs from what we already have —
 * otherwise every keystroke would overwrite the user's in-progress
 * typing.
 */

interface NumberFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  label?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
  value: number | undefined;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** When true, negative entries are silently rejected. Default: min >= 0. */
  nonNegative?: boolean;
  /** Allow decimal values. Default: step-based detection. */
  allowDecimals?: boolean;
  /**
   * When true, clearing the field does NOT snap to `min` / 0 on blur. The
   * field stays empty and `onClear` is fired instead of `onValueChange`.
   * Useful for optional-override inputs where "no value" is a meaningful
   * state distinct from "zero".
   */
  clearable?: boolean;
  onClear?: () => void;
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      label,
      hint,
      prefix,
      suffix,
      error: externalError,
      className = '',
      id,
      value,
      onValueChange,
      min,
      max,
      step,
      nonNegative,
      allowDecimals,
      clearable,
      onClear,
      placeholder,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hintId = inputId ? `${inputId}-hint` : undefined;
    const errId = inputId ? `${inputId}-err` : undefined;

    const effectiveNonNegative =
      nonNegative ?? (typeof min === 'number' ? min >= 0 : true);

    const decimals =
      allowDecimals ?? (typeof step === 'number' ? !Number.isInteger(step) : false);

    // Local string state. We format the numeric value from props on mount
    // and every time it changes externally (e.g. preset applied), but we
    // leave it alone while the user is typing.
    const [text, setText] = useState<string>(
      value === undefined || Number.isNaN(value) ? '' : String(value),
    );
    const [focused, setFocused] = useState(false);
    const [rangeWarning, setRangeWarning] = useState<string | null>(null);

    // External → internal sync using the "derived state from props" pattern
    // recommended by React 19 (no useEffect + setState). We track the
    // previously-seen `value` prop; if the parent pushes a new value that
    // differs from both the previous prop and the currently-displayed text,
    // we resync. This is triggered during render and the extra state update
    // happens before paint, so there's no flicker or cascading render.
    //
    // We only resync when the field isn't focused, which prevents two
    // classes of bugs:
    //   - Input jitter while typing (reformatting "5.25" back to String(5.25)
    //     mid-keystroke would strip in-progress decimals).
    //   - The stale-decimal bug (#2): when the user clears a 6.5 and starts
    //     typing 5.25, `text` goes "" → "5" → "5." → "5.2" → "5.25". None
    //     of those intermediate strings equal the prop value (still 6.5 at
    //     ""/"5"), so without the focus guard the parent would overwrite
    //     "5" with "6.5" between keystrokes.
    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
      setPrevValue(value);
      if (!focused) {
        const parsed = text === '' ? NaN : Number(text);
        const incoming = value ?? NaN;
        const same =
          (Number.isNaN(parsed) && Number.isNaN(incoming)) ||
          parsed === incoming;
        if (!same) {
          setText(
            value === undefined || Number.isNaN(value) ? '' : String(value),
          );
        }
      }
    }

    function commit(raw: string) {
      if (raw === '' || raw === '-' || raw === '.') {
        // Clearable fields keep the empty state instead of snapping to
        // `min` — that's the contract downstream consumers rely on to
        // distinguish "no value set" from "explicit zero".
        if (clearable) {
          setText('');
          setRangeWarning(null);
          onClear?.();
          return;
        }
        // User wiped the field — fall back to min (or 0).
        const fallback = typeof min === 'number' ? min : 0;
        setText(String(fallback));
        onValueChange(fallback);
        setRangeWarning(null);
        return;
      }

      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        const fallback = typeof min === 'number' ? min : 0;
        setText(String(fallback));
        onValueChange(fallback);
        setRangeWarning(null);
        return;
      }

      let clamped = parsed;
      const outOfRange: string[] = [];
      if (effectiveNonNegative && clamped < 0) {
        clamped = typeof min === 'number' ? min : 0;
        outOfRange.push('negative values not allowed');
      }
      if (typeof min === 'number' && clamped < min) {
        clamped = min;
        outOfRange.push(`minimum is ${min}`);
      }
      if (typeof max === 'number' && clamped > max) {
        clamped = max;
        outOfRange.push(`maximum is ${max}`);
      }

      setText(String(clamped));
      onValueChange(clamped);
      setRangeWarning(outOfRange.length ? outOfRange[0] : null);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value;

      // Allow empty, lone minus (if signed), lone decimal point.
      if (raw === '') {
        setText('');
        setRangeWarning(null);
        return;
      }

      // Validate shape before accepting. This is the key to fixing both
      // the leading-zero bug and the decimal-append bug: we strip/clean
      // the *string* itself, then only commit a parsed number when the
      // string is a well-formed numeric literal.
      const allowMinus = !effectiveNonNegative;
      const numericPattern = decimals
        ? allowMinus
          ? /^-?\d*\.?\d*$/
          : /^\d*\.?\d*$/
        : allowMinus
        ? /^-?\d*$/
        : /^\d*$/;

      if (!numericPattern.test(raw)) {
        // Reject the keystroke silently — keep last good text.
        return;
      }

      // Strip leading zeros ("07" → "7", "007" → "7") but keep "0", "0.",
      // "0.5". This is the direct fix for Bug #1 in the guide.
      let cleaned = raw;
      if (/^0\d/.test(cleaned)) {
        cleaned = cleaned.replace(/^0+(?=\d)/, '');
      }
      if (/^-0\d/.test(cleaned)) {
        cleaned = cleaned.replace(/^-0+(?=\d)/, '-');
      }

      setText(cleaned);

      // Only push a parsed number up while the string is a finished
      // number (not a trailing "-", "5.", etc). This prevents the
      // parent's value from flicking around during typing.
      if (cleaned === '' || cleaned === '-' || cleaned.endsWith('.')) {
        setRangeWarning(null);
        return;
      }

      const parsed = Number(cleaned);
      if (Number.isNaN(parsed)) return;

      // Soft range check — we don't rewrite the text while the user is
      // still typing (that would snap "10" to min=100000 mid-keystroke),
      // we just surface a non-blocking warning. Hard clamp happens on
      // blur via commit().
      let warning: string | null = null;
      if (effectiveNonNegative && parsed < 0) warning = 'Must be ≥ 0';
      else if (typeof min === 'number' && parsed < min) warning = `Below minimum of ${min}`;
      else if (typeof max === 'number' && parsed > max) warning = `Above maximum of ${max}`;
      setRangeWarning(warning);

      onValueChange(parsed);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setFocused(false);
      commit(e.target.value);
      onBlur?.(e);
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      setFocused(true);
      onFocus?.(e);
    }

    // Two distinct levels of feedback:
    //   - externalError (hard): caller-provided, treated as a validation
    //     failure. Red ring, red copy, `aria-invalid="true"`. This is the
    //     "your form submit will fail" severity.
    //   - rangeWarning (soft): generated live while typing when the value
    //     sits outside [min, max]. Amber copy, NO red ring, and
    //     `aria-invalid` stays unset — the field is still accepted (the
    //     hard clamp only fires on blur via `commit()`). This mirrors the
    //     guide's "non-blocking" requirement for input validation.
    // If both happen simultaneously the hard error wins.
    const showHardError = !!externalError;
    const showSoftWarning = !showHardError && !!rangeWarning;
    const ariaMessageId = showHardError || showSoftWarning ? errId : hint ? hintId : undefined;

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
            // `inputMode="decimal"` gives mobile users a numeric keyboard
            // without the spinner buttons or weird IME quirks that
            // `type="number"` introduces.
            type="text"
            inputMode={decimals ? 'decimal' : 'numeric'}
            autoComplete="off"
            // Only flag aria-invalid for the hard error. The soft warning
            // is a hint, not a validation failure — a screen reader user
            // should hear "below minimum of 1000" announced politely, but
            // the input shouldn't be marked invalid for their AT.
            aria-invalid={showHardError ? 'true' : undefined}
            aria-describedby={ariaMessageId}
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
              ${showHardError ? 'shadow-[rgba(208,50,56,0.8)_0_0_0_1px]' : ''}
              ${showSoftWarning ? 'shadow-[rgba(181,101,29,0.55)_0_0_0_1px]' : ''}
              ${className}
            `}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-[12px] font-bold text-[color:var(--text-muted)] pointer-events-none select-none uppercase tracking-wider">
              {suffix}
            </span>
          )}
        </div>
        {hint && !showHardError && !showSoftWarning && (
          <p
            id={hintId}
            className="text-[11px] text-[color:var(--text-muted)] leading-snug font-medium"
          >
            {hint}
          </p>
        )}
        {showHardError && (
          <p
            id={errId}
            role="alert"
            aria-live="assertive"
            className="text-[11px] font-semibold text-[color:var(--color-danger)]"
          >
            {externalError}
          </p>
        )}
        {showSoftWarning && (
          <p
            id={errId}
            role="status"
            aria-live="polite"
            className="flex items-start gap-1 text-[11px] font-semibold text-[#b5651d]"
          >
            <span aria-hidden="true" className="leading-none translate-y-[1px]">⚠</span>
            <span>{rangeWarning}</span>
          </p>
        )}
      </div>
    );
  },
);

NumberField.displayName = 'NumberField';
export default NumberField;

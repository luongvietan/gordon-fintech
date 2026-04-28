import type { CalculatorInputs } from './calculator';

/**
 * Share-link (de)serialization for the calculator.
 *
 * We encode *only the diff* from a known default into a base64url string and
 * stuff it into a `?s=` query param. The page reads it on mount and rehydrates
 * state. This keeps URLs short, keeps all data client-side (consistent with
 * the calculator's privacy stance — the server never stores or logs anything),
 * and survives being pasted into iMessage / email / Slack without mangling.
 */

/** Query param key used in share URLs. */
export const SHARE_PARAM = 's';

/**
 * Whitelist of CalculatorInputs keys we accept from a share URL. Anything not
 * in this list is silently dropped during decode to avoid letting a hostile
 * link inject unknown fields into app state.
 */
const ALLOWED_KEYS = [
  'totalDebt',
  'actualRepaymentEnabled',
  'currentBalance',
  'pslfQualifyingPaymentsMade',
  'repaymentStartMonth',
  'repaymentStartYear',
  'interestRate',
  'loanType',
  'residencyYears',
  'fellowshipYears',
  'fellowshipSalary',
  'residencyStartingSalary',
  'attendingSalary',
  'residentSalaryGrowthRate',
  'attendingSalaryGrowthRate',
  'monthlyPaymentResidencyOverride',
  'monthlyPaymentOverride',
  'pslfEnabled',
  'pslfResidencyQualifies',
  'livingExpensesResidency',
  'livingExpensesAttending',
  'taxRate',
  'inflationRate',
  'investmentReturn',
  'capitalizeOnlyAfterTraining',
  'mfsExtraTaxRatePct',
  'taxBombRateOverride',
  'scenarioPreset',
  'refinanceEnabled',
  'refinanceRate',
  'refinanceTermYears',
  'refinanceOrigFeePct',
  'spouseEnabled',
  'spouseIncome',
  'spouseIncomeGrowthRate',
  'spouseDebt',
  'spouseRepaymentStrategy',
  'filingStatus',
  'familySize',
  'jobChangeEnabled',
  'jobChangeYear',
  'jobChangeAttendingSalary',
  'jobChangePslfQualifies',
  'idrPlan',
  'idrPaymentPct',
] as const satisfies readonly (keyof CalculatorInputs)[];

type AllowedKey = (typeof ALLOWED_KEYS)[number];
const ALLOWED_SET = new Set<string>(ALLOWED_KEYS);

function base64UrlEncode(input: string): string {
  const b64 =
    typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(input)))
      : Buffer.from(input, 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(input: string): string {
  const padded = input + '==='.slice((input.length + 3) % 4);
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(b64)));
  }
  return Buffer.from(b64, 'base64').toString('utf-8');
}

/**
 * Shallow-diff `inputs` against `defaults` and return a base64url-encoded
 * JSON blob. Fields equal to the default are omitted so a pristine calc still
 * produces an empty-ish, copy-friendly URL.
 */
export function encodeInputs(
  inputs: CalculatorInputs,
  defaults: CalculatorInputs,
): string {
  const diff: Partial<CalculatorInputs> = {};
  for (const key of ALLOWED_KEYS) {
    const a = inputs[key];
    const b = defaults[key];
    if (a !== b && a !== undefined) {
      (diff as Record<string, unknown>)[key] = a;
    }
  }
  return base64UrlEncode(JSON.stringify(diff));
}

/**
 * Decode a share-link payload back into CalculatorInputs. Merges on top of
 * `defaults`, accepting only whitelisted keys and validating the expected
 * primitive shape. Returns `null` on any malformed input.
 */
export function decodeInputs(
  encoded: string,
  defaults: CalculatorInputs,
): CalculatorInputs | null {
  try {
    const json = base64UrlDecode(encoded);
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const safe: Partial<CalculatorInputs> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!ALLOWED_SET.has(key)) continue;
      const k = key as AllowedKey;
      const defVal = defaults[k];
      const defType = typeof defVal;

      if (defType === 'number' && typeof value === 'number' && Number.isFinite(value)) {
        (safe as Record<string, unknown>)[k] = value;
      } else if (defType === 'boolean' && typeof value === 'boolean') {
        (safe as Record<string, unknown>)[k] = value;
      } else if (defType === 'string' && typeof value === 'string') {
        (safe as Record<string, unknown>)[k] = value;
      } else if (defVal === undefined) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          (safe as Record<string, unknown>)[k] = value;
        } else if (typeof value === 'boolean' || typeof value === 'string') {
          (safe as Record<string, unknown>)[k] = value;
        }
      }
    }

    return { ...defaults, ...safe };
  } catch {
    return null;
  }
}

/**
 * Build a full shareable URL for the current page, preserving existing path
 * and hash but replacing (or setting) the share param.
 */
export function buildShareUrl(encoded: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  if (encoded) {
    url.searchParams.set(SHARE_PARAM, encoded);
  } else {
    url.searchParams.delete(SHARE_PARAM);
  }
  return url.toString();
}

/**
 * Peer benchmarks — "Doctors like you typically..."
 *
 * Hardcoded lookup table keyed by specialty group. Every row is an
 * AAMC/MGMA-derived range that lets the calculator render a sentence like:
 *   "Primary-care doctors with ~$250K debt who pursue PSLF typically reach
 *    debt-free in 10–12 years. Your projection: 10y — on track."
 *
 * Sources cited per row so the calculator can render a tiny "via AAMC 2024"
 * footer without back-and-forth research. Numbers refresh annually.
 */

import { SPECIALTIES, getSpecialtyById } from './specialties';

export interface PeerBenchmark {
  /** Group label shown to the user. */
  label: string;
  /** Typical total med-school debt range (USD). */
  typicalDebt: [number, number];
  /** Typical years to debt-free if pursuing PSLF. */
  pslfYears: [number, number];
  /** Typical years to debt-free with aggressive payoff. */
  aggressiveYears: [number, number];
  /** Citation string. */
  source: string;
}

const PRIMARY_CARE: PeerBenchmark = {
  label: 'Primary-care physicians',
  typicalDebt: [200_000, 280_000],
  pslfYears: [10, 12],
  aggressiveYears: [7, 9],
  source: 'AAMC 2024 Education Debt Report; MGMA 2024 Compensation Survey',
};

const MID_TIER: PeerBenchmark = {
  label: 'Mid-tier specialists',
  typicalDebt: [220_000, 300_000],
  pslfYears: [10, 13],
  aggressiveYears: [6, 9],
  source: 'AAMC 2024; Medscape Physician Compensation Report 2024',
};

const HIGH_EARNER: PeerBenchmark = {
  label: 'High-earning specialists',
  typicalDebt: [220_000, 320_000],
  pslfYears: [10, 14],
  aggressiveYears: [4, 7],
  source: 'AAMC 2024; MGMA 2024 (Surgery / Procedural)',
};

const SPECIALTY_TO_GROUP: Record<string, PeerBenchmark> = {
  'primary-care': PRIMARY_CARE,
  'internal-medicine': PRIMARY_CARE,
  'family-medicine': PRIMARY_CARE,
  'pediatrics': PRIMARY_CARE,
  'psychiatry': PRIMARY_CARE,

  'emergency-medicine': MID_TIER,
  'neurology': MID_TIER,
  'pathology': MID_TIER,
  'anesthesiology': MID_TIER,

  'radiology': HIGH_EARNER,
  'dermatology': HIGH_EARNER,
  'general-surgery': HIGH_EARNER,
  'orthopedics': HIGH_EARNER,
  'cardiology': HIGH_EARNER,
  'gastroenterology': HIGH_EARNER,
  'neurosurgery': HIGH_EARNER,
};

/**
 * Return the peer benchmark matching the user's specialty (or a sensible
 * fallback by salary band if the specialty isn't identified).
 */
export function getPeerBenchmark(
  specialtyId: string | undefined,
  attendingSalary: number,
): PeerBenchmark {
  if (specialtyId) {
    const exact = SPECIALTY_TO_GROUP[specialtyId];
    if (exact) return exact;
    const spec = getSpecialtyById(specialtyId);
    if (spec) return SPECIALTY_TO_GROUP[spec.id] ?? MID_TIER;
  }
  if (attendingSalary >= 450_000) return HIGH_EARNER;
  if (attendingSalary <= 260_000) return PRIMARY_CARE;
  return MID_TIER;
}

/**
 * Produce a human-readable comparison sentence + status for use in a UI
 * note. `status` is what color/icon the UI should reach for.
 */
export function comparePeerBenchmark(
  benchmark: PeerBenchmark,
  userPayoffYears: number,
  isPslf: boolean,
): {
  range: [number, number];
  status: 'on-track' | 'ahead' | 'behind';
  sentence: string;
} {
  const range = isPslf ? benchmark.pslfYears : benchmark.aggressiveYears;
  const [low, high] = range;
  let status: 'on-track' | 'ahead' | 'behind';
  if (userPayoffYears < low) status = 'ahead';
  else if (userPayoffYears > high) status = 'behind';
  else status = 'on-track';

  const phrase = isPslf
    ? `${benchmark.label} pursuing PSLF typically reach debt-free in ${low}\u2013${high} years.`
    : `${benchmark.label} on aggressive payoff typically reach debt-free in ${low}\u2013${high} years.`;

  const verdict =
    status === 'on-track'
      ? `Your projection: ${userPayoffYears}y \u2014 on track.`
      : status === 'ahead'
      ? `Your projection: ${userPayoffYears}y \u2014 ahead of average.`
      : `Your projection: ${userPayoffYears}y \u2014 longer than typical, worth re-checking inputs.`;

  return { range, status, sentence: `${phrase} ${verdict}` };
}

/** Re-export specialty list for downstream consumers. */
export { SPECIALTIES };

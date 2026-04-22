/**
 * Specialty salary + training-duration presets.
 *
 * Source: Medical Debt Calculator Specification v4 (PDF, pp.1–2).
 * Salaries are median first-year attending; training duration includes
 * residency + fellowship where listed in PDF.
 */

export interface Specialty {
  id: string;
  label: string;
  attendingSalary: number;   // median annual attending salary (USD)
  /** Total training duration (residency + fellowship) used for calculations. */
  residencyYears: number;
  /**
   * Optional human-readable range label (e.g. "5–7y"). Used in dropdowns
   * where PDF spec lists a variable training duration.
   */
  trainingLabel?: string;
  /**
   * Typical fellowship years baked into `residencyYears`.
   * Used to pre-fill the optional fellowship input when the user switches
   * to "model residency + fellowship separately".
   */
  fellowshipYears?: number;
}

export const SPECIALTIES: Specialty[] = [
  // Primary care / generalist
  { id: 'primary-care',        label: 'Primary Care',        attendingSalary: 220000, residencyYears: 3 },
  { id: 'internal-medicine',   label: 'Internal Medicine',   attendingSalary: 240000, residencyYears: 3 },
  { id: 'family-medicine',     label: 'Family Medicine',     attendingSalary: 215000, residencyYears: 3 },
  { id: 'pediatrics',          label: 'Pediatrics',          attendingSalary: 210000, residencyYears: 3 },

  // Mid-tier
  { id: 'emergency-medicine',  label: 'Emergency Medicine',  attendingSalary: 350000, residencyYears: 4, trainingLabel: '3–4y' },
  { id: 'psychiatry',          label: 'Psychiatry',          attendingSalary: 280000, residencyYears: 4 },
  { id: 'neurology',           label: 'Neurology',           attendingSalary: 300000, residencyYears: 4 },
  { id: 'pathology',           label: 'Pathology',           attendingSalary: 300000, residencyYears: 4 },

  // Procedural / high-income
  { id: 'anesthesiology',      label: 'Anesthesiology',      attendingSalary: 400000, residencyYears: 4 },
  { id: 'radiology',           label: 'Radiology',           attendingSalary: 420000, residencyYears: 5 },
  { id: 'dermatology',         label: 'Dermatology',         attendingSalary: 500000, residencyYears: 4 },
  { id: 'general-surgery',     label: 'General Surgery',     attendingSalary: 450000, residencyYears: 6, trainingLabel: '5–7y' },

  // Surgical specialty / high-end
  { id: 'orthopedics',         label: 'Orthopedic Surgery',  attendingSalary: 550000, residencyYears: 5 },
  { id: 'cardiology',          label: 'Cardiology',          attendingSalary: 500000, residencyYears: 7, trainingLabel: '6–8y', fellowshipYears: 3 },
  { id: 'gastroenterology',    label: 'Gastroenterology',    attendingSalary: 550000, residencyYears: 6, trainingLabel: '6–7y', fellowshipYears: 3 },
  { id: 'neurosurgery',        label: 'Neurosurgery',        attendingSalary: 700000, residencyYears: 7 },
];

/** National average resident salary (AAMC 2025). */
export const RESIDENT_SALARY = 65000;

/** 150% of federal poverty level for a single person (2025 guidelines). */
export const POVERTY_LINE_150 = 22590;

/**
 * 150% of the 2025 federal poverty line, keyed by household size.
 * Source: HHS 2025 Poverty Guidelines (48 contiguous states + DC).
 * Used by IDR discretionary-income math:
 *   discretionary = max(0, AGI − POVERTY_150(familySize))
 *
 * For households > 8 we add the marginal per-person amount
 * ($5,500 × 1.5 ≈ $8,250) consistent with the HHS methodology.
 */
const POVERTY_150_BY_FAMILY: Record<number, number> = {
  1: 22590,
  2: 30660,
  3: 38730,
  4: 46800,
  5: 54870,
  6: 62940,
  7: 71010,
  8: 79080,
};
const EXTRA_PER_PERSON = 8250;

export function povertyLine150(familySize: number = 1): number {
  const n = Math.max(1, Math.round(familySize));
  if (POVERTY_150_BY_FAMILY[n] != null) return POVERTY_150_BY_FAMILY[n];
  return POVERTY_150_BY_FAMILY[8] + (n - 8) * EXTRA_PER_PERSON;
}

export function getSpecialtyById(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id);
}

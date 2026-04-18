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
  residencyYears: number;    // total training duration (residency + fellowship)
}

export const SPECIALTIES: Specialty[] = [
  // Primary care / generalist
  { id: 'primary-care',        label: 'Primary Care',        attendingSalary: 220000, residencyYears: 3 },
  { id: 'internal-medicine',   label: 'Internal Medicine',   attendingSalary: 240000, residencyYears: 3 },
  { id: 'family-medicine',     label: 'Family Medicine',     attendingSalary: 215000, residencyYears: 3 },
  { id: 'pediatrics',          label: 'Pediatrics',          attendingSalary: 210000, residencyYears: 3 },

  // Mid-tier
  { id: 'emergency-medicine',  label: 'Emergency Medicine',  attendingSalary: 350000, residencyYears: 4 },
  { id: 'psychiatry',          label: 'Psychiatry',          attendingSalary: 280000, residencyYears: 4 },
  { id: 'neurology',           label: 'Neurology',           attendingSalary: 300000, residencyYears: 4 },
  { id: 'pathology',           label: 'Pathology',           attendingSalary: 300000, residencyYears: 4 },

  // Procedural / high-income
  { id: 'anesthesiology',      label: 'Anesthesiology',      attendingSalary: 400000, residencyYears: 4 },
  { id: 'radiology',           label: 'Radiology',           attendingSalary: 420000, residencyYears: 5 },
  { id: 'dermatology',         label: 'Dermatology',         attendingSalary: 500000, residencyYears: 4 },
  { id: 'general-surgery',     label: 'General Surgery',     attendingSalary: 450000, residencyYears: 6 },

  // Surgical specialty / high-end
  { id: 'orthopedics',         label: 'Orthopedic Surgery',  attendingSalary: 550000, residencyYears: 5 },
  { id: 'cardiology',          label: 'Cardiology',          attendingSalary: 500000, residencyYears: 7 },
  { id: 'gastroenterology',    label: 'Gastroenterology',    attendingSalary: 550000, residencyYears: 6 },
  { id: 'neurosurgery',        label: 'Neurosurgery',        attendingSalary: 700000, residencyYears: 7 },
];

/** National average resident salary (AAMC 2024). */
export const RESIDENT_SALARY = 65000;

/** 150% of federal poverty level for a single person (2024). */
export const POVERTY_LINE_150 = 22590;

export function getSpecialtyById(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id);
}

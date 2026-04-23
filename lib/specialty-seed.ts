/**
 * Shared helper for seeding the calculator from a specialty slug.
 *
 * Lives in its own file (rather than `specialties.ts`) to avoid an
 * import cycle: `calculator.ts` already imports from `specialties.ts`
 * for poverty-line data, so `specialties.ts` can't refer back to
 * `CalculatorInputs` without creating a loop.
 */
import type { CalculatorInputs } from './calculator';
import { RESIDENT_SALARY, getSpecialtyById } from './specialties';

/**
 * Build a CalculatorInputs seed from a specialty slug. Used by:
 *   • /specialty/[slug] CTA that passes `?specialty=<id>` to /calculator
 *   • /calculator?specialty=<id> direct links (blog CTAs, specialty cards)
 *
 * We only override fields the specialty profile actually drives — every
 * other input falls back to the app-wide default, so toggling PSLF or
 * spouse still works exactly as expected.
 *
 * Fellowship handling: when a specialty declares `fellowshipYears`, we
 * split the total training duration into residency-only + fellowship so
 * the UI can render "residency + fellowship" correctly. For specialties
 * that bake everything into `residencyYears` (e.g. Dermatology), we
 * leave fellowshipYears at 0.
 */
export function seedFromSpecialty(slug: string): Partial<CalculatorInputs> | undefined {
  const s = getSpecialtyById(slug);
  if (!s) return undefined;
  const fellowshipYears = s.fellowshipYears ?? 0;
  const residencyOnly = Math.max(1, s.residencyYears - fellowshipYears);
  return {
    attendingSalary: s.attendingSalary,
    residencyYears: residencyOnly,
    fellowshipYears,
    residencyStartingSalary: RESIDENT_SALARY,
  };
}

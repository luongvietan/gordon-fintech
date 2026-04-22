/**
 * Per-specialty narrative content for /specialty/[slug] landing pages.
 *
 * Structural separation from `specialties.ts` on purpose — that file is
 * the canonical source of calculator math defaults (salary, training
 * years). This file is the SEO/narrative layer: headline copy, common
 * debt ranges, PSLF fit, typical career-path notes, and anything else
 * we'd want to swap or translate without touching the math.
 *
 * All figures are rounded ranges, sourced from AAMC Graduation
 * Questionnaire (median debt), MGMA 2025 / Doximity 2025 compensation
 * reports (salary ranges), and public PSLF participation data where
 * available. Citations live in `doc/sources.md` for the stats page.
 */
import type { Specialty } from './specialties';
import { SPECIALTIES } from './specialties';

export interface SpecialtyProfile {
  /** Mirrors Specialty.id — used as the URL slug. */
  id: string;
  /** SEO H1 — "Cardiology student loan repayment" style. */
  h1: string;
  /** OG/meta description (<160 chars). */
  metaDescription: string;
  /** Eyebrow above H1. */
  eyebrow: string;
  /**
   * 1–2 sentences introducing the specialty's repayment landscape.
   * Shown above the calculator.
   */
  intro: string;
  /** Typical AAMC median debt band for grads entering this specialty. */
  typicalDebt: { low: number; median: number; high: number };
  /** Typical attending salary band (MGMA 2025). */
  salaryBand: { low: number; median: number; high: number };
  /** "Best strategy" opinion + a two-sentence explainer. */
  strategyPick: {
    label: string;
    reason: string;
  };
  /** PSLF fit: "Often", "Mixed", "Rarely" + one-sentence rationale. */
  pslfFit: 'often' | 'mixed' | 'rarely';
  pslfNote: string;
  /** Key 3–5 bullet facts that surface under the calc. */
  bullets: string[];
}

/**
 * Content by slug. Kept inline rather than dynamically generated so
 * copy tweaks don't ripple into math behavior. Every entry maps 1:1
 * to an entry in SPECIALTIES — the dynamic route asserts this at build
 * time via `generateStaticParams`.
 */
export const SPECIALTY_PROFILES: Record<string, SpecialtyProfile> = {
  'primary-care': {
    id: 'primary-care',
    h1: 'Primary Care Student Loan Repayment',
    eyebrow: 'Specialty · Primary Care',
    metaDescription:
      'Primary care pays ~$220K; residency is 3 years. PSLF usually wins by $100K+ vs. aggressive payoff on federal loans. Run your numbers.',
    intro:
      "Primary-care attendings land around $220K and train just three years. With moderate attending income and one of the shortest paths to PSLF, nonprofit-employed PCPs typically come out six figures ahead choosing PSLF over aggressive payoff.",
    typicalDebt: { low: 180000, median: 220000, high: 280000 },
    salaryBand: { low: 190000, median: 220000, high: 260000 },
    strategyPick: {
      label: 'PSLF (if federal + nonprofit)',
      reason:
        'Three short residency years + modest attending income = small IDR payments and ~$120K–180K forgiven tax-free at year 10. Hard to beat if you work at a 501(c)(3) or public hospital.',
    },
    pslfFit: 'often',
    pslfNote:
      'Most primary-care attendings work in settings that qualify for PSLF (FQHCs, academic medicine, VA, large nonprofit systems).',
    bullets: [
      '3-year residency → PSLF year-10 forgiveness lands 3 years into attending',
      'Lower attending salary keeps IDR payments small, maximizing forgiven amount',
      'Refinancing rarely wins — the federal IDR floor during training is too valuable',
    ],
  },
  'internal-medicine': {
    id: 'internal-medicine',
    h1: 'Internal Medicine Student Loan Repayment',
    eyebrow: 'Specialty · Internal Medicine',
    metaDescription:
      'Internal medicine attending salaries cluster around $240K after a 3-year residency. Whether PSLF beats aggressive payoff depends on your debt load and employer type.',
    intro:
      'Internal medicine is a 3-year residency ending in an attending salary near $240K. Two different futures split the decision: hospital-employed IM docs at nonprofits usually win with PSLF; private-practice IM docs often prefer refinancing or aggressive payoff.',
    typicalDebt: { low: 200000, median: 230000, high: 300000 },
    salaryBand: { low: 210000, median: 240000, high: 290000 },
    strategyPick: {
      label: 'PSLF at a nonprofit, refinance in private practice',
      reason:
        'With a 3-year training track, PSLF clears the decade at year 10 of attending. If you land in private practice, refinancing to 3–5% knocks 2–4 years off payoff and saves $30K–80K in interest.',
    },
    pslfFit: 'mixed',
    pslfNote:
      'PSLF fit depends heavily on employer: academic + VA + large health-system jobs usually qualify; private practice usually does not.',
    bullets: [
      'Subspecialty fellowship (cards, GI, etc.) adds 3 years and usually makes PSLF easier',
      'Hospitalist income at $300K+ starts to tilt math toward aggressive payoff',
      'Refinance offers cluster around 4–5% for high-credit attending IM docs',
    ],
  },
  'family-medicine': {
    id: 'family-medicine',
    h1: 'Family Medicine Student Loan Repayment',
    eyebrow: 'Specialty · Family Medicine',
    metaDescription:
      'Family medicine at ~$215K after 3-year residency. PSLF + rural practice loan repayment programs usually dominate the math.',
    intro:
      'Family medicine is a 3-year residency ending around $215K. The specialty is uniquely positioned for PSLF stacking with state/federal rural repayment programs (NHSC, state HRSA), which can make effective payoff nearly free.',
    typicalDebt: { low: 180000, median: 210000, high: 270000 },
    salaryBand: { low: 190000, median: 215000, high: 250000 },
    strategyPick: {
      label: 'PSLF + NHSC/state program stacking',
      reason:
        'FM\u2019s community-health pipeline fits the NHSC Loan Repayment Program (up to $50K for 2 years rural service) which is stackable with PSLF. Many FM docs graduate effectively debt-free.',
    },
    pslfFit: 'often',
    pslfNote:
      'FQHCs, community health centers, rural hospitals, and state-HRSA designated sites almost universally qualify for PSLF.',
    bullets: [
      'NHSC + state loan repayment programs stack cleanly with PSLF',
      '3-year residency = PSLF forgiveness lands at year 13 total (10-year attending clock)',
      'Refinancing rarely beats the PSLF + grant stacking combo',
    ],
  },
  'pediatrics': {
    id: 'pediatrics',
    h1: 'Pediatrics Student Loan Repayment',
    eyebrow: 'Specialty · Pediatrics',
    metaDescription:
      'General pediatrics pays ~$210K after 3-year residency — the specialty where PSLF most reliably beats aggressive payoff by $150K+.',
    intro:
      'Pediatrics has one of the lowest attending salaries among all specialties (~$210K) against a similar debt load to peers. That math makes PSLF the clear winner for the majority of federal-loan pediatricians working in academic or nonprofit settings.',
    typicalDebt: { low: 180000, median: 215000, high: 280000 },
    salaryBand: { low: 180000, median: 210000, high: 260000 },
    strategyPick: {
      label: 'PSLF (strong fit)',
      reason:
        'Low attending salary keeps IDR payments small, which maximizes forgiven balance. Typical pediatric academic-medicine career path gets $150K+ forgiven tax-free.',
    },
    pslfFit: 'often',
    pslfNote:
      "Academic pediatrics and nonprofit children's hospitals are the two dominant career paths — both PSLF-qualifying.",
    bullets: [
      'Pediatric subspecialty fellowships (cards, onc, crit care) add 3 years — usually still favors PSLF',
      'Aggressive payoff only wins if you plan to go into private-practice pediatrics',
      'Lowest salary in the calculator → highest typical PSLF savings',
    ],
  },
  'emergency-medicine': {
    id: 'emergency-medicine',
    h1: 'Emergency Medicine Student Loan Repayment',
    eyebrow: 'Specialty · Emergency Medicine',
    metaDescription:
      'EM attendings pull ~$350K after 3–4 years of residency. Short training + high income + mixed PSLF eligibility makes aggressive payoff or refinancing competitive.',
    intro:
      'Emergency medicine graduates fastest (3\u20134 years) into the highest non-surgical salary band (~$350K). With mixed PSLF eligibility depending on employer type, EM docs often find aggressive payoff or refinancing competitive with PSLF.',
    typicalDebt: { low: 200000, median: 240000, high: 310000 },
    salaryBand: { low: 300000, median: 350000, high: 450000 },
    strategyPick: {
      label: 'Aggressive payoff or refinance (if non-PSLF)',
      reason:
        'High income + short training lets EM docs knock out debt in 3\u20135 attending years. Refinance to 4% saves 5-figures in interest vs. federal IDR.',
    },
    pslfFit: 'mixed',
    pslfNote:
      'Academic and nonprofit hospital-employed EM docs qualify; contract-group EM docs often do NOT (many contract groups are for-profit LLCs).',
    bullets: [
      'Contract-group employment is the #1 PSLF disqualifier in EM',
      '3\u20134 year residency = fastest to high-income — refinancing math works fast',
      'High income + typical $240K debt often means aggressive payoff in 4\u20136 years',
    ],
  },
  'psychiatry': {
    id: 'psychiatry',
    h1: 'Psychiatry Student Loan Repayment',
    eyebrow: 'Specialty · Psychiatry',
    metaDescription:
      'Psychiatry pays ~$280K after 4-year residency. Strong PSLF fit in community mental health, academic, and VA settings.',
    intro:
      'Psychiatry is a 4-year residency ending around $280K. Most psychiatrists work in settings that qualify for PSLF — academic programs, community mental health, VA/military — making PSLF the statistically dominant strategy.',
    typicalDebt: { low: 200000, median: 230000, high: 290000 },
    salaryBand: { low: 250000, median: 280000, high: 350000 },
    strategyPick: {
      label: 'PSLF (strong fit)',
      reason:
        'Community mental health centers, VA, and academic psychiatry are all PSLF-qualifying. Moderate attending salary + 4-year residency = sizable forgiven balance.',
    },
    pslfFit: 'often',
    pslfNote:
      'VA, community mental health centers (CMHCs), and academic psychiatry programs dominate the job market — all PSLF-qualifying.',
    bullets: [
      'Telehealth / private-practice psychiatry is the main non-PSLF path',
      'Child and adolescent psych fellowship adds 2 years, still favors PSLF',
      '4-year residency → PSLF forgiveness at year 14 total',
    ],
  },
  'neurology': {
    id: 'neurology',
    h1: 'Neurology Student Loan Repayment',
    eyebrow: 'Specialty · Neurology',
    metaDescription:
      'Neurology pays ~$300K after 4-year residency. Typically academic or hospital-employed — both strong PSLF settings.',
    intro:
      'Neurology trains 4 years and lands near $300K. The specialty is dominated by academic and hospital-employed practice patterns, both of which tend to qualify for PSLF.',
    typicalDebt: { low: 200000, median: 230000, high: 290000 },
    salaryBand: { low: 260000, median: 300000, high: 370000 },
    strategyPick: {
      label: 'PSLF if academic/hospital, aggressive payoff if private',
      reason:
        'Academic neurology PSLF math is solid (~$100K forgiven). Private neurology is rarer but when it exists, aggressive payoff at $300K income finishes in 5\u20137 years.',
    },
    pslfFit: 'often',
    pslfNote:
      'Most neurologists practice at academic centers or large nonprofit hospital systems; PSLF eligibility is high.',
    bullets: [
      'Subspecialty fellowships (stroke, epilepsy, neuroimmun) add 1\u20132 years',
      'Interventional / vascular neurology pushes salary past $400K — aggressive payoff gets attractive',
      '4-year residency is long enough that PSLF consolidation rules matter — plan early',
    ],
  },
  'pathology': {
    id: 'pathology',
    h1: 'Pathology Student Loan Repayment',
    eyebrow: 'Specialty · Pathology',
    metaDescription:
      'Pathology pays ~$300K after 4-year residency. Strong PSLF fit if academic; refinancing attractive in private lab settings.',
    intro:
      'Pathology is a 4-year residency landing around $300K. PSLF fit bifurcates cleanly: academic pathologists qualify easily; private-lab pathologists usually do not.',
    typicalDebt: { low: 200000, median: 230000, high: 290000 },
    salaryBand: { low: 260000, median: 300000, high: 370000 },
    strategyPick: {
      label: 'Academic: PSLF. Private lab: refinance.',
      reason:
        'Academic path programs are PSLF-qualifying and easy to predict. Private-lab jobs at for-profit entities are not — refinancing to ~4% with aggressive payoff wins that case.',
    },
    pslfFit: 'mixed',
    pslfNote:
      'Academic and hospital-employed pathologists qualify; LabCorp / Quest / private-group pathologists usually do not.',
    bullets: [
      'Fellowship (e.g. hemepath, cytopath) adds 1 year — often required for competitive jobs',
      "Private lab compensation climbs quickly after year 1 — aggressive payoff realistic",
      'Academic path starting salary is at the lower end of the $260K-$370K band',
    ],
  },
  'anesthesiology': {
    id: 'anesthesiology',
    h1: 'Anesthesiology Student Loan Repayment',
    eyebrow: 'Specialty · Anesthesiology',
    metaDescription:
      'Anesthesiology pays ~$400K after 4-year residency. Often private-practice or AMC contract — aggressive payoff and refinance typically dominate.',
    intro:
      'Anesthesiology trains 4 years and reaches ~$400K attending income. Most anesthesiologists practice in settings that do NOT qualify for PSLF (AMC contract groups, private-practice groups), so aggressive payoff and refinancing usually dominate.',
    typicalDebt: { low: 200000, median: 230000, high: 290000 },
    salaryBand: { low: 350000, median: 400000, high: 500000 },
    strategyPick: {
      label: 'Aggressive payoff or refinance',
      reason:
        'High attending salary + typical 4-year residency + rare PSLF qualifying = refinance to 4% and pay off in 3\u20135 years is usually the winning move.',
    },
    pslfFit: 'rarely',
    pslfNote:
      'The dominant employment models (AMC contract groups, private anesthesia groups) are for-profit and NOT PSLF-qualifying. Academic anesthesiology is the exception.',
    bullets: [
      "Pain-management fellowship adds 1 year; usually doesn't change PSLF math materially",
      'Hospital W-2 employed anesthesia (less common) may qualify for PSLF',
      'Refinance competitive rates for anesthesiologists start around 4%',
    ],
  },
  'radiology': {
    id: 'radiology',
    h1: 'Radiology Student Loan Repayment',
    eyebrow: 'Specialty · Radiology',
    metaDescription:
      'Radiology pays ~$420K after 5-year training. Private-practice dominant; aggressive payoff and refinance usually win.',
    intro:
      "Radiology's 5-year training (1 intern + 4 residency + 1 fellowship is typical) lands around $420K. Private-practice radiology dominates the job market, so PSLF is usually not available — aggressive payoff or refinancing tend to win.",
    typicalDebt: { low: 200000, median: 230000, high: 290000 },
    salaryBand: { low: 380000, median: 420000, high: 540000 },
    strategyPick: {
      label: 'Refinance + aggressive payoff',
      reason:
        'At $420K income and typical $230K debt, refinancing to 4% and paying off in 4 years saves $60K+ vs. federal standard repayment.',
    },
    pslfFit: 'rarely',
    pslfNote:
      'Private-practice radiology groups are the overwhelming norm — non-PSLF. Academic radiology (smaller, lower-paid) is the PSLF-eligible minority.',
    bullets: [
      'Interventional radiology fellowship adds 1 year',
      'Teleradiology/locums can pay even higher but are almost never PSLF-eligible',
      'High early-career earning + short training = refinance math is unbeatable',
    ],
  },
  'dermatology': {
    id: 'dermatology',
    h1: 'Dermatology Student Loan Repayment',
    eyebrow: 'Specialty · Dermatology',
    metaDescription:
      'Dermatology pays ~$500K after 4-year training. Private-practice dominant; aggressive payoff + refinance almost always win.',
    intro:
      'Dermatology trains 4 years (1 intern + 3 derm residency) and lands near $500K. Nearly 90% of dermatologists practice outside PSLF-qualifying settings, so the strategy math is simple: refinance and pay off fast.',
    typicalDebt: { low: 200000, median: 230000, high: 290000 },
    salaryBand: { low: 430000, median: 500000, high: 650000 },
    strategyPick: {
      label: 'Refinance + aggressive payoff',
      reason:
        'At $500K income, typical $230K debt pays off in 2\u20134 years. Refinancing to 4% saves $40K\u2013$70K in interest vs. federal standard plan.',
    },
    pslfFit: 'rarely',
    pslfNote:
      'Private-practice and cosmetic dermatology are the dominant paths. Academic dermatology is tiny and highly competitive.',
    bullets: [
      'Mohs surgery fellowship (1 year) adds $100K+ to salary but is not PSLF-relevant',
      'Cosmetic-heavy practices often exceed $600K+ attending income',
      'Fastest payoff timelines of any specialty in the calculator',
    ],
  },
  'general-surgery': {
    id: 'general-surgery',
    h1: 'General Surgery Student Loan Repayment',
    eyebrow: 'Specialty · General Surgery',
    metaDescription:
      'General surgery pays ~$450K after 5\u20137 years of training. Long residency + academic/community split gives mixed PSLF math.',
    intro:
      'General surgery trains 5\u20137 years (research years common) and lands around $450K. The long training phase accrues significant interest, but also accumulates PSLF-qualifying months if residency is academic.',
    typicalDebt: { low: 210000, median: 240000, high: 310000 },
    salaryBand: { low: 400000, median: 450000, high: 550000 },
    strategyPick: {
      label: 'PSLF at academic center; refi for private practice',
      reason:
        'A 5\u20137 year academic residency = 60\u201384 PSLF-qualifying months before attending. Private-practice surgeons should refinance and attack with high income.',
    },
    pslfFit: 'mixed',
    pslfNote:
      'Academic general surgery is PSLF-eligible; private-practice general surgery is not.',
    bullets: [
      'Trauma / critical-care / colorectal fellowships add 1\u20132 years',
      'Long residency makes capitalized interest a bigger risk \u2014 federal IDR during training matters',
      'Surgical income comes online late \u2014 crossover year typically 4\u20136 years into attending',
    ],
  },
  'orthopedics': {
    id: 'orthopedics',
    h1: 'Orthopedic Surgery Student Loan Repayment',
    eyebrow: 'Specialty · Orthopedic Surgery',
    metaDescription:
      'Orthopedic surgery pays ~$550K after 5-year residency. Mostly private-practice; aggressive payoff + refinance win decisively.',
    intro:
      'Orthopedic surgery is a 5-year residency landing ~$550K (often higher with subspecialty fellowship). The specialty is overwhelmingly private-practice, making aggressive payoff and refinancing the default winners.',
    typicalDebt: { low: 210000, median: 240000, high: 310000 },
    salaryBand: { low: 480000, median: 550000, high: 720000 },
    strategyPick: {
      label: 'Refinance + aggressive payoff',
      reason:
        'High attending income at $550K+ makes aggressive payoff obliterate debt in 2\u20134 years. Refi to ~4% saves meaningful interest during payoff.',
    },
    pslfFit: 'rarely',
    pslfNote:
      'Private orthopedic groups dominate; academic orthopedics is rarer and lower-paid.',
    bullets: [
      'Subspecialty fellowships (sports, spine, joint) add 1 year and $100K+ to salary',
      'Highest % of specialties that fully pay off within 3 attending years',
      'Refinance math is particularly attractive due to high attending income',
    ],
  },
  'cardiology': {
    id: 'cardiology',
    h1: 'Cardiology Student Loan Repayment',
    eyebrow: 'Specialty · Cardiology',
    metaDescription:
      'Cardiology pays ~$500K after 6\u20138 years training (IM residency + cards fellowship). Long training often favors PSLF at academic programs.',
    intro:
      'Cardiology is a long pathway: 3-year internal medicine residency + 3-year general cardiology fellowship (plus optional 1\u20132 additional years for EP/interventional). At $500K attending income, the math hinges heavily on whether training and practice are academic.',
    typicalDebt: { low: 210000, median: 240000, high: 310000 },
    salaryBand: { low: 430000, median: 500000, high: 700000 },
    strategyPick: {
      label: 'PSLF if academic; aggressive payoff if private',
      reason:
        'A 6-year academic training phase = 72 PSLF-qualifying months before attending. Combined with 4 more years of PSLF-qualifying attending, cardiology PSLF can forgive $200K+.',
    },
    pslfFit: 'mixed',
    pslfNote:
      'Academic cardiology is strongly PSLF-eligible. Private cardiology groups (often hospital-contracted) are a mixed bag.',
    bullets: [
      'Interventional or EP fellowship adds 1\u20132 more years',
      'Long training phase = significant interest accrual unless federal IDR',
      'Capitalization only on refinance/attending phase matters a lot here',
    ],
  },
  'gastroenterology': {
    id: 'gastroenterology',
    h1: 'Gastroenterology Student Loan Repayment',
    eyebrow: 'Specialty · Gastroenterology',
    metaDescription:
      'Gastroenterology pays ~$550K after 6\u20137 years training. Mixed PSLF fit; private-practice dominated by procedure-heavy revenue.',
    intro:
      'Gastroenterology requires 3-year IM residency + 3-year GI fellowship. Attending salaries land around $550K, often higher with heavy endoscopy volume. Employment is a mix of academic and private-practice.',
    typicalDebt: { low: 210000, median: 240000, high: 310000 },
    salaryBand: { low: 480000, median: 550000, high: 750000 },
    strategyPick: {
      label: 'Academic: PSLF. Private GI: aggressive payoff.',
      reason:
        '6-year academic training = ~72 PSLF-qualifying months. Private-practice GI attendings can often pay off $240K in 2\u20134 years cash-only.',
    },
    pslfFit: 'mixed',
    pslfNote:
      'Academic GI strongly qualifies. Private GI groups are usually for-profit LLCs and do not.',
    bullets: [
      'Endoscopy volume drives huge attending income variance',
      'Advanced endoscopy / hepatology fellowship adds 1 year',
      'Long training + high procedure income = both strategies become viable',
    ],
  },
  'neurosurgery': {
    id: 'neurosurgery',
    h1: 'Neurosurgery Student Loan Repayment',
    eyebrow: 'Specialty · Neurosurgery',
    metaDescription:
      'Neurosurgery pays ~$700K after 7-year residency. Long training + high attending income = PSLF at academic centers is uniquely powerful.',
    intro:
      "Neurosurgery's 7-year residency is the longest in medicine. Attending salaries reach $700K or more. Academic neurosurgery is a uniquely powerful PSLF fit — 7 qualifying years before attending means PSLF forgiveness often lands just 3 years into attending income.",
    typicalDebt: { low: 210000, median: 240000, high: 310000 },
    salaryBand: { low: 600000, median: 700000, high: 950000 },
    strategyPick: {
      label: 'PSLF at academic; refinance in private',
      reason:
        "7-year academic residency = 84 qualifying months of low IDR payments, then 3 more years at attending = forgiveness. You'll have ~$200K+ forgiven while your peers barely start paying.",
    },
    pslfFit: 'mixed',
    pslfNote:
      'Academic neurosurgery is rare but fits PSLF perfectly. Private-practice neurosurgery income is extreme enough that aggressive payoff finishes in 2\u20133 years anyway.',
    bullets: [
      'Longest residency in medicine \u2014 PSLF math is uniquely favorable',
      'Private-practice income tops $900K \u2014 pay off in 2\u20133 years cash-only',
      'Fellowship (pediatric, spine, vascular, etc.) adds 1 year',
    ],
  },
};

export function getSpecialtyProfile(id: string): SpecialtyProfile | undefined {
  return SPECIALTY_PROFILES[id];
}

/** Convenience: list of specialty + profile pairs, ordered like SPECIALTIES. */
export function listSpecialtyProfiles(): Array<{
  specialty: Specialty;
  profile: SpecialtyProfile;
}> {
  const list: Array<{ specialty: Specialty; profile: SpecialtyProfile }> = [];
  for (const s of SPECIALTIES) {
    const p = SPECIALTY_PROFILES[s.id];
    if (p) list.push({ specialty: s, profile: p });
  }
  return list;
}

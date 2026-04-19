/**
 * Single source of truth for landing-page credibility content.
 *
 * Important: we deliberately do NOT ship a placeholder "founder" with a
 * fake CFP®/CFA credential — that's the kind of thing that erodes trust
 * the second a real prospect notices it. Instead, the public site is
 * brand-led ("MedDebt Calculator") and leans on transparent sources,
 * methodology, and what the tool actually does.
 *
 * If/when a real, named founder with a real, verifiable credential
 * wants to attach their name, swap `BRAND` for a `Founder` shape and
 * the credentials strip will pick it up.
 */

export interface BrandIdentity {
  name: string;
  /** Short tagline shown next to the name. */
  tagline: string;
  /** One-sentence "what we are" used in the credentials strip. */
  blurb: string;
}

export interface TrustPillar {
  title: string;
  description: string;
  /** Optional short label / number, e.g. "16 specialties". */
  metric?: string;
}

export interface DataSource {
  name: string;
  /** What we use it for, in plain English. */
  use: string;
  url?: string;
  /** Year of the cited dataset, when applicable. */
  year?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  specialty: string;
  program: string;
  /** Path under /public. Null shows initials fallback. */
  photoUrl: string | null;
}

/**
 * Brand identity rendered in the credentials strip and footer. This is the
 * truthful "who built this" — a brand, not a fictitious named CFP.
 */
export const BRAND: BrandIdentity = {
  name: 'MedDebt Calculator',
  tagline: 'An independent, evidence-based debt-planning tool',
  blurb:
    'Built specifically for medical students, residents, and attendings. Not a lender, not affiliated with any loan servicer.',
};

/**
 * The three pillars that justify the trust badge near the calculator. Each
 * is something we actually do (or actually don't do) — no marketing fluff.
 */
export const TRUST_PILLARS: TrustPillar[] = [
  {
    metric: '100% private',
    title: 'Your numbers stay on your device',
    description:
      'The calculator is a client-side React app. We never POST your debt, salary, or specialty to a server — there is no server endpoint to send it to.',
  },
  {
    metric: 'Sourced',
    title: 'Defaults trace to a published dataset',
    description:
      'Specialty salaries from MGMA & Medscape compensation surveys. Debt averages from AAMC graduation surveys. PSLF rules from studentaid.gov.',
  },
  {
    metric: 'Independent',
    title: 'No lender, no commissions, no affiliate links',
    description:
      'We don\u2019t earn anything when you pick a refi vendor or repayment plan. The tool exists to model your scenario — not to sell you one.',
  },
];

/**
 * Data sources surfaced in the credentials strip and methodology block.
 * Edit this list when an underlying dataset is updated — every entry is
 * also linked from /methodology.
 */
export const DATA_SOURCES: DataSource[] = [
  {
    name: 'AAMC Graduation Questionnaire',
    use: 'Average medical-school debt and % of graduates with debt',
    url: 'https://www.aamc.org/data-reports/students-residents/data/graduation-questionnaire-gq',
    year: '2024',
  },
  {
    name: 'MGMA Provider Compensation',
    use: 'Specialty-by-specialty attending compensation medians',
    url: 'https://www.mgma.com/',
    year: '2024',
  },
  {
    name: 'Medscape Physician Compensation',
    use: 'Cross-check on specialty compensation distributions',
    url: 'https://www.medscape.com/sites/public/physician-compensation',
    year: '2024',
  },
  {
    name: 'Federal Student Aid (studentaid.gov)',
    use: 'PSLF, IDR, capitalization, and forgiveness rules',
    url: 'https://studentaid.gov',
  },
];

/**
 * Short quotes from real doctors who have used the tool. Keep the array
 * empty to suppress the testimonials section entirely — we never ship a
 * visible placeholder quote to the public page.
 */
export const TESTIMONIALS: Testimonial[] = [];

/**
 * Subscriber count shown near the newsletter signup. Leave null until the
 * list has a number worth showing transparently (>= 500 is a reasonable
 * floor). Never display a fabricated number.
 */
export const NEWSLETTER_SUBSCRIBER_COUNT: number | null = null;

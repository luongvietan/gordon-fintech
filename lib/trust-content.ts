/**
 * Single source of truth for landing-page social proof & credential data.
 *
 * Every field marked with `// TODO:` below needs to be replaced with real
 * content before launch. Each consuming section gracefully hides itself
 * when its backing data is null/empty, so it is safe to leave values
 * blank during development.
 */

export interface Founder {
  name: string;
  credential: string;
  blurb: string;
  /** Path under /public — e.g. '/founder.jpg'. Null shows initials fallback. */
  photoUrl: string | null;
  linkedin: string | null;
}

export interface Testimonial {
  quote: string;
  name: string;
  specialty: string;
  program: string;
  /** Path under /public. Null shows initials fallback. */
  photoUrl: string | null;
}

export interface ReviewedByOrg {
  name: string;
  /** Path under /public. Required — skip entry if no logo. */
  logoUrl: string;
  url?: string;
}

/**
 * Primary tool author. Rendered in the credentials strip just below the
 * stat cards. Replace the placeholder values before launch.
 */
export const FOUNDER: Founder = {
  // TODO: replace with real founder name
  name: '[Founder Name]',
  // TODO: confirm credential (CFP®, CFA, MD-CFP, etc.)
  credential: 'CFP®',
  // TODO: rewrite with real track record
  blurb: "worked with 500+ physicians on student-loan strategy",
  // TODO: drop headshot at /public/founder.jpg and set to '/founder.jpg'
  photoUrl: null,
  // TODO: set real LinkedIn URL or null to hide icon
  linkedin: null,
};

/**
 * Short quotes from real doctors who have used the tool. Keep the array
 * empty to suppress the testimonials section entirely — we never ship a
 * visible placeholder quote to the public page.
 */
export const TESTIMONIALS: Testimonial[] = [
  // TODO: collect 3 real quotes before launch. Example entry:
  // {
  //   quote: "Finally a calculator that doesn't pretend I'm a banker. The
  //           net-worth crossover chart changed how I think about PSLF.",
  //   name: 'Dr. Jane Smith',
  //   specialty: 'Internal Medicine',
  //   program: 'Johns Hopkins IM Residency',
  //   photoUrl: null,
  // },
];

/**
 * Subscriber count shown near the newsletter signup. Leave null until the
 * list has a number worth bragging about (>= 500 is a reasonable floor).
 */
export const NEWSLETTER_SUBSCRIBER_COUNT: number | null = null; // TODO

/**
 * Optional "reviewed by" / "as seen in" logos rendered to the right of
 * the credentials strip. Empty array hides the column.
 */
export const REVIEWED_BY: ReviewedByOrg[] = [
  // TODO: add partner / publication logos, e.g.
  // { name: 'White Coat Investor', logoUrl: '/reviewers/wci.svg', url: 'https://...' },
];

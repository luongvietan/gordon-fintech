import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/lib/og';

export const alt =
  'Med School Debt Calculator — built for medical students, residents, and doctors';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgCard({
    eyebrow: 'For doctors',
    title: 'The med school debt calculator doctors actually use.',
    subtitle:
      'PSLF vs refinance vs aggressive payoff, side-by-side. 16 specialty presets. Net-worth crossover.',
    meta: ['100% in your browser', 'No login required'],
  });
}

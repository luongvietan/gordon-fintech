import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/lib/og';

export const alt = 'Doctor Finance Blog — Medical School Debt & Loan Repayment Guides';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgCard({
    eyebrow: 'Guides',
    title: 'Med school debt, repayment, and PSLF — explained.',
    subtitle:
      'Research-backed guides for medical students, residents, and attendings. Every article links back to the free calculator.',
    meta: ['New articles monthly', 'Free · No login'],
  });
}

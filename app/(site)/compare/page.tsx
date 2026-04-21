import type { Metadata } from 'next';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
  title: 'Compare saved scenarios | MedDebt Calculator',
  description:
    'Side-by-side comparison of every scenario you saved to this browser. No signup, no cloud sync — everything is kept locally on your device.',
  // The compare view is a personal session tool, not a public landing
  // page. Keep it out of the index to avoid competing with the calculator
  // for "med school debt calculator" search intent.
  robots: { index: false, follow: true },
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return <CompareClient />;
}

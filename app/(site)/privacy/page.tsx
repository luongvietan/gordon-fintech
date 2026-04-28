import type { Metadata } from 'next';
import LegalPageShell from '@/components/layout/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How the Med School Debt Calculator handles your data. Everything you type into the calculator stays in your browser.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Your data stays with you."
      description="Short version: the calculator runs entirely in your browser. We don't store, sell, or share the numbers you type in. Long version below."
      lastUpdated="April 2026"
    >
      <h2>The calculator itself</h2>
      <p>
        Every input you enter — debt amount, salary, interest rate, tax rate,
        living expenses — is processed client-side in your browser. Nothing is
        sent to our servers. Nothing is stored in a database. Nothing is
        associated with a user account, because there are no user accounts.
      </p>
      <p>
        Refresh the page and everything is gone. That is by design.
      </p>

      <h2>What we do collect</h2>
      <p>
        We collect the minimum needed to run a public website:
      </p>
      <ul>
        <li>
          <strong>Basic analytics</strong> — page views, referrer, device type.
          Used to understand which guides and calculator features people use.
          We do not fingerprint individual visitors.
        </li>
        <li>
          <strong>Newsletter email</strong> — only if you voluntarily subscribe.
          Handled by our email provider and used exclusively to send the
          monthly digest. One-click unsubscribe in every email.
        </li>
        <li>
          <strong>Advertising</strong> — we serve ads via Google AdSense, which
          may use cookies to personalize ads per{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s partner-site policy
          </a>
          . You can opt out at{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          .
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We do not sell or rent your email or any personal data.</li>
        <li>We do not build a profile tied to your identity.</li>
        <li>
          We do not log calculator inputs (debt, income, etc.) — not even
          anonymously.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Essential cookies for the site to function, plus analytics and ad
        cookies as described above. No marketing-retargeting pixels beyond
        AdSense.
      </p>

      <h2>Your rights</h2>
      <p>
        If you subscribe to the newsletter, you can request deletion of your
        email at any time by emailing{' '}
        <a href="mailto:hello@medschooldebtcalculator.com">
          hello@medschooldebtcalculator.com
        </a>
        . Calculator inputs cannot be deleted because we never had them.
      </p>

      <h2>Changes</h2>
      <p>
        If we ever change how data is handled, we&apos;ll update this page and
        bump the &ldquo;Last updated&rdquo; date. Material changes affecting
        newsletter subscribers will also be announced by email.
      </p>
    </LegalPageShell>
  );
}

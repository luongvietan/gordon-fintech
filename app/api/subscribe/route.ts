import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Doctor Finance Digest <hello@medschooldebtcalculator.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medschooldebtcalculator.com';

/**
 * Newsletter subscribe using Resend Audiences.
 *
 * Accepts:
 *   - `email`     (required) — valid email
 *   - `firstName` (optional) — used by the inline calculator capture
 *   - `tag`       (optional) — 'calculator-user' vs generic signup.
 *                  Encoded in lastName as "tag:<value>" since Resend Contacts
 *                  has no native tags field. Use audience filters on lastName
 *                  to segment sends.
 */

interface SubscribeBody {
  email?: string;
  firstName?: string;
  tag?: string;
}

function welcomeHtml(firstName: string | undefined, email: string): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Doctor Finance Digest</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0d1a0f;padding:32px 40px 28px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#a3e635;">Doctor Finance Digest</p>
            <h1 style="margin:12px 0 0;font-size:28px;font-weight:900;line-height:1.1;color:#ffffff;letter-spacing:-0.02em;">
              You&rsquo;re on the list.
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1a1a1a;">${greeting}</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1a1a1a;">
              Welcome to <strong>Doctor Finance Digest</strong> — the one newsletter written for physicians
              with six-figure debt and complicated tax situations, not the general public.
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#1a1a1a;">
              Here&rsquo;s what to expect each month:
            </p>

            <!-- Promise list -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
              ${[
                'PSLF, IDR, and refi breakdowns that actually apply to your situation',
                'Tax-bomb math — what you owe, when, and how to prepare',
                'Refinancing windows you should (and shouldn\'t) take',
                'Real numbers, no fluff',
              ].map(item => `
              <tr>
                <td width="24" valign="top" style="padding:0 10px 12px 0;font-size:15px;color:#22c55e;font-weight:700;">✓</td>
                <td style="padding:0 0 12px;font-size:14px;line-height:1.5;color:#333333;">${item}</td>
              </tr>`).join('')}
            </table>

            <a href="${SITE_URL}"
               style="display:inline-block;padding:13px 28px;background:#0d1a0f;color:#a3e635;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;letter-spacing:-0.01em;">
              Go to the calculator →
            </a>
          </td>
        </tr>

        <!-- Footer — CAN-SPAM compliant -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0f0ec;">
            <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#aaaaaa;">
              You&rsquo;re receiving this because you subscribed at medschooldebtcalculator.com.
              We&rsquo;ll never sell or share your address.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#aaaaaa;">
              <a href="${unsubscribeUrl}" style="color:#aaaaaa;text-decoration:underline;">Unsubscribe</a>
              &nbsp;&middot;&nbsp;
              Med School Debt Calculator &middot; United States
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function welcomeText(firstName?: string): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  return `${greeting}

Welcome to Doctor Finance Digest — the one newsletter written for physicians with six-figure debt and complicated tax situations.

Each month you'll get:
- PSLF, IDR, and refi breakdowns that actually apply to your situation
- Tax-bomb math — what you owe, when, and how to prepare
- Refinancing windows you should (and shouldn't) take
- Real numbers, no fluff

Visit the calculator: ${SITE_URL}

---
You're receiving this because you subscribed at medschooldebtcalculator.com.
We'll never sell or share your address. Reply "unsubscribe" to opt out at any time.
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubscribeBody;
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const firstName = typeof body.firstName === 'string'
      ? body.firstName.trim().slice(0, 80)
      : undefined;
    const tag = typeof body.tag === 'string' ? body.tag.trim().slice(0, 60) : undefined;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email' },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
      console.log('Subscribe (Resend keys not configured):', { email, firstName, tag });
      return NextResponse.json({ ok: true });
    }

    const { error: contactError } = await resend.contacts.create({
      email,
      firstName,
      // Encode tag in lastName so Resend audience filters can segment sends.
      lastName: tag ? `tag:${tag}` : undefined,
      audienceId: process.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });

    if (contactError) {
      console.error('Resend subscribe error:', contactError);
      return NextResponse.json(
        { ok: false, error: 'Failed to subscribe' },
        { status: 500 },
      );
    }

    // Send welcome email to subscriber — non-fatal.
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "You're in — Doctor Finance Digest",
      html: welcomeHtml(firstName, email),
      text: welcomeText(firstName),
    });

    if (emailError) {
      console.error('Welcome email failed (contact still saved):', emailError);
    }

    // Notify site owner — non-fatal.
    const NOTIFY = process.env.CONTACT_EMAIL ?? 'hello@medschooldebtcalculator.com';
    await resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `New subscriber: ${email}`,
      text: [
        `New newsletter subscriber`,
        `Email: ${email}`,
        firstName ? `Name: ${firstName}` : null,
        tag ? `Source: ${tag}` : `Source: homepage`,
      ].filter(Boolean).join('\n'),
    }).catch((err: unknown) => console.error('Owner notification failed:', err));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { ok: false, error: 'Bad request' },
      { status: 400 },
    );
  }
}

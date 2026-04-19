import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter subscribe stub.
 *
 * Accepts:
 *   - `email`     (required) — valid email
 *   - `firstName` (optional) — used by the inline calculator capture
 *   - `tag`       (optional) — e.g. 'calculator-user' so a future provider
 *                              hookup can segment cleanly.
 *
 * Swap the body of this handler to post to Mailchimp / ConvertKit / Resend, e.g.:
 *
 *   await fetch('https://api.convertkit.com/v3/forms/<FORM_ID>/subscribe', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       api_key: process.env.CONVERTKIT_API_KEY,
 *       email,
 *       first_name: firstName,
 *       tags: tag ? [tag] : undefined,
 *     }),
 *   });
 */

interface SubscribeBody {
  email?: string;
  firstName?: string;
  tag?: string;
}

const ALLOWED_TAGS = new Set(['calculator-user', 'newsletter', 'guides']);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubscribeBody;
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const firstName = typeof body.firstName === 'string'
      ? body.firstName.trim().slice(0, 80)
      : undefined;
    const tag = typeof body.tag === 'string' && ALLOWED_TAGS.has(body.tag)
      ? body.tag
      : undefined;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email' },
        { status: 400 },
      );
    }

    // TODO: forward { email, firstName, tag } to your email provider here.
    // Intentionally no-op so the build doesn't depend on a provider key yet.
    void firstName;
    void tag;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Bad request' },
      { status: 400 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter subscribe stub.
 *
 * Swap the body of this handler to post to Mailchimp / ConvertKit / Resend, e.g.:
 *
 *   await fetch('https://api.convertkit.com/v3/forms/<FORM_ID>/subscribe', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ api_key: process.env.CONVERTKIT_API_KEY, email }),
 *   });
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email' },
        { status: 400 },
      );
    }

    // TODO: forward to your email provider here.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Bad request' },
      { status: 400 },
    );
  }
}

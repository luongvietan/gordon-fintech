import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY!);

function page(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 16px; padding: 48px 40px; max-width: 440px; width: 100%; box-shadow: 0 1px 4px rgba(0,0,0,0.08); text-align: center; }
    h1 { margin: 0 0 12px; font-size: 22px; font-weight: 900; color: #0d1a0f; letter-spacing: -0.02em; }
    p { margin: 0; font-size: 15px; line-height: 1.6; color: #555; }
    a { color: #16a34a; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return page(
      'Invalid link',
      '<h1>Invalid link</h1><p>This unsubscribe link is missing or malformed. <a href="https://medschooldebtcalculator.com">Go home</a></p>',
    );
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
    return page(
      'Unsubscribed',
      '<h1>You&rsquo;re unsubscribed.</h1><p>You won&rsquo;t hear from us again.</p>',
    );
  }

  try {
    const resend = getResend();

    // Find the contact by email then mark as unsubscribed.
    const { data: contacts } = await resend.contacts.list({
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    const contact = contacts?.data?.find(
      (c: { email: string }) => c.email.toLowerCase() === email,
    );

    if (contact) {
      await resend.contacts.update({
        audienceId: process.env.RESEND_AUDIENCE_ID,
        id: contact.id,
        unsubscribed: true,
      });
    }

    return page(
      'Unsubscribed',
      '<h1>You&rsquo;re unsubscribed.</h1><p>You&rsquo;ve been removed from Doctor Finance Digest. You won&rsquo;t receive any further emails.<br/><br/><a href="https://medschooldebtcalculator.com">Back to the calculator</a></p>',
    );
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return page(
      'Error',
      '<h1>Something went wrong.</h1><p>Please reply to any of our emails with &ldquo;unsubscribe&rdquo; and we&rsquo;ll remove you manually.</p>',
    );
  }
}

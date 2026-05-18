import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy — avoids Resend constructor throwing at build time when env var is absent.
const getResend = () => new Resend(process.env.RESEND_API_KEY!);
const FROM = 'Med School Debt Calculator <hello@medschooldebtcalculator.com>';

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
}

function autoReplyHtml(name: string, message: string): string {
  const escaped = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0d1a0f;padding:32px 40px 28px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#a3e635;">Med School Debt Calculator</p>
            <h1 style="margin:12px 0 0;font-size:26px;font-weight:900;line-height:1.1;color:#ffffff;letter-spacing:-0.02em;">
              Got your message, ${name}.
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1a1a1a;">
              Thanks for reaching out. We&rsquo;ll get back to you within <strong>48 hours</strong>.
            </p>
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#888888;">Your message</p>
            <div style="background:#f5f5f0;border-radius:10px;padding:16px 20px;margin-bottom:32px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#333333;white-space:pre-wrap;">${escaped}</p>
            </div>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#555555;">
              In the meantime, you can use the calculator at
              <a href="https://medschooldebtcalculator.com" style="color:#16a34a;text-decoration:none;font-weight:600;">medschooldebtcalculator.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0f0ec;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#aaaaaa;">
              This is an automated confirmation. Please do not reply to this email —
              we&rsquo;ll reach out from a monitored address.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactBody;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email address' },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
      console.log('Contact form submitted (Resend keys not configured):', { name, email, message });
      return NextResponse.json({ ok: true });
    }

    const resend = getResend();

    // Send notification to site owner.
    const { error } = await resend.emails.send({
      from: FROM,
      to: [process.env.CONTACT_EMAIL],
      subject: `New contact: ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error('Resend contact email error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to send message. Please try again later.' },
        { status: 500 },
      );
    }

    // Auto-reply to user — non-fatal if it fails.
    const { error: replyError } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "We received your message",
      html: autoReplyHtml(name, message),
      text: `Hi ${name},\n\nThanks for reaching out. We'll get back to you within 48 hours.\n\nYour message:\n${message}\n\n---\nThis is an automated confirmation. Please do not reply to this email.`,
    });

    if (replyError) {
      console.error('Auto-reply failed (notification still sent):', replyError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}

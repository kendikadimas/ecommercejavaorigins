import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { store } from '@/lib/store';
import { sendMail } from '@/lib/mailer';
import { renderEmail } from '@/lib/email-template';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'forgot', LIMITS.FORGOT)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await store.getUserByEmail(email);
    // Always respond success even if email doesn't exist (prevent user enumeration)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await store.createPasswordReset(email, tokenHash, expiresAt);

    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const isProd = process.env.NODE_ENV === 'production';
    // prod must have an explicit site URL — never trust the Host header for reset links
    const baseUrl = configuredUrl || (isProd ? '' : `http://${req.headers.get('host')}`);
    if (!baseUrl) {
      return NextResponse.json({ error: 'SITE_URL is not configured.' }, { status: 500 });
    }
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendMail({
      to: email,
      subject: 'Reset Password - Java Origins',
      html: renderEmail({
        heading: 'Reset Your Password',
        eyebrow: 'Account security',
        tone: 'warning',
        paragraphs: [
          `Hi ${user.name}, we received a request to reset the password for your Java Origins account.`,
          'Click the button below to choose a new password. This link is valid for 1 hour.',
        ],
        action: { label: 'Reset Password', url: resetUrl },
        note: {
          title: 'Did not request this?',
          body: 'You can safely ignore this email — your current password will stay unchanged.',
        },
        footnote: `If the button does not work, copy this link: ${resetUrl}`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[forgot] error:', error);
    return NextResponse.json({ error: 'Failed to process the reset request.' }, { status: 500 });
  }
}

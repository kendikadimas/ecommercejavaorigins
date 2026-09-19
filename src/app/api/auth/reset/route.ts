import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { store } from '@/lib/store';
import { sendMail } from '@/lib/mailer';
import { renderEmail } from '@/lib/email-template';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'reset', LIMITS.PASSWORD)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const token = String(body.token || '');
    const password = String(body.password || '');

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await store.getPasswordReset(tokenHash);
    if (!reset || reset.used) {
      return NextResponse.json({ error: 'Reset link is invalid or already used.' }, { status: 400 });
    }
    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Reset link has expired.' }, { status: 400 });
    }

    const user = await store.getUserByEmail(reset.email);
    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await store.updateUserPassword(user.id, hashedPassword);
    await store.markPasswordResetUsed(tokenHash);

    await sendMail({
      to: user.email,
      subject: 'Password Changed - Java Origins',
      html: renderEmail({
        heading: 'Your Password Was Changed',
        eyebrow: 'Account security',
        tone: 'success',
        paragraphs: [
          `Hi ${user.name}, the password for your Java Origins account has been changed successfully.`,
          'You can now log in with your new password.',
        ],
        note: {
          title: 'Was this not you?',
          body: 'Contact our admin immediately via WhatsApp so we can secure your account.',
        },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reset] error:', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}

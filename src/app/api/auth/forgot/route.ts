import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { store } from '@/lib/store';
import { sendMail } from '@/lib/mailer';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'forgot', LIMITS.FORGOT)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
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
      return NextResponse.json({ error: 'SITE_URL belum dikonfigurasi.' }, { status: 500 });
    }
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const escName = user.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    await sendMail({
      to: email,
      subject: 'Reset Password - Java Origins',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Reset Password Anda</h2>
        <p>Halo ${escName},</p>
        <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk mengatur password baru. Link berlaku 1 jam.</p>
        <p style="margin:24px 0"><a href="${resetUrl}" style="background:#276F27;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a></p>
        <p style="font-size:12px;color:#888">Jika tombol tidak berfungsi, salin tautan ini:<br/>${resetUrl}</p>
        <p style="font-size:12px;color:#888">Jika Anda tidak meminta ini, abaikan email ini.</p>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[forgot] error:', error);
    return NextResponse.json({ error: 'Gagal memproses permintaan reset.' }, { status: 500 });
  }
}

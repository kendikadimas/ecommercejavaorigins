import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { store } from '@/lib/store';
import { sendMail } from '@/lib/mailer';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'reset', LIMITS.PASSWORD)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const token = String(body.token || '');
    const password = String(body.password || '');

    if (!token || !password) {
      return NextResponse.json({ error: 'Token dan password wajib diisi.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await store.getPasswordReset(tokenHash);
    if (!reset || reset.used) {
      return NextResponse.json({ error: 'Link reset tidak valid atau sudah digunakan.' }, { status: 400 });
    }
    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Link reset sudah kedaluwarsa.' }, { status: 400 });
    }

    const user = await store.getUserByEmail(reset.email);
    if (!user) {
      return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await store.updateUserPassword(user.id, hashedPassword);
    await store.markPasswordResetUsed(tokenHash);

    await sendMail({
      to: user.email,
      subject: 'Password Berhasil Diubah - Java Origins',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Password Diubah</h2>
        <p>Halo ${user.name},</p>
        <p>Password akun Java Origins Anda telah berhasil diubah. Jika ini bukan Anda, segera hubungi admin.</p>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reset] error:', error);
    return NextResponse.json({ error: 'Gagal mereset password.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store } from '@/lib/store';
import { getUserSession } from '@/lib/auth';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'change-password', LIMITS.PASSWORD)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const user = getUserSession(req);
    if (!user) {
      return NextResponse.json({ error: 'Login is required.' }, { status: 401 });
    }
    const body = await req.json();
    const current = String(body.current || '');
    const newPassword = String(body.newPassword || '');

    if (!current || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const dbUser = await store.getUserById(user.id);
    if (!dbUser || !dbUser.password) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 400 });
    }

    const isHashed = dbUser.password.startsWith('$2');
    const match = isHashed
      ? await bcrypt.compare(current, dbUser.password)
      : dbUser.password === current;
    if (!match) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await store.updateUserPassword(user.id, hashed);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[change-password] error:', error);
    return NextResponse.json({ error: 'Failed to change password.' }, { status: 500 });
  }
}

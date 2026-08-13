import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store } from '@/lib/store';
import { COOKIE_CONFIG, signPayload } from '@/lib/auth';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'login', LIMITS.LOGIN)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await store.getUserByEmail(cleanEmail);
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }

    const isHashed = user.password.startsWith('$2');
    const passMatch = isHashed
      ? await bcrypt.compare(cleanPassword, user.password)
      : user.password === cleanPassword; // ponytail: plaintext fallback, rehash on success
    if (!passMatch) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }

    if (!isHashed) {
      await store.updateUser(user.id, { password: await bcrypt.hash(cleanPassword, 12) });
    }

    const { password: _, ...safeUser } = user;
    const session = { id: safeUser.id, email: safeUser.email, name: safeUser.name };

    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set('java_user_session', signPayload(session), {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[login] error:', error);
    return NextResponse.json({ error: 'Failed to log in.' }, { status: 500 });
  }
}

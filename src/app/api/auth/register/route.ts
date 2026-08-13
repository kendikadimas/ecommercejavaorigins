import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store } from '@/lib/store';
import { COOKIE_CONFIG, signPayload } from '@/lib/auth';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'register', LIMITS.REGISTER)) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, phone, address, city, postalCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = await store.getUserByEmail(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'Email is already registered. Please log in.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await store.createUser({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      city: city || '',
      postalCode: postalCode || '',
    });

    const { password: _, ...safeUser } = newUser;
    const session = { id: safeUser.id, email: safeUser.email, name: safeUser.name };

    const response = NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    response.cookies.set('java_user_session', signPayload(session), {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create a new account.' }, { status: 500 });
  }
}

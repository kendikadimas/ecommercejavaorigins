import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan Password wajib diisi.' }, { status: 400 });
    }

    const user = await store.getUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Email atau Password salah.' }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set('java_user_session', JSON.stringify(safeUser), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan login.' }, { status: 500 });
  }
}

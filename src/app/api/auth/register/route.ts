import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, address, city, postalCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, Email, dan Password wajib diisi.' }, { status: 400 });
    }

    const existing = await store.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 400 });
    }

    const newUser = await store.createUser({
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      city: city || '',
      postalCode: postalCode || '',
    });

    const { password: _, ...safeUser } = newUser;

    const response = NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    response.cookies.set('java_user_session', JSON.stringify(safeUser), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mendaftarkan akun baru.' }, { status: 500 });
  }
}

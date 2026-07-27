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

    const cleanInput = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Check if logging in with Admin credentials from main login page
    if (
      (cleanInput === 'admin' || cleanInput === 'admin@javaorigins.com' || cleanInput.startsWith('admin')) &&
      cleanPassword === 'admin123'
    ) {
      const adminUser = {
        id: 'usr-admin',
        name: 'Admin Java Origins',
        email: 'admin@javaorigins.com',
        phone: '081234567890',
        address: 'Java Origins HQ',
        city: 'Bandung',
        postalCode: '40111',
      };

      const response = NextResponse.json({ success: true, user: adminUser, redirect: '/admin/products' });
      response.cookies.set('java_user_session', JSON.stringify(adminUser), {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set('java_admin_auth', 'authenticated', {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    // Normal customer login
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

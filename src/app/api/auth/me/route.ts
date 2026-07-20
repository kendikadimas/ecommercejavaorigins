import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('java_user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    const cookieUser = JSON.parse(sessionCookie);
    const user = await store.getUserById(cookieUser.id);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ authenticated: true, user: safeUser });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('java_user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }
    const cookieUser = JSON.parse(sessionCookie);

    const body = await req.json();
    const { name, phone, address, city, postalCode } = body;

    const updated = await store.updateUser(cookieUser.id, {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(postalCode !== undefined && { postalCode }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 400 });
    }

    const { password: _, ...safeUser } = updated;
    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set('java_user_session', JSON.stringify(safeUser), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengedit profil.' }, { status: 500 });
  }
}

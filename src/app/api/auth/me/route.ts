import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getUserSession, COOKIE_CONFIG, signPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getUserSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    const user = await store.getUserById(session.id);
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
    const session = getUserSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const body = await req.json();
    // whitelist only safe fields — prevent mass assignment (M-01)
    const { name, phone, address, city, postalCode } = body;

    const updated = await store.updateUser(session.id, {
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
    const payload = { id: safeUser.id, email: safeUser.email, name: safeUser.name };
    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set('java_user_session', signPayload(payload), {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengedit profil.' }, { status: 500 });
  }
}

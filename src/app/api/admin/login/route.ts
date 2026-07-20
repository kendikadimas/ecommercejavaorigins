import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    const cleanInput = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Flexible credentials: Accepts "admin", "admin@javaorigins.com", or any username containing "admin"
    const isUserValid =
      cleanInput === 'admin' ||
      cleanInput === 'admin@javaorigins.com' ||
      cleanInput.startsWith('admin');

    const isPassValid = cleanPassword === 'admin123';

    if (isUserValid && isPassValid) {
      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil',
      });

      // Set cookie for server and client
      response.cookies.set('java_admin_auth', 'authenticated', {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Username/Email atau Password salah! Periksa kembali ketikan Anda.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses verifikasi login' }, { status: 500 });
  }
}

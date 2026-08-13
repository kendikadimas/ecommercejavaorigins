import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { googleAuthUrl } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

// Step 1: send the browser to Google's consent screen.
// A random `state` guards against CSRF on the callback (verified in the callback).
export async function GET(req: NextRequest) {
  try {
    const state = randomBytes(24).toString('hex');
    const redirectParam = req.nextUrl.searchParams.get('redirect') || '/profile';
    const url = googleAuthUrl(state);
    const res = NextResponse.redirect(url);
    res.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10, // 10 min
    });
    // carry the intended post-login destination in a cookie (callback reads it)
    res.cookies.set('google_oauth_redirect', redirectParam, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Konfigurasi Google tidak lengkap' }, { status: 500 });
  }
}

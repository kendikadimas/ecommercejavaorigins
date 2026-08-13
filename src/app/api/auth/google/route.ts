import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { googleAuthUrl } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

// Step 1: send the browser to Google's consent screen.
// The `state` carries the intended post-login destination (encoded) so the callback
// doesn't depend on cookies surviving the cross-domain round-trip.
export async function GET(req: NextRequest) {
  try {
    const random = randomBytes(18).toString('hex');
    const redirectParam = req.nextUrl.searchParams.get('redirect') || '/profile';
    const state = `${random}.${Buffer.from(redirectParam).toString('base64url')}`;
    const url = googleAuthUrl(state);
    const res = NextResponse.redirect(url);
    // keep a cookie copy too (belt & suspenders; not strictly needed anymore)
    res.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10, // 10 min
    });
    res.cookies.set('google_oauth_redirect', redirectParam, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Google configuration is incomplete' }, { status: 500 });
  }
}

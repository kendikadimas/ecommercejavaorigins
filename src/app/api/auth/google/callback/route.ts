import { NextRequest, NextResponse } from 'next/server';
import { createOrLoginGoogleUser, exchangeGoogleCode } from '@/lib/google-auth';
import { COOKIE_CONFIG, signPayload } from '@/lib/auth';
import { safeRedirect } from '@/lib/redirect';

export const dynamic = 'force-dynamic';

// Step 2: Google redirects back here with ?code=...&state=...
// `state` is "<random>.<base64url(redirect)>" — the destination is recovered from it.
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = req.cookies.get('google_oauth_state')?.value;

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/login?error=google', siteBase(req)));
  }

  try {
    const info = await exchangeGoogleCode(code);
    const user = await createOrLoginGoogleUser(info);

    const session = { id: user.id, email: user.email, name: user.name };

    // recover redirect from state, falling back to the cookie, then default
    let redirect: string;
    try {
      const [random, encoded] = state.split('.');
      if (random && encoded) redirect = Buffer.from(encoded, 'base64url').toString('utf8');
      else redirect = '';
    } catch {
      redirect = '';
    }
    if (!redirect) redirect = req.cookies.get('google_oauth_redirect')?.value || '/profile';
    redirect = safeRedirect(redirect, '/profile');

    const res = NextResponse.redirect(new URL(redirect, siteBase(req)));
    res.cookies.set('java_user_session', signPayload(session), {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24 * 7,
    });
    // clear the one-time oauth cookies
    res.cookies.set('google_oauth_state', '', { ...COOKIE_CONFIG, maxAge: 0 });
    res.cookies.set('google_oauth_redirect', '', { ...COOKIE_CONFIG, maxAge: 0 });
    return res;
  } catch (err) {
    console.error('[google-callback] error:', err);
    return NextResponse.redirect(new URL('/login?error=google', siteBase(req)));
  }
}

// Use the configured runtime site URL as the redirect base (never the Host header),
// so OAuth callbacks never resolve to localhost in production.
// Note: this must be a NON-NEXT_PUBLIC_* var — Next.js inlines NEXT_PUBLIC_* at build time,
// so use SITE_URL (set in cPanel env) which is read at runtime.
function siteBase(req: NextRequest): string {
  return process.env.SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
}

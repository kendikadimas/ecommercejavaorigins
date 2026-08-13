import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

const IS_PROD = process.env.NODE_ENV === 'production';
const SECRET = () => {
  const s = process.env.SESSION_SECRET;
  if (
    !s ||
    s === 'dev-only-change-me' ||
    s === 'change-this-to-a-random-secret-in-production' ||
    s.length < 16
  ) {
    throw new Error('SESSION_SECRET wajib diset dengan nilai acak kuat (min 16 karakter)');
  }
  return s;
};

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, enforced server-side

/** Sign a JSON payload → base64url.body.sig, with embedded expiry */
export function signPayload(payload: object): string {
  const withExp = { ...payload, exp: Date.now() + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(withExp)).toString('base64url');
  const sig = createHmac('sha256', SECRET()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Verify signed token, return payload or null (checks signature + expiry) */
export function verifyPayload<T extends object>(token: string): T | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', SECRET()).update(body).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString()) as T & { exp?: number };
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

/** Returns parsed admin cookie payload or null */
export function getAdminSession(req: NextRequest): { id: string } | null {
  const cookie = req.cookies.get('java_admin_auth')?.value;
  if (!cookie) return null;
  const parsed = verifyPayload<{ id: string }>(cookie);
  if (parsed?.id === 'admin') return parsed;
  return null;
}

/** Returns parsed user session or null */
export function getUserSession(req: NextRequest): { id: string; email: string; name: string } | null {
  const cookie = req.cookies.get('java_user_session')?.value;
  if (!cookie) return null;
  const parsed = verifyPayload<{ id: string; email: string; name: string }>(cookie);
  if (!parsed?.id || !parsed?.email) return null;
  return parsed;
}

export function unauthorized(message = 'Tidak terautentikasi') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Akses ditolak') {
  return Response.json({ error: message }, { status: 403 });
}

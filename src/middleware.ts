import { NextRequest, NextResponse } from 'next/server';

// Admin page gate only — API routes enforce their own auth
// /api/upload intentionally NOT here (guests upload payment proof)
const ADMIN_PAGE_PREFIX = '/admin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(ADMIN_PAGE_PREFIX)) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();

  // Soft presence check — real HMAC verify happens in /api/admin/check + route handlers
  // ponytail: middleware is Edge (no node:crypto); API routes are the security boundary
  const cookie = req.cookies.get('java_admin_auth')?.value;
  if (!cookie || !cookie.includes('.')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

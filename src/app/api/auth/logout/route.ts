import { NextResponse } from 'next/server';
import { COOKIE_CONFIG } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('java_user_session', '', {
    ...COOKIE_CONFIG,
    maxAge: 0,
  });
  return response;
}

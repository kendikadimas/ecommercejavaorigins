import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('java_user_session', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
  });
  return response;
}

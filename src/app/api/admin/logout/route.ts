import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('java_admin_auth', '', { path: '/', maxAge: 0 });
  return response;
}

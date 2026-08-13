import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { COOKIE_CONFIG, signPayload } from '@/lib/auth';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

// ponytail: read hash from file to avoid Apache $-expansion eating the bcrypt hash
function getAdminHash(): string {
  const hashFile = path.join(process.cwd(), 'admin_hash.txt');
  if (fs.existsSync(hashFile)) return fs.readFileSync(hashFile, 'utf8').trim();
  return process.env.ADMIN_PASSWORD_HASH || '';
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'admin-login', LIMITS.ADMIN_LOGIN)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    const cleanInput = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const adminHash = getAdminHash();

    if (!adminEmail || !adminHash) {
      return NextResponse.json({ error: 'Admin configuration not found' }, { status: 500 });
    }

    const emailMatch = cleanInput === adminEmail;
    const passMatch = emailMatch && (await bcrypt.compare(cleanPassword, adminHash));

    if (!emailMatch || !passMatch) {
      return NextResponse.json(
        { error: 'Incorrect username/email or password! Please check your input.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: 'Login berhasil' });
    response.cookies.set('java_admin_auth', signPayload({ id: 'admin' }), {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify login' }, { status: 500 });
  }
}

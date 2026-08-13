import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// ponytail: in-memory rate limit per IP — resets on process restart (fine for shared hosting)
const hits = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20; // uploads
const WINDOW_MS = 15 * 60 * 1000; // 15 min

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  row.count += 1;
  return row.count > LIMIT;
}

export async function POST(req: NextRequest) {
  // cPanel disk is persistent — keep local /public/uploads (no cloud needed)
  const ip = req.ip || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Terlalu banyak upload. Coba lagi nanti.' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Tipe file tidak diizinkan. Gunakan JPEG, PNG, WebP, atau GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // ignore client filename — only use safe random name + mime-derived ext
    const safeFilename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    await writeFile(path.join(uploadsDir, safeFilename), buffer);

    return NextResponse.json({ url: `/uploads/${safeFilename}` });
  } catch {
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}

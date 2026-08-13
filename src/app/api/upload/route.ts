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

// Magic-byte signatures (first bytes) → allowed mime. Used instead of trusting
// the client-declared Content-Type.
const MAGIC: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', test: (b) => b.length >= 8 && b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', test: (b) => b.length >= 12 && b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP' },
  { mime: 'image/gif', test: (b) => b.length >= 4 && (b.slice(0, 4).toString('ascii') === 'GIF8' ) },
];

function sniffMime(buffer: Buffer): string | null {
  for (const sig of MAGIC) {
    if (sig.test(buffer)) return sig.mime;
  }
  return null;
}

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
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size limit is 5 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify real file content via magic bytes — don't trust the client Content-Type
    const realMime = sniffMime(buffer);
    if (!realMime) {
      return NextResponse.json(
        { error: 'File type not allowed. Use JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }
    const ext = ALLOWED_MIME[realMime];

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // ignore client filename — only use safe random name + sniffed-mime-derived ext
    const safeFilename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    await writeFile(path.join(uploadsDir, safeFilename), buffer);

    return NextResponse.json({ url: `/uploads/${safeFilename}` });
  } catch {
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}

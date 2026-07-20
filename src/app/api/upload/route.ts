import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      // Fallback: Check if base64 payload is passed
      const body = await req.json().catch(() => null);
      if (body?.image) {
        return NextResponse.json({ url: body.image });
      }
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFilename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFilename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}

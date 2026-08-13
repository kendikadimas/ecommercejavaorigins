import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const methods = await store.getPaymentMethods();
    return NextResponse.json(methods, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat metode pembayaran' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.name || !body.bankName || !body.accountNumber || !body.accountName) {
      return NextResponse.json(
        { error: 'Nama metode, bank, nomor rekening, dan atas nama wajib diisi' },
        { status: 400 }
      );
    }
    const created = await store.createPaymentMethod(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah metode pembayaran' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID metode pembayaran wajib disertakan' }, { status: 400 });
    }
    const updated = await store.updatePaymentMethod(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui metode pembayaran' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID metode pembayaran wajib disertakan' }, { status: 400 });
    }
    await store.deletePaymentMethod(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus metode pembayaran' }, { status: 500 });
  }
}

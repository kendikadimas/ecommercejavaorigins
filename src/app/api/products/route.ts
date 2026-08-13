import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const product = await store.getProductById(id);
      if (!product) {
        return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(product, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
    const products = await store.getProducts();
    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat daftar produk' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.name || !body.price || !body.image) {
      return NextResponse.json({ error: 'Nama, harga, dan foto produk wajib diisi' }, { status: 400 });
    }
    const created = await store.createProduct(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat produk baru' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID produk wajib disertakan' }, { status: 400 });
    }
    const updated = await store.updateProduct(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID produk wajib disertakan' }, { status: 400 });
    }
    await store.deleteProduct(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}

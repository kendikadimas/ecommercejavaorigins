import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const order = await store.getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(order, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
    const orders = await store.getOrders();
    return NextResponse.json(orders, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat daftar pesanan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.customerPhone || !body.address || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Nama, No. HP, alamat lengkap, dan item produk wajib diisi' },
        { status: 400 }
      );
    }
    const created = await store.createOrder(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat pesanan baru' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, paymentProofUrl } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'ID pesanan dan status wajib disertakan' }, { status: 400 });
    }
    const updated = await store.updateOrderStatus(id, status, paymentProofUrl);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}

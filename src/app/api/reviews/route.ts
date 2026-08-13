import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getUserSession } from '@/lib/auth';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function validRating(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId wajib disertakan' }, { status: 400 });
    }
    const reviews = await store.getReviewsByProduct(productId);
    const avg =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0;
    return NextResponse.json(
      { reviews, average: avg, count: reviews.length },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ error: 'Gagal memuat review' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'review', LIMITS.REVIEW)) {
      return NextResponse.json(
        { error: 'Terlalu banyak review. Coba lagi nanti.' },
        { status: 429 }
      );
    }
    const user = getUserSession(req);
    if (!user) {
      return NextResponse.json({ error: 'Login diperlukan untuk memberi review' }, { status: 401 });
    }
    const body = await req.json();
    if (!body.productId) {
      return NextResponse.json({ error: 'productId wajib disertakan' }, { status: 400 });
    }
    if (!validRating(body.rating)) {
      return NextResponse.json({ error: 'Rating harus angka 1-5' }, { status: 400 });
    }
    const product = await store.getProductById(body.productId);
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }
    const review = await store.upsertReview({
      productId: body.productId,
      userId: user.id,
      userName: user.name || 'Customer',
      rating: body.rating,
      comment: body.comment ? String(body.comment).slice(0, 1000) : undefined,
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan review' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getUserSession(req);
    if (!user) {
      return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID review wajib disertakan' }, { status: 400 });
    }
    const ok = await store.deleteReview(id, user.id);
    if (!ok) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus review' }, { status: 500 });
  }
}

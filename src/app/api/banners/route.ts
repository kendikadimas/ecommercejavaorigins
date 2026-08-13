import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await store.getBanners();
    return NextResponse.json(banners, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json({ error: 'Banner image is required' }, { status: 400 });
    }
    const created = await store.createBanner({
      title: body.title || '',
      subtitle: body.subtitle || '',
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl || '',
      active: body.active ?? true,
      sortOrder: body.sortOrder !== undefined && body.sortOrder !== null && body.sortOrder !== ''
        ? Number(body.sortOrder)
        : 1,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }
    const updated = await store.updateBanner(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }
    await store.deleteBanner(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}

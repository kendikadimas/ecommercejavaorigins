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
    return NextResponse.json({ error: 'Failed to load payment methods' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.name || !body.bankName || !body.accountNumber || !body.accountName) {
      return NextResponse.json(
        { error: 'Name, bank, account number, and account name are required' },
        { status: 400 }
      );
    }
    const created = await store.createPaymentMethod(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
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
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }
    const updated = await store.updatePaymentMethod(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
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
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }
    await store.deletePaymentMethod(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserSession(req);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const orders = await store.getOrdersByCustomerEmail(user.email);
    const emailLogs = await store.getEmailLogs(user.email);

    return NextResponse.json(
      { orders, emailLogs },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load order history.' }, { status: 500 });
  }
}

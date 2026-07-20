import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('java_user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const user = JSON.parse(sessionCookie);
    const orders = await store.getOrdersByCustomerEmail(user.email);
    const emailLogs = await store.getEmailLogs(user.email);

    return NextResponse.json(
      { orders, emailLogs },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat riwayat pesanan.' }, { status: 500 });
  }
}

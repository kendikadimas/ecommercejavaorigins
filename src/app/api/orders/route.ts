import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAdminSession, getUserSession } from '@/lib/auth';
import { SHIPPING_OPTIONS, shippingCost } from '@/lib/shipping';
import { isRateLimited, LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Admin-only status transitions
const ADMIN_STATUSES = ['PAID', 'SHIPPED', 'REJECTED'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const order = await store.getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      // Admin: all. Logged-in user: own only. Guest: only by internal UUID id (not guessable orderNumber)
      const admin = getAdminSession(req);
      const user = getUserSession(req);
      if (!admin) {
        if (user) {
          if (order.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }
        } else if (order.id !== id) {
          // looked up via orderNumber — too guessable for anonymous access
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
      return NextResponse.json(order, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    // List all orders — admin only
    if (!getAdminSession(req)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const orders = await store.getOrders();
    return NextResponse.json(orders, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'order', LIMITS.ORDER)) {
      return NextResponse.json(
        { error: 'Too many orders. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    if (!body.customerName || !body.customerPhone || !body.address || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Name, phone number, full address, and product items are required' },
        { status: 400 }
      );
    }

    // M-7: logged-in users must order under their own email — never another person's
    const sessionUser = getUserSession(req);
    const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
    if (sessionUser && sessionUser.email.toLowerCase() !== customerEmail) {
      return NextResponse.json(
        { error: 'Order email must match your account email' },
        { status: 400 }
      );
    }

    // Recalculate prices + stock server-side (M-02)
    const itemsWithServerPrice = await Promise.all(
      body.items.map(async (item: { productId: string; quantity: number }) => {
        const qty = Math.floor(Number(item.quantity));
        if (!item.productId || !Number.isFinite(qty) || qty < 1) {
          throw new Error('Invalid item quantity');
        }
        const product = await store.getProductById(item.productId);
        if (!product || !product.active) throw new Error(`Product not found`);
        if (product.stock < qty) throw new Error(`Stock ${product.name} insufficient`);
        return {
          productId: item.productId,
          productName: product.name,
          price: product.price,
          quantity: qty,
        };
      })
    );

    if (body.paymentMethodId) {
      const methods = await store.getPaymentMethods();
      const valid = methods.some(
        (m) => m.id === body.paymentMethodId && m.active
      );
      if (!valid) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
      }
    }

    if (body.shippingMethod !== undefined && !Object.hasOwn(SHIPPING_OPTIONS, body.shippingMethod)) {
      return NextResponse.json({ error: 'Invalid shipping method' }, { status: 400 });
    }
    if (!Object.hasOwn(SHIPPING_OPTIONS, body.shippingMethod ?? '')) {
      return NextResponse.json({ error: 'Shipping method is required' }, { status: 400 });
    }
    const shipCost = shippingCost(body.shippingMethod);
    const totalAmount =
      itemsWithServerPrice.reduce((sum, item) => sum + item.price * item.quantity, 0) + shipCost;

    const created = await store.createOrder({
      customerName: String(body.customerName).trim(),
      customerEmail: customerEmail,
      customerPhone: String(body.customerPhone).trim(),
      address: String(body.address).trim(),
      city: String(body.city || '').trim(),
      postalCode: String(body.postalCode || '').trim(),
      shippingMethod: String(body.shippingMethod),
      shippingCost: shipCost,
      paymentMethodId: body.paymentMethodId,
      checkoutType: body.checkoutType === 'WHATSAPP' ? 'WHATSAPP' : 'WEB',
      notes: body.notes ? String(body.notes).slice(0, 500) : undefined,
      items: itemsWithServerPrice,
      totalAmount,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    // Known business/validation errors from item checks — safe to show, else generic 500
    const msg = error?.message || '';
    const safeMsgs = ['Stock', 'Product', 'Quantity', 'insufficient', 'not found', 'invalid'];
    if (safeMsgs.some((s) => msg.includes(s))) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, paymentProofUrl } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Admin-only transitions
    if (ADMIN_STATUSES.includes(status)) {
      if (!getAdminSession(req)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      // Enforce a sane forward-only flow: never reject a shipped order, and don't
      // approve/ship before a payment proof was submitted.
      const order = await store.getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      const from = order.status;
      const validFrom: Record<string, string[]> = {
        PAID: ['WAITING_APPROVAL'],
        SHIPPED: ['PAID'],
        REJECTED: ['PENDING_PAYMENT', 'WAITING_APPROVAL', 'PAID'],
      };
      if (!validFrom[status]?.includes(from)) {
        return NextResponse.json(
          { error: `Transition ${from} -> ${status} is not allowed` },
          { status: 400 }
        );
      }
    } else if (status === 'WAITING_APPROVAL') {
      // Customer/guest: submit proof from PENDING_PAYMENT, re-upload while WAITING, or re-submit after REJECTED
      const order = await store.getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      if (order.status !== 'PENDING_PAYMENT' && order.status !== 'WAITING_APPROVAL' && order.status !== 'REJECTED') {
        return NextResponse.json({ error: 'Order status does not allow uploading proof' }, { status: 400 });
      }
      if (!paymentProofUrl) {
        return NextResponse.json({ error: 'Payment proof is required' }, { status: 400 });
      }
      const user = getUserSession(req);
      if (user && order.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      // Guest: possession of order id is the secret (id is random UUID)
    } else {
      return NextResponse.json({ error: 'Status transition not allowed' }, { status: 400 });
    }

    const updated = await store.updateOrderStatus(
      id,
      status,
      paymentProofUrl,
      status === 'WAITING_APPROVAL'
        ? ['PENDING_PAYMENT', 'WAITING_APPROVAL', 'REJECTED']
        : undefined
    );
    if (!updated && status === 'WAITING_APPROVAL') {
      return NextResponse.json({ error: 'Order status has changed, please reload' }, { status: 409 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('Stock') && msg.includes('insufficient')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

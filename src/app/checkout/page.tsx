'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, MessageSquare, ArrowRight, CheckCircle2, QrCode, Building2, UserCheck, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PaymentMethodType, INITIAL_PAYMENT_METHODS } from '@/lib/seed-data';
import { formatPrice } from '@/lib/format';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { SHIPPING_LABELS, shippingCost } from '@/lib/shipping';

const SHIPPING_OPTIONS = (Object.keys(SHIPPING_LABELS) as (keyof typeof SHIPPING_LABELS)[]).map((id) => ({
  id,
  label: SHIPPING_LABELS[id],
  cost: shippingCost(id),
}));

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useCustomerAuth();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>(INITIAL_PAYMENT_METHODS);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(INITIAL_PAYMENT_METHODS[0]?.id || '');
  const [checkoutFlow, setCheckoutFlow] = useState<'WEB' | 'WHATSAPP'>('WEB');
  const [shippingId, setShippingId] = useState<string>('');

  const shipCost = shippingCost(shippingId);
  const totalAmount = subtotal + shipCost;

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: 'Auckland',
    postalCode: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data when user is logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
        address: user.address || prev.address,
        city: user.city || prev.city || 'Auckland',
        postalCode: user.postalCode || prev.postalCode,
      }));
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetch('/api/payment-methods')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter((m) => m.active);
          setPaymentMethods(active);
          if (active.length > 0) setSelectedMethodId(active[0].id);
        }
      })
      .catch(() => {});
  }, []);

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen py-20 text-center font-sans">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#B4D397] space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold text-[#140E0A]">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-gray-500">Please add products to your cart before checking out.</p>
          <Link
            href="/shop"
            className="inline-block bg-[#140E0A] text-[#FACC15] font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const scrollToError = () => {
      setTimeout(() => {
        document.getElementById('checkout-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    };

    if (!user) {
      setError('You must register or log in to your account before placing an order.');
      scrollToError();
      return;
    }

    if (!form.customerName || !form.customerPhone || !form.address) {
      setError('Please complete Name, Phone/WhatsApp Number, and Full Address.');
      scrollToError();
      return;
    }

    if (!shippingId) {
      setError('Please select a shipping option before continuing.');
      scrollToError();
      return;
    }

    setLoading(true);

    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail || user.email,
      customerPhone: form.customerPhone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode || '1010',
      totalAmount: totalAmount,
      shippingMethod: shippingId,
      shippingCost: shipCost,
      paymentMethodId: checkoutFlow === 'WEB' ? selectedMethodId : undefined,
      checkoutType: checkoutFlow,
      notes: form.notes,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      clearCart();

      if (checkoutFlow === 'WHATSAPP') {
        const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6282130613460';
        const itemListText = cart
          .map((item) => `- ${item.product.name} (${item.quantity}x) = ${formatPrice(item.product.price * item.quantity)}`)
          .join('\n');

        const serverTotal = Number(orderData.totalAmount ?? totalAmount);
        const message = `*HELLO JAVA ORIGINS ADMIN!*\nI would like to place an order via WhatsApp.\n\n*Order ID:* ${orderData.orderNumber}\n*Customer Name:* ${form.customerName}\n*Email:* ${form.customerEmail}\n*Phone Number:* ${form.customerPhone}\n*Address:* ${form.address}, ${form.city} (${form.postalCode})\n\n*Product List:*\n${itemListText}\n\n*Shipping:* ${SHIPPING_OPTIONS.find((o) => o.id === shippingId)?.label} (${formatPrice(shipCost)})\n*Total Payment:* ${formatPrice(serverTotal)}\n*Notes:* ${form.notes || '-'}\n\nPlease help to process this order, thank you!`;

        const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`;
        // open WhatsApp in a new tab, then show the order page so the customer can
        // see their order + tracking without hunting for it
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        router.push(`/order/${orderData.id}`);
      } else {
        router.push(`/order/${orderData.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your order.');
      setTimeout(() => {
        document.getElementById('checkout-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 text-[#140E0A] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/cart" className="text-xs text-[#5A7543] hover:text-[#276F27] font-bold">
            ← Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#140E0A] mt-2">
            Checkout Java Origins
          </h1>
        </div>

        {/* Mandatory User Authentication Check Banner */}
        {!user && !authLoading && (
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-start space-x-3">
              <AlertCircle size={24} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-extrabold text-amber-900">
                  Must Login / Create Account Before Ordering
                </h3>
                <p className="text-xs text-amber-800 font-normal mt-1">
                  You must create an account or log in first to place an order, edit your profile, and monitor order status with email notifications.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login?redirect=/checkout"
                className="px-5 py-2.5 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow flex items-center space-x-1.5"
              >
                <LogIn size={16} />
                <span>Login to Your Account</span>
              </Link>
              <Link
                href="/register?redirect=/checkout"
                className="px-5 py-2.5 bg-white border border-[#C9D3BE] text-[#26421F] hover:bg-[#F2F7E9] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center space-x-1.5"
              >
                <UserPlus size={16} />
                <span>Register New Account</span>
              </Link>
            </div>
          </div>
        )}

        {/* Authenticated User Status Banner */}
        {user && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold">
              <UserCheck size={18} className="text-emerald-700" />
              <span>Authenticated as: {user.name} ({user.email})</span>
            </div>
            <Link href="/profile" className="text-[#276F27] font-bold hover:underline">
              Edit Profile / Address
            </Link>
          </div>
        )}

        {error && (
          <div id="checkout-error" className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Form & Payment Selector */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#B4D397] shadow-sm space-y-8">
            
            {/* Flow selector tab */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#5A7543] mb-3">
                Choose Checkout Flow
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutFlow('WEB')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    checkoutFlow === 'WEB'
                      ? 'border-[#140E0A] bg-[#140E0A] text-[#FACC15] shadow-md'
                      : 'border-[#CBE0B4] bg-[#FAFAF7] text-[#140E0A] hover:border-[#499A13]'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CreditCard size={18} />
                    <span>Transfer & Admin Approval</span>
                  </div>
                  <p className="text-[11px] mt-1 opacity-80 font-normal">
                    Bank/QRIS transfer & upload proof for Admin approval.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutFlow('WHATSAPP')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    checkoutFlow === 'WHATSAPP'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-[#CBE0B4] bg-[#FAFAF7] text-[#140E0A] hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <MessageSquare size={18} />
                    <span>Checkout WhatsApp</span>
                  </div>
                  <p className="text-[11px] mt-1 opacity-80 font-normal">
                    Send order summary message directly to Admin via WhatsApp.
                  </p>
                </button>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-[#140E0A] border-b border-[#EAF3DB] pb-2">
                  Contact & Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#22491F] mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      placeholder="Example: John Smith"
                      value={form.customerName}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#22491F] mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      placeholder="+64 21 234 5678"
                      value={form.customerPhone}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#22491F] mb-1">Email (Order Status Notification)</label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    placeholder="john@example.com"
                    value={form.customerEmail}
                    onChange={handleTextChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#22491F] mb-1">Full Shipping Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="123 Queen St, Auckland CBD"
                    value={form.address}
                    onChange={handleTextChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#22491F] mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#22491F] mb-1">Postcode</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="1010"
                      value={form.postalCode}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#22491F] mb-1">Additional Notes (Optional)</label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="E.g., Please use thick bubble wrap"
                    value={form.notes}
                    onChange={handleTextChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBE0B4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#499A13] font-normal"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              {checkoutFlow === 'WEB' && (
                <div className="space-y-4 pt-4 border-t border-[#EAF3DB]">
                  <h3 className="text-lg font-bold text-[#140E0A]">
                    Secure Checkout via Bank Transfer
                  </h3>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const isSelected = selectedMethodId === method.id;
                      return (
                        <label
                          key={method.id}
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#499A13] bg-[#F3F7ED] shadow-sm'
                              : 'border-[#CBE0B4] bg-[#FAFAF7] hover:border-[#499A13]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="paymentMethod"
                                checked={isSelected}
                                onChange={() => setSelectedMethodId(method.id)}
                                className="text-[#499A13] focus:ring-[#499A13]"
                              />
                              <div>
                                <p className="text-base font-extrabold text-[#140E0A]">
                                  {method.bankName}
                                </p>
                                <p className="text-xs text-[#5A7543] font-semibold mt-0.5">
                                  Account Name: <span className="font-bold text-[#140E0A]">{method.accountName}</span>
                                </p>
                                {method.accountNumber && (
                                  <p className="text-xs text-[#5A7543] font-semibold mt-0.5">
                                    Account Number: <span className="font-mono font-extrabold text-[#140E0A] select-all">{method.accountNumber}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {method.qrCodeUrl ? (
                              <QrCode size={24} className="text-[#EAB308]" />
                            ) : (
                              <Building2 size={24} className="text-[#5A7543]" />
                            )}
                          </div>

                          {method.instructions && (
                            <div className="mt-3 pt-3 border-t border-[#CBE0B4]/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-[#22491F] bg-white p-3 rounded-xl">
                              <div className="bg-white/90 px-2.5 py-1.5 rounded-lg border border-[#B4D397] text-[11px]">
                                <span className="font-bold text-[#8C3A2B] uppercase">PARTICULAR:</span> <span className="font-bold text-[#140E0A]">{form.customerName || 'Your Name'}</span>
                              </div>
                              <div className="bg-white/90 px-2.5 py-1.5 rounded-lg border border-[#B4D397] text-[11px]">
                                <span className="font-bold text-[#8C3A2B] uppercase">CODE:</span> <span className="font-bold text-[#140E0A]">{formatPrice(totalAmount)}</span>
                              </div>
                              <div className="bg-white/90 px-2.5 py-1.5 rounded-lg border border-[#B4D397] text-[11px]">
                                <span className="font-bold text-[#8C3A2B] uppercase">REF:</span> <span className="font-bold text-[#140E0A]">Auto Order ID</span>
                              </div>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4">
                {user ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2 ${
                      checkoutFlow === 'WHATSAPP'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#140E0A] hover:bg-[#EAB308] hover:text-[#140E0A] text-[#FACC15]'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Processing Order...</span>
                      </span>
                    ) : checkoutFlow === 'WHATSAPP' ? (
                      <>
                        <MessageSquare size={18} />
                        <span>Checkout via WhatsApp Now</span>
                      </>
                    ) : (
                      <>
                        <span>Create Order & Upload Proof of Payment</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/login?redirect=/checkout"
                    className="w-full py-4 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <LogIn size={18} />
                    <span>Log In to Your Account to Checkout</span>
                  </Link>
                )}
              </div>
            </form>

          </div>

          {/* Right Column: Order Summary Breakdown */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#B4D397] shadow-sm space-y-6 sticky top-28">
            <h3 className="text-xl font-extrabold text-[#140E0A] border-b border-[#EAF3DB] pb-4">
              Order Summary ({cart.length} Items)
            </h3>

            <div className="divide-y divide-[#EAF3DB] max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F5] border border-[#E0E0E0] flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      <span className="absolute top-0 right-0 bg-[#140E0A] text-[#FACC15] text-[10px] font-bold w-4 h-4 rounded-bl flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#140E0A] line-clamp-1">{item.product.name}</p>
                      <p className="text-[11px] text-[#5A7543] font-normal">{item.quantity} x {formatPrice(item.product.price)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#140E0A]">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#CBE0B4] pt-4 space-y-2 text-xs font-normal">
              <div className="flex justify-between text-[#5A7543]">
                <span>Subtotal</span>
                <span className="font-bold text-[#140E0A]">{formatPrice(subtotal)}</span>
              </div>

              <div className="pt-2" id="shipping-select">
                <p className="text-xs font-bold text-[#5A7543] uppercase tracking-wider mb-2">
                  Shipping Cost <span className="text-red-500">*</span>
                </p>
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setShippingId(opt.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        shippingId === opt.id
                          ? 'border-[#499A13] bg-[#F3F7ED]'
                          : 'border-[#CBE0B4] bg-[#FAFAF7] hover:border-[#499A13]/50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingId === opt.id}
                          onChange={() => setShippingId(opt.id)}
                          className="text-[#499A13] focus:ring-[#499A13]"
                        />
                        <span className="text-xs font-semibold text-[#140E0A]">{opt.label}</span>
                      </span>
                      <span className="text-xs font-bold text-[#140E0A]">
                        {formatPrice(opt.cost)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-base font-extrabold text-[#140E0A] pt-2 border-t border-[#EAF3DB]">
                <span>Total Payment</span>
                <span className="text-xl text-[#140E0A]">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="bg-[#F3F7ED] p-4 rounded-xl border border-[#499A13]/30 space-y-2 text-[11px] text-[#22491F]">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <CheckCircle2 size={14} />
                <span>100% Indonesian Herbal Purity Guarantee</span>
              </div>
              <p className="text-gray-600 font-normal">
                Every order status update will be sent directly to your registered email.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

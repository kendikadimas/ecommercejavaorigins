'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, MessageSquare, ArrowRight, CheckCircle2, QrCode, Building2, UserCheck, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PaymentMethodType, INITIAL_PAYMENT_METHODS } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useCustomerAuth();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>(INITIAL_PAYMENT_METHODS);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(INITIAL_PAYMENT_METHODS[0]?.id || '');
  const [checkoutFlow, setCheckoutFlow] = useState<'WEB' | 'WHATSAPP'>('WEB');

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: 'Yogyakarta',
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
        city: user.city || prev.city || 'Yogyakarta',
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
      <div className="bg-[#FAFAF7] min-h-screen py-20 text-center font-sans">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#E6E0D4] space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold text-[#140E0A]">Keranjang Belanja Kosong</h2>
          <p className="text-xs text-gray-500">Silakan tambahkan produk ke keranjang terlebih dahulu sebelum checkout.</p>
          <Link
            href="/shop"
            className="inline-block bg-[#140E0A] text-[#FACC15] font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
          >
            Kembali ke Toko
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

    if (!user) {
      setError('Anda wajib mendaftar atau masuk ke akun Anda terlebih dahulu sebelum membuat pesanan.');
      return;
    }

    if (!form.customerName || !form.customerPhone || !form.address) {
      setError('Mohon lengkapi Nama, Nomor HP/WhatsApp, dan Alamat Lengkap.');
      return;
    }

    setLoading(true);

    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail || user.email,
      customerPhone: form.customerPhone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode || '55000',
      totalAmount: subtotal,
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
        const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6287864562253';
        const itemListText = cart
          .map((item) => `- ${item.product.name} (${item.quantity}x) = ${formatPrice(item.product.price * item.quantity)}`)
          .join('\n');

        const message = `*HELLO JAVA ORIGINS ADMIN!*\nI would like to place an order via WhatsApp.\n\n*Order ID:* ${orderData.orderNumber}\n*Customer Name:* ${form.customerName}\n*Email:* ${form.customerEmail}\n*Phone Number:* ${form.customerPhone}\n*Address:* ${form.address}, ${form.city} (${form.postalCode})\n\n*Product List:*\n${itemListText}\n\n*Total Payment:* ${formatPrice(subtotal)}\n*Notes:* ${form.notes || '-'}\n\nPlease help to process this order, thank you!`;

        const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`;
        window.location.href = waUrl;
      } else {
        router.push(`/order/${orderData.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF7] min-h-screen py-10 text-[#140E0A] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/cart" className="text-xs text-[#786C60] hover:text-[#EAB308] font-bold">
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
                className="px-5 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow flex items-center space-x-1.5"
              >
                <LogIn size={16} />
                <span>Login to Your Account</span>
              </Link>
              <Link
                href="/register?redirect=/checkout"
                className="px-5 py-2.5 bg-white border border-[#D6CBB8] text-[#2C1D11] hover:bg-[#FAF8F5] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center space-x-1.5"
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
            <Link href="/profile" className="text-[#D97706] font-bold hover:underline">
              Edit Profile / Address
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Form & Payment Selector */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E6E0D4] shadow-sm space-y-8">
            
            {/* Flow selector tab */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#786C60] mb-3">
                Choose Checkout Flow
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutFlow('WEB')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    checkoutFlow === 'WEB'
                      ? 'border-[#140E0A] bg-[#140E0A] text-[#FACC15] shadow-md'
                      : 'border-[#E6E0D4] bg-[#FAFAF7] text-[#140E0A] hover:border-[#EAB308]'
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
                      : 'border-[#E6E0D4] bg-[#FAFAF7] text-[#140E0A] hover:border-emerald-500'
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
                <h3 className="text-lg font-extrabold text-[#140E0A] border-b border-[#F5EFE6] pb-2">
                  Contact & Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A2B20] mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      placeholder="Example: John Doe"
                      value={form.customerName}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3A2B20] mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      placeholder="+6281234567890"
                      value={form.customerPhone}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A2B20] mb-1">Email (Order Status Notification)</label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    placeholder="john@example.com"
                    value={form.customerEmail}
                    onChange={handleTextChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A2B20] mb-1">Full Shipping Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="Street Name, House Number, District, City"
                    value={form.address}
                    onChange={handleTextChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A2B20] mb-1">City / Regency</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A2B20] mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="55281"
                      value={form.postalCode}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A2B20] mb-1">Additional Notes (Optional)</label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="E.g., Please use thick bubble wrap"
                    value={form.notes}
                    onChange={handleTextChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E0D4] bg-[#FAFAF7] text-sm focus:outline-none focus:border-[#EAB308] font-normal"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              {checkoutFlow === 'WEB' && (
                <div className="space-y-4 pt-4 border-t border-[#F5EFE6]">
                  <h3 className="text-lg font-bold text-[#140E0A]">
                    Choose Bank / QRIS Payment Method
                  </h3>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const isSelected = selectedMethodId === method.id;
                      return (
                        <label
                          key={method.id}
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#EAB308] bg-[#FFFDF6] shadow-sm'
                              : 'border-[#E6E0D4] bg-[#FAFAF7] hover:border-[#EAB308]/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={isSelected}
                              onChange={() => setSelectedMethodId(method.id)}
                              className="text-[#EAB308] focus:ring-[#EAB308]"
                            />
                            <div>
                              <p className="text-sm font-bold text-[#140E0A]">
                                {method.name} ({method.bankName})
                              </p>
                              <p className="text-xs text-[#786C60] font-normal">
                                Acc: <span className="font-mono font-semibold">{method.accountNumber}</span> a/n {method.accountName}
                              </p>
                            </div>
                          </div>

                          {method.qrCodeUrl ? (
                            <QrCode size={24} className="text-[#EAB308]" />
                          ) : (
                            <Building2 size={24} className="text-[#786C60]" />
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
                      <span>Processing Order...</span>
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
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E6E0D4] shadow-sm space-y-6 sticky top-28">
            <h3 className="text-xl font-extrabold text-[#140E0A] border-b border-[#F5EFE6] pb-4">
              Order Summary ({cart.length} Items)
            </h3>

            <div className="divide-y divide-[#F5EFE6] max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F5EFE6] border border-[#E6E0D4] flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      <span className="absolute top-0 right-0 bg-[#140E0A] text-[#FACC15] text-[10px] font-bold w-4 h-4 rounded-bl flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#140E0A] line-clamp-1">{item.product.name}</p>
                      <p className="text-[11px] text-[#786C60] font-normal">{item.quantity} x {formatPrice(item.product.price)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#140E0A]">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E6E0D4] pt-4 space-y-2 text-xs font-normal">
              <div className="flex justify-between text-[#786C60]">
                <span>Subtotal</span>
                <span className="font-bold text-[#140E0A]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#786C60]">
                <span>Shipping Cost</span>
                <span className="text-emerald-600 font-bold">FREE (Heritage Promo)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#140E0A] pt-2 border-t border-[#F5EFE6]">
                <span>Total Payment</span>
                <span className="text-xl text-[#140E0A]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="bg-[#FFFDF6] p-4 rounded-xl border border-[#EAB308]/30 space-y-2 text-[11px] text-[#3A2B20]">
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

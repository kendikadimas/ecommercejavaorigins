'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, Mail, LogOut, CheckCircle2, Clock, Truck, XCircle, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { OrderType, EmailLogType } from '@/lib/store';
import { formatPrice } from '@/lib/format';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ORDERS' | 'NOTIFICATIONS'>('ORDERS');
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
      });

      // Fetch user's order history & email logs
      fetch('/api/user/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
          if (data.emailLogs) setEmailLogs(data.emailLogs);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-20 text-center font-sans">
        <p className="text-[#2C1D11] text-base font-semibold">Loading Customer Profile...</p>
      </div>
    );
  }

  if (!user) {
    router.replace('/login?redirect=/profile');
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    setSavingProfile(true);

    const res = await updateProfile(profileForm);
    setSavingProfile(false);

    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setProfileMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  const getStatusBadge = (status: OrderType['status']) => {
    switch (status) {
      case 'WAITING_APPROVAL':
        return (
          <span className="inline-flex items-center bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Clock size={12} className="mr-1 text-amber-700" /> Awaiting Admin Approval
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <CheckCircle2 size={12} className="mr-1 text-emerald-700" /> Payment Approved (PAID)
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Truck size={12} className="mr-1 text-blue-700" /> Out for Delivery
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center bg-red-100 text-red-900 border border-red-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <XCircle size={12} className="mr-1 text-red-700" /> Rejected by Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Clock size={12} className="mr-1 text-gray-500" /> Awaiting Proof Upload
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 text-[#2C1D11] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Card Header */}
        <div className="bg-white border border-[#E6DEC9] p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#D97706] text-white flex items-center justify-center font-extrabold text-2xl shadow">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#FFFBEB] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                CUSTOMER ACCOUNT
              </span>
              <h1 className="text-2xl font-extrabold text-[#2C1D11] mt-1">{user.name}</h1>
              <p className="text-xs text-gray-500 font-normal">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E6DEC9] space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ORDERS'
                ? 'border-[#D97706] text-[#D97706]'
                : 'border-transparent text-gray-500 hover:text-[#2C1D11]'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'PROFILE'
                ? 'border-[#D97706] text-[#D97706]'
                : 'border-transparent text-gray-500 hover:text-[#2C1D11]'
            }`}
          >
            <User size={18} />
            <span>Edit My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'NOTIFICATIONS'
                ? 'border-[#D97706] text-[#D97706]'
                : 'border-transparent text-gray-500 hover:text-[#2C1D11]'
            }`}
          >
            <Mail size={18} />
            <span>Email Notifications ({emailLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: RIWAYAT PEMESANAN */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <p className="text-xs text-gray-500">Loading order history...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-[#E6DEC9] p-8 rounded-2xl text-center space-y-3">
                <ShoppingBag size={40} className="mx-auto text-gray-300" />
                <h3 className="text-base font-bold text-[#2C1D11]">No Orders Yet</h3>
                <p className="text-xs text-gray-500">You haven't placed any orders at Java Origins yet.</p>
                <Link
                  href="/shop"
                  className="inline-block bg-[#D97706] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                >
                  Shop Products Now
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-[#E6DEC9] rounded-2xl p-6 shadow-sm space-y-4 hover:border-[#D97706]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono text-sm font-extrabold text-[#D97706]">#{order.orderNumber}</span>
                      <p className="text-[11px] text-gray-400 font-normal">
                        Date: {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-gray-100 space-y-2">
                    {order.items.map((it) => (
                      <div key={it.id} className="pt-2 flex justify-between text-xs items-center">
                        <span className="font-semibold text-[#2C1D11]">{it.productName} ({it.quantity}x)</span>
                        <span className="font-bold text-[#B45309]">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-xs">
                      <span className="text-gray-500 font-normal">Total Bill: </span>
                      <span className="font-extrabold text-sm text-[#2C1D11]">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <Link
                      href={`/order/${order.orderNumber}`}
                      className="px-4 py-2 bg-[#FAF8F5] border border-[#D6CBB8] hover:bg-[#D97706] hover:text-white text-[#2C1D11] font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
                    >
                      <ExternalLink size={14} />
                      <span>View Status / Upload Payment Proof</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: EDIT PROFIL */}
        {activeTab === 'PROFILE' && (
          <div className="bg-white border border-[#E6DEC9] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#2C1D11]">Edit Customer Profile</h2>
              <p className="text-xs text-gray-500 font-normal">Update your personal information & shipping address.</p>
            </div>

            {profileMessage.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}
              >
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C4D40] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D6CBB8] rounded-xl text-sm text-[#2C1D11] focus:outline-none focus:border-[#D97706] font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C4D40] mb-1">Email Address (Cannot be changed)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-500 rounded-xl text-sm font-normal cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C4D40] mb-1">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D6CBB8] rounded-xl text-sm text-[#2C1D11] focus:outline-none focus:border-[#D97706] font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C4D40] mb-1">Full Shipping Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D6CBB8] rounded-xl text-sm text-[#2C1D11] focus:outline-none focus:border-[#D97706] font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C4D40] mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D6CBB8] rounded-xl text-sm text-[#2C1D11] focus:outline-none focus:border-[#D97706] font-normal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C4D40] mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D6CBB8] rounded-xl text-sm text-[#2C1D11] focus:outline-none focus:border-[#D97706] font-normal"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors inline-flex items-center space-x-2 shadow"
                >
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: NOTIFIKASI EMAIL */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="bg-white border border-[#E6DEC9] p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#2C1D11]">Email Notifications Received ({user.email})</h2>
              <p className="text-xs text-gray-500 font-normal">
                Whenever your order status is updated by Admin, an automatic notification is sent to this email.
              </p>
            </div>

            {emailLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">No email notifications sent yet.</p>
            ) : (
              <div className="space-y-3">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-[#FAF8F5] border border-[#E6DEC9] rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#D97706]">{log.subject}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.createdAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <p className="text-gray-700 font-normal">{log.body}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold pt-1">
                      Status: Sent to {log.to}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

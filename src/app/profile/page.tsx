'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, Mail, LogOut, CheckCircle2, Clock, Truck, XCircle, AlertCircle, Save, ExternalLink, Lock } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { OrderType, EmailLogType } from '@/lib/store';
import { formatPrice } from '@/lib/format';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ORDERS' | 'NOTIFICATIONS' | 'SECURITY'>('ORDERS');
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

  // Change Password Form State
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage({ type: '', text: '' });
    if (pwdForm.next.length < 8) {
      setPwdMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      setPwdMessage({ type: 'error', text: 'Password confirmation does not match.' });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: pwdForm.current, newPassword: pwdForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setPwdMessage({ type: 'success', text: 'Password changed successfully.' });
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setSavingPwd(false);
    }
  };

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

  // Redirect unauthenticated users in an effect, not during render (avoids double-navigation)
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/profile');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-20 text-center font-sans">
        <p className="text-[#26421F] text-base font-semibold">Loading Customer Profile...</p>
      </div>
    );
  }

  if (!user) {
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
    <div className="bg-white min-h-screen py-10 text-[#26421F] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Card Header */}
        <div className="bg-white border border-[#B4D397] p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#276F27] text-white flex items-center justify-center font-extrabold text-2xl shadow">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#276F27] bg-[#F0F4EA] px-2.5 py-0.5 rounded-full border border-[#C9D8BE]">
                CUSTOMER ACCOUNT
              </span>
              <h1 className="text-2xl font-extrabold text-[#26421F] mt-1">{user.name}</h1>
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
        <div className="flex border-b border-[#DFE6D6] space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ORDERS'
                ? 'border-[#276F27] text-[#276F27]'
                : 'border-transparent text-gray-500 hover:text-[#26421F]'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'PROFILE'
                ? 'border-[#276F27] text-[#276F27]'
                : 'border-transparent text-gray-500 hover:text-[#26421F]'
            }`}
          >
            <User size={18} />
            <span>Edit My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'NOTIFICATIONS'
                ? 'border-[#276F27] text-[#276F27]'
                : 'border-transparent text-gray-500 hover:text-[#26421F]'
            }`}
          >
            <Mail size={18} />
            <span>Email Notifications ({emailLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'SECURITY'
                ? 'border-[#276F27] text-[#276F27]'
                : 'border-transparent text-gray-500 hover:text-[#26421F]'
            }`}
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
        </div>

        {/* TAB 1: RIWAYAT PEMESANAN */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <p className="text-xs text-gray-500">Loading order history...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-[#B4D397] p-8 rounded-2xl text-center space-y-3">
                <ShoppingBag size={40} className="mx-auto text-gray-300" />
                <h3 className="text-base font-bold text-[#26421F]">No Orders Yet</h3>
                <p className="text-xs text-gray-500">You haven't placed any orders at Java Origins yet.</p>
                <Link
                  href="/shop"
                  className="inline-block bg-[#276F27] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                >
                  Shop Products Now
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-[#B4D397] rounded-2xl p-6 shadow-sm space-y-4 hover:border-[#276F27]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono text-sm font-extrabold text-[#276F27]">#{order.orderNumber}</span>
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
                        <span className="font-semibold text-[#26421F]">{it.productName} ({it.quantity}x)</span>
                        <span className="font-bold text-[#276F27]">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-xs">
                      <span className="text-gray-500 font-normal">Total Bill: </span>
                      <span className="font-extrabold text-sm text-[#26421F]">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <Link
                      href={`/order/${order.id}`}
                      className="px-4 py-2 bg-[#F2F7E9] border border-[#C9D3BE] hover:bg-[#276F27] hover:text-white text-[#26421F] font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
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
          <div className="bg-white border border-[#B4D397] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#26421F]">Edit Customer Profile</h2>
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
                <label className="block text-xs font-semibold text-[#44663A] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44663A] mb-1">Email Address (Cannot be changed)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-500 rounded-xl text-sm font-normal cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44663A] mb-1">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44663A] mb-1">Full Shipping Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#44663A] mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#44663A] mb-1">Postcode</label>
                  <input
                    type="text"
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors inline-flex items-center space-x-2 shadow"
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
          <div className="bg-white border border-[#B4D397] p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#26421F]">Email Notifications Received ({user.email})</h2>
              <p className="text-xs text-gray-500 font-normal">
                Whenever your order status is updated by Admin, an automatic notification is sent to this email.
              </p>
            </div>

            {emailLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">No email notifications sent yet.</p>
            ) : (
              <div className="space-y-3">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-[#F2F7E9] border border-[#DFE6D6] rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#276F27]">{log.subject}</span>
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

        {/* TAB 4: SECURITY — GANTI PASSWORD */}
        {activeTab === 'SECURITY' && (
          <div className="bg-white border border-[#B4D397] p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#26421F]">Change Password</h2>
              <p className="text-xs text-gray-500 font-normal">
                Update your account password regularly for security.
              </p>
            </div>

            {pwdMessage.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  pwdMessage.type === 'error'
                    ? 'bg-red-50 border border-red-300 text-red-800'
                    : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                }`}
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-[#44663A] mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.current}
                  onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                  placeholder="Current password"
                  className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44663A] mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.next}
                  onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44663A] mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
              </div>
              <button
                type="submit"
                disabled={savingPwd}
                className="px-6 py-2.5 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow inline-flex items-center space-x-2"
              >
                <Save size={14} />
                <span>{savingPwd ? 'Saving...' : 'Change Password'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Lock, Phone, MapPin, UserPlus, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { safeRedirect } from '@/lib/redirect';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

function CustomerRegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirect(searchParams.get('redirect'), '/profile');

  const { register } = useCustomerAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Full name, email, and password are required.');
      return;
    }

    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      window.location.href = redirectUrl;
    } else {
      setErrorMsg(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="bg-white min-h-[85vh] flex items-center justify-center p-4 font-sans py-12">
      <div className="bg-[#EEF6E0] border border-[#B4D397] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#276F27]">JAVA ORIGINS STORE</span>
          <h1 className="text-2xl font-extrabold text-[#26421F]">Create New Customer Account</h1>
          <p className="text-xs text-gray-500 font-normal">
            Register to easily place orders, view status & order history.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <GoogleSignInButton redirect={redirectUrl} label="Sign up with Google" />

        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-[#C9D3BE]" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">or</span>
          <span className="flex-1 h-px bg-[#C9D3BE]" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <User size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44663A] mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44663A] mb-1">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
                />
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Phone / WhatsApp Number</label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Shipping Address</label>
            <div className="relative">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, District"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44663A] mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Yogyakarta"
                className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44663A] mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="55271"
                className="w-full px-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow"
          >
            <UserPlus size={16} />
            <span>{submitting ? 'Processing Registration...' : 'Register Account Now'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-600 font-normal">
          Already have an account?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-[#276F27] hover:underline"
          >
            Login Now
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-white p-12 text-center text-gray-500">Loading...</div>}>
      <CustomerRegisterInner />
    </Suspense>
  );
}

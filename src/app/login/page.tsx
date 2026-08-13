'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { safeRedirect } from '@/lib/redirect';

function CustomerLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirect(searchParams.get('redirect'), '/profile');

  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email and Password are required.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setErrorMsg(res.error || 'Incorrect email or password.');
    }
  };

  return (
    <div className="bg-white min-h-[80vh] flex items-center justify-center p-4 font-sans py-12">
      <div className="bg-[#EEF6E0] border border-[#B4D397] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#276F27]">JAVA ORIGINS STORE</span>
          <h1 className="text-2xl font-extrabold text-[#26421F]">Login to Your Account</h1>
          <p className="text-xs text-gray-500 font-normal">
            Please log in to continue ordering and view transaction history.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow"
          >
            <LogIn size={16} />
            <span>{submitting ? 'Processing...' : 'Login Now'}</span>
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#276F27] hover:underline"
          >
            Lupa Password?
          </Link>
        </div>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-600 font-normal">
          Don't have an account?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-[#276F27] hover:underline"
          >
            Register New Account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-white p-12 text-center text-gray-500">Loading...</div>}>
      <CustomerLoginInner />
    </Suspense>
  );
}

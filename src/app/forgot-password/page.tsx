'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

function ForgotPasswordInner() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Email is required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email.');
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white min-h-[80vh] flex items-center justify-center p-4 font-sans py-12">
        <div className="bg-white border border-[#B4D397] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-xl text-center space-y-4">
          <CheckCircle2 size={40} className="mx-auto text-[#276F27]" />
          <h1 className="text-xl font-extrabold text-[#26421F]">Check Your Email</h1>
          <p className="text-sm text-gray-600 font-normal">
            If the email is registered, we have sent a password reset link to{' '}
            <span className="font-bold text-[#276F27]">{email}</span>. The link is valid for 1 hour.
          </p>
          <Link
            href="/login"
            className="inline-block mt-2 bg-[#276F27] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[80vh] flex items-center justify-center p-4 font-sans py-12">
      <div className="bg-white border border-[#B4D397] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-xl space-y-6">
        <Link href="/login" className="inline-flex items-center text-xs font-semibold text-[#276F27] hover:underline">
          <ArrowLeft size={14} className="mr-1" /> Back to Login
        </Link>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#276F27]">JAVA ORIGINS STORE</span>
          <h1 className="text-2xl font-extrabold text-[#26421F]">Forgot Password</h1>
          <p className="text-xs text-gray-500 font-normal">
            Enter your registered email — we will send you a link to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors shadow"
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-white p-12 text-center text-gray-500">Loading...</div>}>
      <ForgotPasswordInner />
    </Suspense>
  );
}

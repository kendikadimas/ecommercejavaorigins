'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!token) {
      setErrorMsg('Link reset tidak valid.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password.');
      setDone(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white min-h-[80vh] flex items-center justify-center p-4 font-sans py-12">
        <div className="bg-[#EEF6E0] border border-[#B4D397] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-xl text-center space-y-4">
          <CheckCircle2 size={40} className="mx-auto text-[#276F27]" />
          <h1 className="text-xl font-extrabold text-[#26421F]">Password Berhasil Diubah</h1>
          <p className="text-sm text-gray-600 font-normal">
            Anda bisa login dengan password baru sekarang.
          </p>
          <Link
            href="/login"
            className="inline-block mt-2 bg-[#276F27] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[80vh] flex items-center justify-center p-4 font-sans py-12">
      <div className="bg-[#EEF6E0] border border-[#B4D397] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#276F27]">JAVA ORIGINS STORE</span>
          <h1 className="text-2xl font-extrabold text-[#26421F]">Buat Password Baru</h1>
          <p className="text-xs text-gray-500 font-normal">
            Masukkan password baru untuk akun Anda.
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
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Password Baru *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
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

          <div>
            <label className="block text-xs font-semibold text-[#44663A] mb-1">Konfirmasi Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F7E9] border border-[#C9D3BE] rounded-xl text-sm text-[#26421F] focus:outline-none focus:border-[#276F27] font-normal"
              />
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#276F27] hover:bg-[#276F27] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors shadow"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-white p-12 text-center text-gray-500">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

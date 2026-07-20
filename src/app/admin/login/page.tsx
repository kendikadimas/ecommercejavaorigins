'use client';

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Check your username and password.');
      }

      // Store auth token in both localStorage and document.cookie for maximum compatibility
      localStorage.setItem('java_admin_logged_in', 'true');
      document.cookie = 'java_admin_auth=authenticated; path=/; max-age=86400';

      // Perform clean full-page navigation to dashboard
      window.location.href = '/admin/products';
    } catch (err: any) {
      setError(err.message || 'Login failed. Use admin@javaorigins.com and admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#140E0A] flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md space-y-8 bg-[#231911] border border-[#FACC15]/30 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Glow background accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-[#140E0A] px-3 py-1 rounded-full text-[10px] font-bold text-[#FACC15] border border-[#FACC15]/30">
            <ShieldCheck size={14} />
            <span>PROTECTED ADMIN AREA</span>
          </div>
          <div className="pt-2">
            <Logo variant="gold" className="justify-center" />
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest pt-1">
            Login to Management Dashboard
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/90 border border-red-500/60 text-red-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Email / Admin Username *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin@javaorigins.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#140E0A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
              <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Admin Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#140E0A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
              <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FACC15] text-[#140E0A] font-extrabold py-3.5 px-6 rounded-xl hover:bg-[#EAB308] transition-all transform hover:scale-[1.02] shadow-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Verifying Admin...</span>
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

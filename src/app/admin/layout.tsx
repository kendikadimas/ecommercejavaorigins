'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, CreditCard, Image as ImageIcon, ShoppingCart, ArrowLeft, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import AdminLoginPage from './login/page';
import { AdminThemeProvider, useAdminTheme } from '@/context/AdminThemeContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();

  // ponytail: localStorage as fast-path to avoid flicker; /api/admin/check is the real source of truth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          localStorage.setItem('java_admin_logged_in', 'true');
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('java_admin_logged_in');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        localStorage.removeItem('java_admin_logged_in');
        setIsAuthenticated(false);
      });
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('java_admin_logged_in');
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    window.location.href = '/admin/login';
  };

  if (pathname === '/admin/login') {
    return <AdminLoginPage />;
  }

  // null = still checking auth, show nothing to avoid SSR router.replace crash
  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    return null;
  }

  const navItems = [
    { name: 'Manage Products', href: '/admin/products', icon: Package },
    { name: 'Manage Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Manage Payment Methods', href: '/admin/payment-methods', icon: CreditCard },
    { name: 'Manage Banners', href: '/admin/banners', icon: ImageIcon },
  ];

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${
        isLight ? 'bg-[#FAF8F5] text-[#2C1D11]' : 'bg-[#140E0A] text-white'
      }`}
    >
      {/* Mobile Top Header Bar */}
      <div
        className={`md:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md ${
          isLight ? 'bg-[#2A1D13] text-white border-b border-[#3D2B1E]' : 'bg-[#231911] text-white border-b border-[#EAB308]/20'
        }`}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-[#FACC15] hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-extrabold text-lg text-[#FACC15] tracking-tight">JAVA ORIGINS</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-[#FACC15] bg-[#140E0A] hover:bg-white/10 rounded-lg border border-[#FACC15]/30 transition-colors flex items-center space-x-1.5 text-xs font-bold"
            title="Toggle Light / Dark Mode"
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
          </button>
          <span className="text-[10px] bg-[#140E0A] text-[#FACC15] px-2.5 py-1 rounded-full border border-[#FACC15]/30 font-bold uppercase tracking-wider">
            ADMIN
          </span>
        </div>
      </div>

      {/* Admin Fixed Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 transform md:sticky md:top-0 md:h-screen md:translate-x-0 flex-shrink-0 ${
          isLight
            ? 'bg-[#231911] text-white border-r border-[#3D2B1E]'
            : 'bg-[#231911] text-white border-r border-[#EAB308]/20'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/products" className="block" onClick={() => setMobileSidebarOpen(false)}>
                <span className="font-extrabold text-2xl text-[#FACC15] tracking-tight block">
                  JAVA ORIGINS
                </span>
                <span className="block text-[11px] font-semibold tracking-widest text-amber-200/70 uppercase mt-1">
                  Admin Portal
                </span>
              </Link>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Theme Switcher Button with SVG Lucide Icons */}
          <div className="bg-[#140E0A] p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
              {isLight ? <Sun size={16} className="text-[#FACC15]" /> : <Moon size={16} className="text-[#FACC15]" />}
              <span>Display Mode:</span>
            </span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 bg-[#FACC15] text-[#140E0A] font-extrabold text-[11px] rounded-lg hover:bg-[#EAB308] transition-all flex items-center space-x-1 shadow"
            >
              {isLight ? <Sun size={13} className="mr-0.5" /> : <Moon size={13} className="mr-0.5" />}
              <span>{isLight ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-[#FACC15] text-[#140E0A] shadow-lg font-extrabold'
                      : 'text-gray-300 font-semibold hover:bg-[#2E2016] hover:text-[#FACC15]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-950/80 text-red-300 hover:bg-red-600 hover:text-white transition-colors text-xs font-semibold border border-red-500/30"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          <Link
            href="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center justify-center space-x-2 text-xs font-medium text-gray-400 hover:text-[#FACC15] transition-colors py-1"
          >
            <ArrowLeft size={16} />
            <span>Back to Main Website</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 p-4 sm:p-8 lg:p-10 min-h-screen overflow-y-auto font-sans transition-colors duration-200 ${
          isLight ? 'bg-[#FAF8F5]' : 'bg-[#1A120C]'
        }`}
      >
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}

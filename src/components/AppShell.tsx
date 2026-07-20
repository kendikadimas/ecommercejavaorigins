'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[#140E0A] text-white">{children}</main>;
  }

  return (
    <CustomerAuthProvider>
      <div className="min-h-screen flex flex-col justify-between font-sans">
        <Navbar />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CustomerAuthProvider>
  );
};

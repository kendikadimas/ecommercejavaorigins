'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { CartToast } from '@/components/CartToast';
import { Footer } from '@/components/Footer';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { CornerLeaf } from '@/components/CornerLeaf';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Scroll back to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[#140E0A] text-white">{children}</main>;
  }

  return (
    <CustomerAuthProvider>
      <div className="relative min-h-screen flex flex-col justify-between font-sans bg-white">
        {/* Root background leaf accents */}
        <div aria-hidden className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden">
          <CornerLeaf
            src="/elements/leaf-glossy-twin-pointing-bottom-right.png.png"
            className="absolute top-6 left-6"
            size={220}
            opacity={0.28}
          />
          <CornerLeaf
            src="/elements/leaf-monstera-palm-cluster-fan-upward.png.png"
            className="absolute bottom-6 left-6"
            size={260}
            opacity={0.28}
          />
          <CornerLeaf
            src="/elements/leaf-palm-frond-pair-pointing-topleft-corner.png"
            className="absolute top-24 right-4"
            size={220}
            opacity={0.26}
          />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar />
          <CartDrawer />
          <CartToast />
          <main key={pathname} className="flex-1 page-fade-in">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </CustomerAuthProvider>
  );
};

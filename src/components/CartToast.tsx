'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// ponytail: toast that slides up when an item is added to cart, auto-dismisses
export const CartToast = () => {
  const { lastAdded } = useCart();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!lastAdded) return;
    setName(lastAdded.name);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [lastAdded]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-cart-toast">
      <div className="flex items-center space-x-2.5 bg-[#276F27] text-white pl-3 pr-5 py-3 rounded-full shadow-xl border border-white/20">
        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={16} className="text-white" />
        </span>
        <p className="text-xs sm:text-sm font-bold truncate max-w-[240px] sm:max-w-sm">
          {name}
        </p>
        <span className="text-[11px] font-semibold text-green-100">added to cart</span>
      </div>
    </div>
  );
};

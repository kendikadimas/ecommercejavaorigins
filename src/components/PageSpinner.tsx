'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

// ponytail: shared loading spinner for route transitions & client-fetch loading states
export const PageSpinner: React.FC<{ label?: string; className?: string }> = ({
  label = 'Loading ...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[#B4D397]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#276F27] animate-spin" />
        <Leaf size={22} className="text-[#276F27] animate-pulse" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#5A7543] animate-pulse">
        {label}
      </p>
    </div>
  );
};

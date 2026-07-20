'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'dark' | 'light' | 'gold';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', className = '' }) => {
  const textColor =
    variant === 'light'
      ? 'text-white'
      : variant === 'gold'
      ? 'text-[#FACC15]'
      : 'text-[#140E0A]';

  return (
    <Link href="/" className={`inline-block group ${className}`}>
      <div
        className={`flex flex-col font-black tracking-tighter uppercase leading-none select-none ${textColor} group-hover:text-[#EAB308] transition-colors`}
      >
        <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none">
          JAVA
        </span>
        <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none -mt-1 sm:-mt-1.5">
          ORIGINS
        </span>
      </div>
    </Link>
  );
};

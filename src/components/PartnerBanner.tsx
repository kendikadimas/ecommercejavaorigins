'use client';

import React from 'react';
import Link from 'next/link';

export const PartnerBanner = () => {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6287864562253';
  const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(
    'Hello Admin Java Origins, I am interested in becoming a partner / reseller of Java Origins products.'
  )}`;

  return (
    <section id="partner" className="py-16 bg-[#1A120C] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-[#FACC15] rounded-3xl p-8 sm:p-12 text-center text-[#140E0A] shadow-2xl relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <span className="inline-block bg-[#140E0A] text-[#FACC15] font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
          RESELLER & DISTRIBUTOR
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-3 uppercase">
          PARTNER WITH JAVA ORIGINS
        </h2>

        <p className="text-sm sm:text-base font-medium max-w-3xl mx-auto mt-4 leading-relaxed text-[#2A2016]">
          We welcome retailers, distributors, and resellers to bring Java Origins into their store shelves and cafes. For all product inquiries, wholesale catalog requests, or regional distribution partnerships, reach out to our team today!
        </p>

        <div className="mt-8">
          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#140E0A] text-[#FACC15] font-extrabold px-8 py-3.5 rounded-full hover:bg-black transition-transform transform hover:scale-105 shadow-xl text-sm sm:text-base uppercase tracking-wider"
          >
            Contact Us via WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
};

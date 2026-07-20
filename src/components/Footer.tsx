'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { MessageCircle, Instagram } from 'lucide-react';

export const Footer = () => {
  const waNumber = '6282130613460';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Hello Admin Java Origins, I am interested in your herbal products.'
  )}`;

  return (
    <footer className="bg-[#140E0A] text-white border-t border-[#EAB308]/20 pt-16 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          
          {/* Column 1: JAVA ORIGINS Logo, Certifications, WhatsApp Us Button */}
          <div className="md:col-span-5 space-y-5">
            <Logo variant="light" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light max-w-md">
              Certified under Indonesian Food Safety Standards (BPOM & PIRT) • Halal Certified • Ready for Export Markets
            </p>

            <p className="text-xs text-gray-500 font-medium">
              Pure Zealand - Head Office & Factory
            </p>

            <div className="pt-2">
              <Link
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#FACC15] text-[#140E0A] font-extrabold px-6 py-3 rounded-2xl hover:bg-[#EAB308] transition-all transform hover:scale-105 shadow-xl text-xs sm:text-sm uppercase tracking-wider"
              >
                <MessageCircle size={18} fill="currentColor" className="text-[#140E0A]" />
                <span>WhatsApp Us</span>
              </Link>
            </div>
          </div>

          {/* Column 2: NAVIGATION */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-sans text-xs sm:text-sm font-extrabold text-[#FACC15] uppercase tracking-widest">
              NAVIGATION
            </h4>

            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300">
              <li>
                <Link
                  href="/"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?cat=Herbal+Beverage"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Herbal Beverages
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?cat=Honey+%26+Elixir"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Honey & Elixirs
                </Link>
              </li>
              <li>
                <Link
                  href="/#ingredients"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Ingredients
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Product FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/#partner"
                  className="inline-block hover:text-[#FACC15] hover:translate-x-1.5 transition-all duration-200"
                >
                  Partner Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTACT (INDONESIA & NEW ZEALAND) */}
          <div className="md:col-span-4 space-y-5">
            <h4 className="font-sans text-xs sm:text-sm font-extrabold text-[#FACC15] uppercase tracking-widest">
              CONTACT
            </h4>

            {/* Indonesia Office */}
            <div className="space-y-1 text-xs text-gray-300">
              <p className="font-extrabold text-[#FACC15] uppercase tracking-wider text-xs">
                INDONESIA
              </p>
              <p className="leading-relaxed">
                Lobby Diamond A2, Apartemen Gateway Pasteur, Bandung - Indonesia.
              </p>
              <p className="font-mono text-gray-300 hover:text-[#FACC15] transition-colors">
                <a href="tel:+6282130613460">+6282130613460</a>
              </p>
            </div>

            {/* New Zealand Office */}
            <div className="space-y-1 text-xs text-gray-300">
              <p className="font-extrabold text-[#FACC15] uppercase tracking-wider text-xs">
                NEW ZEALAND
              </p>
              <p className="leading-relaxed">
                384 Moutere Highway, Tasman.
              </p>
              <p className="font-mono text-gray-300 hover:text-[#FACC15] transition-colors">
                <a href="tel:+64212532492">+64212532492</a>
              </p>
            </div>

            {/* Email */}
            <div className="text-xs text-gray-300">
              <a
                href="mailto:javaorigins.nz@gmail.com"
                className="hover:text-[#FACC15] transition-colors underline underline-offset-4"
              >
                javaorigins.nz@gmail.com
              </a>
            </div>

            {/* Social Icons */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                FOLLOW US
              </p>
              <div className="flex space-x-3">
                {/* Instagram Icon */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-gray-300 hover:bg-[#FACC15] hover:text-[#140E0A] hover:border-[#FACC15] transition-all transform hover:scale-110 shadow-md"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>

                {/* Authentic TikTok Vector SVG Icon */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-gray-300 hover:bg-[#FACC15] hover:text-[#140E0A] hover:border-[#FACC15] transition-all transform hover:scale-110 shadow-md"
                  aria-label="TikTok"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="currentColor"
                  >
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.277 0 .543.04.798.114V9.387a6.31 6.31 0 0 0-.798-.052A6.335 6.335 0 0 0 3.14 15.67a6.335 6.335 0 0 0 6.333 6.33 6.335 6.335 0 0 0 6.334-6.33V8.82a8.232 8.232 0 0 0 4.782 1.517V6.892a4.832 4.832 0 0 1-1.000-.206z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#0A0705] border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-3 sm:space-y-0">
          <p>© 2026 Pure Zealand. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-[11px] text-gray-400">
            <span>Made in Indonesia</span>
            <span>•</span>
            <span>BPOM RI Certified</span>
            <span>•</span>
            <span>Halal MUI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

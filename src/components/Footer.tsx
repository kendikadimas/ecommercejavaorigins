'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Instagram } from 'lucide-react';

export const Footer = () => {
  const waNumber = '64212532492';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Hello Admin Java Origins, I am interested in your herbal products.'
  )}`;

  return (
    <footer className="bg-[#140E0A] text-white border-t border-[#EAB308]/20 pt-16 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer 2 Columns (Navigation removed as it exists in Navbar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pb-16 border-b border-white/10">
          
          {/* Column 1: JAVA ORIGINS Logo, Certifications, WhatsApp Us Button */}
          <div className="space-y-5">
            <Logo variant="light" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light max-w-md">
              Certified under Indonesian Food Safety Standards (BPOM &amp; PIRT) | Halal Certified | Ready for Export Markets
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#140E0A]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp Us</span>
              </Link>
            </div>
          </div>

          {/* Column 2: CONTACT (INDONESIA & NEW ZEALAND) */}
          <div className="space-y-5">
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
                <a
                  href="https://wa.me/64212532492"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp: 0064212532492
                </a>
              </p>
              <p className="leading-relaxed">
                IG:{' '}
                <a
                  href="https://instagram.com/java_origins.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FACC15] transition-colors"
                >
                  java_origins.nz
                </a>
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
          <p>(c) 2026 Pure Zealand. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-[11px] text-gray-400">
            <span>Made in Indonesia</span>
            <span>|</span>
            <span>BPOM RI Certified</span>
            <span>|</span>
            <span>Halal MUI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

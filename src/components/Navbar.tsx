'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Logo } from '@/components/Logo';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm font-sans">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#140E0A] text-[#FACC15] border-b border-[#EAB308]/20 py-2 px-4 text-center">
        <p className="text-xs sm:text-sm tracking-wide flex items-center justify-center space-x-1.5 font-medium">
          <span>Bring Java Origins Home</span>
          <span className="text-white">•</span>
          <span>Free Shipping Nationwide</span>
        </p>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-[#FAFAF7] border-b border-[#E6E0D4] px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#140E0A] p-1 hover:text-[#EAB308]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo (Exact stacked JAVA ORIGINS logo in Dark Brown) */}
          <div className="flex-1 md:flex-none">
            <Logo variant="dark" />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex flex-wrap items-center justify-center space-x-3 lg:space-x-5 text-xs sm:text-sm font-semibold text-[#2A2016]">
            <Link href="/" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Home
            </Link>
            <Link href="/shop" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Shop All
            </Link>
            <Link href="/shop?cat=Herbal+Drink" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Herbal Drinks
            </Link>
            <Link href="/shop?cat=Food+%26+Snacks" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Food and Snacks
            </Link>
            <Link href="/shop?cat=Herbal+Care" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Herbal Care
            </Link>
            <Link href="/shop?cat=Fashion" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Fashion
            </Link>
            <Link href="/#faq" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              FAQs
            </Link>
            <Link href="/#partner" className="hover:text-[#9A3B26] transition-colors px-1 py-0.5">
              Contact Us
            </Link>
          </nav>

          {/* Right Section Icons (User Profile, Search & Shopping Bag) */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[#140E0A]">
            <Link
              href="/shop"
              className="hover:text-[#9A3B26] transition-colors p-1"
              title="Search Catalog"
            >
              <Search size={20} strokeWidth={2} />
            </Link>

            {/* Customer User Profile Button */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#D6CBB8] hover:border-[#9A3B26] text-[#140E0A] px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs"
                title="My Account & Order History"
              >
                <div className="w-5 h-5 rounded-full bg-[#D97706] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline line-clamp-1 max-w-[90px]">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 text-xs font-bold text-[#140E0A] hover:text-[#9A3B26] px-2 py-1 transition-colors"
                title="Login / Register"
              >
                <User size={19} strokeWidth={2} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-[#9A3B26] transition-colors p-1"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={21} strokeWidth={2} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EAB308] text-[#140E0A] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown (Simple, Clean Minimalist with Categories Dropdown) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E6E0D4] px-6 py-5 space-y-3 text-sm text-[#2A2016] shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-semibold hover:text-[#9A3B26] transition-colors py-1"
          >
            Home
          </Link>

          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-semibold hover:text-[#9A3B26] transition-colors py-1"
          >
            Shop All
          </Link>

          {/* Simple Clean Categories Dropdown */}
          <div className="py-1 border-y border-[#F5EFE6]">
            <button
              type="button"
              onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              className="w-full flex items-center justify-between font-semibold hover:text-[#9A3B26] transition-colors py-1 text-left"
            >
              <span>Categories</span>
              {mobileCategoriesOpen ? (
                <ChevronUp size={16} className="text-[#786C60]" />
              ) : (
                <ChevronDown size={16} className="text-[#786C60]" />
              )}
            </button>

            {mobileCategoriesOpen && (
              <div className="mt-2 ml-3 pl-3 border-l border-[#E6E0D4] space-y-2 text-xs text-[#5A4D41]">
                <Link
                  href="/shop?cat=Herbal+Drink"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#9A3B26] font-medium transition-colors"
                >
                  Herbal Drinks
                </Link>
                <Link
                  href="/shop?cat=Food+%26+Snacks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#9A3B26] font-medium transition-colors"
                >
                  Food and Snacks
                </Link>
                <Link
                  href="/shop?cat=Herbal+Care"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#9A3B26] font-medium transition-colors"
                >
                  Herbal Care
                </Link>
                <Link
                  href="/shop?cat=Fashion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#9A3B26] font-medium transition-colors"
                >
                  Fashion
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-semibold hover:text-[#9A3B26] transition-colors py-1"
          >
            FAQs
          </Link>

          <Link
            href="/#partner"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-semibold hover:text-[#9A3B26] transition-colors py-1"
          >
            Contact Us
          </Link>

          <div className="pt-2 border-t border-[#F5EFE6]">
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-[#D97706] py-1"
              >
                My Account ({user.name})
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-[#D97706] py-1"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

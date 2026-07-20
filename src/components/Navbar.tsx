'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Logo } from '@/components/Logo';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Center Navigation Links */}
          <nav className="hidden md:flex flex-wrap items-center justify-center space-x-6 lg:space-x-8 text-xs sm:text-sm font-semibold text-[#2A2016]">
            <Link href="/" className="hover:text-[#EAB308] transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-[#EAB308] transition-colors">
              Shop All
            </Link>
            <Link href="/shop?cat=Herbal+Beverage" className="hover:text-[#EAB308] transition-colors">
              Herbal Drinks
            </Link>
            <Link href="/shop?cat=Honey+%26+Elixir" className="hover:text-[#EAB308] transition-colors">
              Honey & Elixirs
            </Link>
            <Link href="/#ingredients" className="hover:text-[#EAB308] transition-colors">
              Ingredients
            </Link>
            <Link href="/#faq" className="hover:text-[#EAB308] transition-colors">
              Product FAQs
            </Link>
            <Link href="/#partner" className="hover:text-[#EAB308] transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Right Section Icons (User Profile, Search & Shopping Bag) */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[#140E0A]">
            <Link
              href="/shop"
              className="hover:text-[#EAB308] transition-colors p-1"
              title="Search Catalog"
            >
              <Search size={20} strokeWidth={2} />
            </Link>

            {/* Customer User Profile Button */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#D6CBB8] hover:border-[#EAB308] text-[#140E0A] px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs"
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
                className="flex items-center space-x-1 text-xs font-bold text-[#140E0A] hover:text-[#EAB308] px-2 py-1 transition-colors"
                title="Login / Register"
              >
                <User size={19} strokeWidth={2} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-[#EAB308] transition-colors p-1"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAFAF7] border-b border-[#E6E0D4] px-6 py-4 space-y-3 text-sm text-[#2A2016]">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 font-semibold hover:text-[#EAB308]"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 font-semibold hover:text-[#EAB308]"
          >
            Shop All Products
          </Link>

          {user ? (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 font-bold text-[#D97706]"
            >
              My Account ({user.name})
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 font-bold text-[#D97706]"
            >
              Login / Register Account
            </Link>
          )}

          <Link
            href="/#ingredients"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 font-semibold hover:text-[#EAB308]"
          >
            Ingredients
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 font-semibold hover:text-[#EAB308]"
          >
            Product FAQs
          </Link>
          <Link
            href="/#partner"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 font-semibold hover:text-[#EAB308]"
          >
            Contact & Partner
          </Link>
        </div>
      )}
    </header>
  );
};

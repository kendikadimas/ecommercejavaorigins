'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAFAF7] text-[#140E0A] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 bg-[#140E0A] text-white flex items-center justify-between border-b border-[#EAB308]/20">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={22} className="text-[#FACC15]" />
              <h2 className="font-serif text-xl font-bold tracking-wide">Your Shopping Cart</h2>
              <span className="text-xs bg-[#EAB308] text-[#140E0A] font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-white p-1 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#786C60]">
                  <ShoppingBag size={36} />
                </div>
                <p className="text-lg font-serif font-medium text-[#3A2B20]">Your cart is currently empty</p>
                <p className="text-xs text-[#786C60] max-w-xs mx-auto">
                  Explore Java Origins natural herbal beverages and add comfort to your day.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-[#140E0A] text-[#FACC15] font-semibold px-6 py-2.5 rounded-md hover:bg-[#EAB308] hover:text-[#140E0A] transition-colors text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex space-x-4 p-4 bg-white rounded-xl border border-[#E6E0D4] shadow-sm relative group"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#F5EFE6] flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#140E0A] line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#786C60] mt-0.5">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E6E0D4] rounded-lg bg-[#FAFAF7]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#F5EFE6] text-[#3A2B20]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#F5EFE6] text-[#3A2B20]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E6E0D4] space-y-4 shadow-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#786C60]">Subtotal</span>
                <span className="font-serif font-bold text-lg text-[#140E0A]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#786C60]">
                Taxes and shipping calculated at checkout. Free shipping included!
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center bg-[#F5EFE6] text-[#140E0A] font-semibold py-3 px-4 rounded-xl hover:bg-[#E6E0D4] transition-colors text-sm"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center bg-[#140E0A] text-[#FACC15] font-bold py-3 px-4 rounded-xl hover:bg-[#EAB308] hover:text-[#140E0A] transition-colors text-sm space-x-2 shadow-md"
                >
                  <span>Check Out</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-[#140E0A] flex flex-col shadow-2xl border-l border-zinc-100">
          {/* Header */}
          <div className="px-6 py-5 bg-white text-[#140E0A] flex items-center justify-between border-b border-zinc-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800">
                <ShoppingBag size={16} />
              </div>
              <h2 className="font-serif text-lg font-bold text-zinc-900 tracking-tight">Your Shopping Cart</h2>
              <span className="text-xs bg-[#140E0A] text-[#FACC15] font-bold px-2.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 p-1.5 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/40">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <ShoppingBag size={32} />
                </div>
                <p className="text-lg font-serif font-bold text-zinc-900">Your cart is currently empty</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Explore Java Origins natural herbal beverages and handcrafted wellness items.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-[#140E0A] text-[#FACC15] font-bold px-6 py-2.5 rounded-xl hover:bg-black transition-all text-xs uppercase tracking-wider shadow-sm"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex space-x-4 p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all group"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-100 flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-zinc-900 line-clamp-2 leading-snug">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-semibold text-zinc-500 mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50/80 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-white text-zinc-600 rounded hover:shadow-xs transition-all active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 text-xs font-bold text-zinc-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-white text-zinc-600 rounded hover:shadow-xs transition-all active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
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
            <div className="p-6 bg-white border-t border-zinc-100 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">Subtotal</span>
                <span className="font-serif font-bold text-xl text-zinc-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3 px-4 rounded-xl transition-colors text-xs uppercase tracking-wider"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center bg-[#140E0A] hover:bg-black text-[#FACC15] font-bold py-3 px-4 rounded-xl transition-all text-xs uppercase tracking-wider space-x-2 shadow-md hover:shadow-lg transform active:scale-[0.98]"
                >
                  <span>Check Out</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

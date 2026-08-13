'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  return (
    <div className="bg-white min-h-screen py-12 text-[#140E0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-zinc-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Your cart
            </h1>
            <span className="text-xs bg-[#140E0A] text-[#FACC15] font-bold px-2.5 py-1 rounded-full">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-black underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50/70 rounded-3xl border border-zinc-200/70 space-y-4 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <ShoppingBag size={32} />
            </div>
            <p className="font-serif text-2xl font-bold text-zinc-900">Your cart is empty</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">Explore Java Origins herbal drinks to start adding warmth to your cart.</p>
            <Link
              href="/shop"
              className="inline-block bg-[#140E0A] text-[#FACC15] font-bold px-8 py-3.5 rounded-xl hover:bg-black transition-all text-xs uppercase tracking-wider shadow-md"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-3">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {/* Cart Item Rows */}
            <div className="divide-y divide-zinc-100 bg-white rounded-2xl border border-zinc-200/80 px-4 sm:px-6 shadow-xs">
              {cart.map((item) => (
                <div key={item.product.id} className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Product Info */}
                  <div className="sm:col-span-6 flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-100 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link href={`/products/${item.product.id}`} className="font-serif text-base font-bold text-zinc-900 hover:text-amber-700 transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-xs font-medium text-zinc-500 mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="sm:col-span-3 flex items-center justify-start sm:justify-center space-x-3">
                    <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50/80 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white text-zinc-600 rounded transition-all active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3.5 text-xs font-bold text-zinc-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white text-zinc-600 rounded transition-all active:scale-95"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {/* Total price for item */}
                  <div className="sm:col-span-3 text-right">
                    <span className="font-serif font-bold text-base text-zinc-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* Subtotal & Checkout Actions */}
            <div className="flex flex-col items-end space-y-4 pt-4">
              <div className="text-right space-y-1">
                <div className="flex items-baseline justify-end space-x-3">
                  <span className="text-sm font-medium text-zinc-500">Estimated total:</span>
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Taxes, discounts, and shipping calculated at checkout.
                </p>
              </div>

              <div className="w-full sm:w-80 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center bg-[#140E0A] text-[#FACC15] font-extrabold py-4 px-6 rounded-xl hover:bg-black transition-all transform hover:scale-[1.01] shadow-xl text-xs uppercase tracking-wider space-x-2"
                >
                  <span>Check out</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="pt-2 text-center text-xs text-zinc-400">
                  <span>Supported payment options: Bank Transfer BCA, Mandiri, QRIS & WhatsApp</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

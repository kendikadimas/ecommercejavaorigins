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
    <div className="bg-[#FAFAF7] min-h-screen py-12 text-[#140E0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-[#E6E0D4] pb-6 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#140E0A]">
            Your cart
          </h1>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-semibold text-[#140E0A] hover:text-[#EAB308] underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E6E0D4] space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#786C60]">
              <ShoppingBag size={32} />
            </div>
            <p className="font-serif text-2xl font-bold text-[#140E0A]">Your cart is empty</p>
            <p className="text-xs text-[#786C60]">Explore Java Origins herbal drinks to start adding warmth to your cart.</p>
            <Link
              href="/shop"
              className="inline-block bg-[#140E0A] text-[#FACC15] font-bold px-8 py-3 rounded-xl hover:bg-[#EAB308] hover:text-[#140E0A] transition-colors text-sm uppercase"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-bold text-[#786C60] uppercase tracking-wider border-b border-[#E6E0D4] pb-3">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {/* Cart Item Rows */}
            <div className="divide-y divide-[#E6E0D4] bg-white rounded-2xl border border-[#E6E0D4] px-4 sm:px-6">
              {cart.map((item) => (
                <div key={item.product.id} className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Product Info */}
                  <div className="sm:col-span-6 flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E6E0D4] flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link href={`/products/${item.product.id}`} className="font-serif text-base font-bold text-[#140E0A] hover:text-[#EAB308] transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-[#786C60] mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="sm:col-span-3 flex items-center justify-start sm:justify-center space-x-3">
                    <div className="flex items-center border border-[#E6E0D4] rounded-lg bg-[#FAFAF7]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-[#F5EFE6] text-[#3A2B20]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-[#F5EFE6] text-[#3A2B20]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Total price for item */}
                  <div className="sm:col-span-3 text-right">
                    <span className="font-serif font-bold text-base text-[#140E0A]">
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
                  <span className="text-sm font-semibold text-[#786C60]">Estimated total:</span>
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#140E0A]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-[#786C60]">
                  Taxes, discounts, and shipping calculated at checkout.
                </p>
              </div>

              <div className="w-full sm:w-80 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center bg-[#140E0A] text-[#FACC15] font-extrabold py-4 px-6 rounded-xl hover:bg-[#EAB308] hover:text-[#140E0A] transition-all transform hover:scale-[1.01] shadow-xl text-sm uppercase tracking-wider space-x-2"
                >
                  <span>Check out</span>
                  <ArrowRight size={18} />
                </Link>

                <div className="pt-2 text-center text-xs text-[#786C60]">
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

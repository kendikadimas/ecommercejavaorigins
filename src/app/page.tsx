'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, CheckCircle, ArrowRight, Leaf, Flame, Zap } from 'lucide-react';
import { HeroSlider } from '@/components/HeroSlider';
import { IngredientsSection } from '@/components/IngredientsSection';
import { FAQSection } from '@/components/FAQSection';
import { PartnerBanner } from '@/components/PartnerBanner';
import { ProductType, INITIAL_PRODUCTS } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>(INITIAL_PRODUCTS);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.filter((p) => p.active));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-0">
      {/* Full-width Hero Banner Slider */}
      <HeroSlider />

      {/* Feature Ribbon */}
      <section className="bg-[#2E2016] border-y border-[#EAB308]/20 py-4 px-4 text-center text-xs sm:text-sm text-gray-300 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-[#FACC15]">🌿</span>
            <span>100% Selected Indonesian Herbs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#FACC15]">🔥</span>
            <span>Natural Warmth & Daily Comfort</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#FACC15]">⚡</span>
            <span>Fast Shipping & WA Checkout</span>
          </div>
        </div>
      </section>

      {/* ALL PRODUCTS SECTION */}
      <section className="py-16 sm:py-20 bg-[#FAFAF7] text-[#140E0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 border-b border-[#E6E0D4] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#EAB308]">
                HERBAL SELECTION
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#140E0A] mt-1">
                All Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="mt-4 sm:mt-0 font-serif text-sm font-semibold text-[#140E0A] hover:text-[#EAB308] flex items-center space-x-1 underline underline-offset-4"
            >
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E6E0D4] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square bg-[#F5EFE6] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#140E0A] text-[#FACC15] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-md">
                      {product.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 sm:p-5 space-y-2 flex-1">
                    <div className="flex items-center text-amber-500 text-xs space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="sm:w-[13px] sm:h-[13px]" fill="currentColor" />
                      ))}
                      <span className="text-gray-400 text-[10px] sm:text-[11px] ml-1">(5.0)</span>
                    </div>

                    <Link href={`/products/${product.id}`} className="block">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#140E0A] group-hover:text-[#EAB308] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-[10px] sm:text-xs text-[#786C60] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer Price & Add Button */}
                <div className="p-3 sm:p-5 pt-0 flex items-center justify-between border-t border-[#F5EFE6] mt-2 sm:mt-3">
                  <div>
                    <span className="text-[10px] sm:text-xs text-gray-400 block font-medium">Price</span>
                    <span className="font-serif text-sm sm:text-lg font-bold text-[#140E0A]">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-[#140E0A] text-[#FACC15] p-2 sm:p-3 rounded-xl hover:bg-[#EAB308] hover:text-[#140E0A] transition-colors shadow-md"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-block bg-[#140E0A] text-[#FACC15] font-bold px-10 py-3.5 rounded-full hover:bg-[#EAB308] hover:text-[#140E0A] transition-all transform hover:scale-105 shadow-xl text-sm uppercase tracking-wider"
            >
              View All Catalog ({products.length} Items)
            </Link>
          </div>
        </div>
      </section>

      {/* "WHAT IS JAVA ORIGINS?" BANNER SECTION */}
      <section className="py-20 bg-[#140E0A] text-white relative border-y border-[#EAB308]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2E2016] border border-[#EAB308]/30 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="bg-[#FACC15] text-[#140E0A] font-bold text-xs uppercase px-3 py-1 rounded">
                  HERITAGE STORY
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
                  Java <span className="text-[#FACC15]">Drink</span>
                </h2>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
                  Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine. We combine centuries-old Javanese herbal tradition with modern quality standards.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#FACC15] pt-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} /> <span>100% Natural Herbs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} /> <span>Daily Immunity Boost</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} /> <span>No Preservatives</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} /> <span>Authentic Taste</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/shop"
                    className="inline-block bg-[#FACC15] text-[#140E0A] font-extrabold px-8 py-3.5 rounded-full hover:bg-[#EAB308] transition-colors text-sm uppercase tracking-wider shadow-lg"
                  >
                    Learn More & Shop
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-[#FACC15]/20 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80"
                    alt="Java Origins Drink Showcase"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140E0A]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 bg-[#140E0A]/90 backdrop-blur-md p-4 rounded-xl border border-[#FACC15]/30">
                    <p className="font-serif text-sm font-bold text-[#FACC15]">Crafted for Warmth & Goodness</p>
                    <p className="text-xs text-gray-300">Formulated with Indonesian Red Ginger, Turmeric & Forest Honey.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <IngredientsSection />

      {/* FAQ Accordion Section */}
      <FAQSection />

      {/* Partner Banner Section */}
      <PartnerBanner />
    </div>
  );
}

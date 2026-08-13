'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { HeroSlider } from '@/components/HeroSlider';
import { IngredientsSection } from '@/components/IngredientsSection';
import { FAQSection } from '@/components/FAQSection';
import { PartnerBanner } from '@/components/PartnerBanner';
import { CornerLeaf } from '@/components/CornerLeaf';
import { ProductType, INITIAL_PRODUCTS } from '@/lib/seed-data';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { FetchErrorBanner } from '@/components/FetchErrorBanner';

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>(INITIAL_PRODUCTS);
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [fetchError, setFetchError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.filter((p) => p.active));
        }
      })
      .catch(() => setFetchError('Failed to load products dari server. Data sementara ditampilkan.'));
    fetch('/api/product-ratings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setRatings(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-0">
      {/* Full-width Hero Banner Slider */}
      <HeroSlider />

      {fetchError && <FetchErrorBanner message={fetchError} />}

      {/* ALL PRODUCTS SECTION */}
      <section className="bg-white text-[#140E0A] py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 border-b border-[#CBE0B4] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#499A13]">
                HERBAL SELECTION
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#140E0A] mt-1">
                All Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="mt-4 sm:mt-0 font-serif text-sm font-semibold text-[#140E0A] hover:text-[#276F27] flex items-center space-x-1 underline underline-offset-4"
            >
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="relative block bg-white rounded-2xl border border-[#CBE0B4] overflow-hidden shadow-sm hover:shadow-md hover:border-[#499A13] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-3 sm:p-5 space-y-2 flex-1">
                    {ratings[product.id] ? (
                      <div className="flex items-center text-amber-500 text-xs space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={`sm:w-[13px] sm:h-[13px] ${
                              i < Math.round(ratings[product.id].average) ? '' : 'opacity-25'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                        <span className="text-gray-400 text-[10px] sm:text-[11px] ml-1">
                          ({ratings[product.id].average.toFixed(1)})
                        </span>
                      </div>
                    ) : null}

                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#140E0A] group-hover:text-[#276F27] transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-[10px] sm:text-xs text-[#5A7543] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer Price & Add Button */}
                <div className="p-3 sm:p-5 pt-0 flex items-center justify-between border-t border-[#EAF3DB] mt-2 sm:mt-3">
                  <div>
                    <span className="text-[10px] sm:text-xs text-gray-400 block font-medium">Price</span>
                    <span className="font-serif text-sm sm:text-lg font-bold text-[#140E0A]">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="bg-[#140E0A] text-[#FACC15] p-2 sm:p-3 rounded-xl hover:bg-[#EAB308] hover:text-[#140E0A] transition-colors shadow-md"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </Link>
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
      <section className="py-12 sm:py-16 bg-[#276F27] text-white relative border-y border-[#1F5A1F] overflow-hidden">
        <CornerLeaf
          src="/elements/leaf-palm-frond-pair-pointing-topleft-corner.png"
          className="absolute top-0 right-0"
          size={240}
          opacity={0.35}
        />
        <CornerLeaf
          src="/elements/leaf-watercolor-branch-diagonal-bottomleft-to-topright.png"
          className="absolute bottom-0 left-0"
          size={320}
          opacity={0.3}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 border border-[#CBE0B4] rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-4">
                <span className="bg-[#499A13] text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded">
                  HERITAGE STORY
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#276F27] tracking-tight uppercase">
                  Java <span className="text-[#499A13]">Drink</span>
                </h2>

                <p className="text-xs sm:text-sm text-[#44663A] leading-relaxed font-light">
                  Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine. We combine centuries-old Javanese herbal tradition with modern quality standards.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs font-semibold text-[#499A13]">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={14} /> <span>100% Natural Herbs</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={14} /> <span>Daily Immunity Boost</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={14} /> <span>No Preservatives</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={14} /> <span>Authentic Taste</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href="/shop"
                    className="inline-block bg-[#276F27] text-white font-extrabold px-6 py-2.5 rounded-full hover:bg-[#499A13] transition-colors text-xs uppercase tracking-wider shadow-lg"
                  >
                    Learn More & Shop
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-[#CBE0B4] shadow-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80"
                    alt="Java Origins Drink Showcase"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#CBE0B4]">
                    <p className="font-serif text-xs sm:text-sm font-bold text-[#276F27]">Crafted for Warmth & Goodness</p>
                    <p className="text-[10px] sm:text-xs text-[#5A7543]">Formulated with Indonesian Red Ginger, Turmeric & Forest Honey.</p>
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

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Search, Filter } from 'lucide-react';
import { ProductType, INITIAL_PRODUCTS } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function ShopPage() {
  const [products, setProducts] = useState<ProductType[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
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

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#FAFAF7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#E6E0D4] pb-8 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EAB308]">
            CATALOG SHOP
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#140E0A] mt-1">
            Shop All Java Origins Products
          </h1>
          <p className="text-sm text-[#786C60] mt-2 max-w-2xl">
            Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-sm">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFE6] border border-[#E6E0D4] rounded-xl text-sm focus:outline-none focus:border-[#EAB308]"
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-[#786C60] flex items-center mr-1">
              <Filter size={14} className="mr-1" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#140E0A] text-[#FACC15] shadow-md'
                    : 'bg-[#F5EFE6] text-[#3A2B20] hover:bg-[#E6E0D4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E6E0D4]">
            <p className="font-serif text-xl font-bold text-[#140E0A]">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try matching another search keyword or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
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
                    <div className="absolute top-3 left-3 bg-[#140E0A] text-[#FACC15] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
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
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Star, Search, Filter } from 'lucide-react';
import { ProductType, INITIAL_PRODUCTS } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

function ShopInner() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');

  const [products, setProducts] = useState<ProductType[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { addToCart } = useCart();

  useEffect(() => {
    if (catParam) {
      if (catParam.toLowerCase().includes('beverage') || catParam.toLowerCase().includes('drink')) {
        setSelectedCategory('Herbal Drink');
      } else if (catParam.toLowerCase().includes('food') || catParam.toLowerCase().includes('snack')) {
        setSelectedCategory('Food & Snacks');
      } else if (catParam.toLowerCase().includes('care')) {
        setSelectedCategory('Herbal Care');
      } else if (catParam.toLowerCase().includes('fashion')) {
        setSelectedCategory('Fashion');
      } else {
        setSelectedCategory(catParam);
      }
    }
  }, [catParam]);

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

  const dbCategories = Array.from(new Set(products.map((p) => p.category)));
  const allCategories = ['ALL', 'Herbal Drink', 'Food & Snacks', 'Herbal Care', 'Fashion'];
  dbCategories.forEach((cat) => {
    const isMapped =
      cat === 'Herbal Beverage' ||
      cat === 'Herbal Drink' ||
      cat === 'Food & Snacks' ||
      cat === 'Food and Snacks' ||
      cat === 'Herbal Care' ||
      cat === 'Fashion';
    if (!isMapped && !allCategories.includes(cat)) {
      allCategories.push(cat);
    }
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      p.category === selectedCategory ||
      p.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Herbal Drink' &&
        (p.category === 'Herbal Beverage' || p.category === 'Herbal Drink' || p.category === 'Herbal Drinks')) ||
      (selectedCategory === 'Food & Snacks' &&
        (p.category.includes('Food') || p.category.includes('Snack'))) ||
      (selectedCategory === 'Herbal Care' && p.category.toLowerCase().includes('care')) ||
      (selectedCategory === 'Fashion' && p.category.toLowerCase().includes('fashion'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#FAFAF7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#E6E0D4] pb-8 mb-8 text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#EAB308]">
            CATALOG SHOP
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#140E0A] mt-1 tracking-tight">
            Shop All Java Origins Products
          </h1>
          <p className="text-sm text-[#5A4D41] mt-3 max-w-3xl leading-relaxed">
            Java Origins is an e-commerce platform that connects authentic Indonesian offerings with New Zealand market, including herbal drinks, MSME food and snacks, herbal care, fashion, and handicrafts.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white p-3 sm:p-4 rounded-3xl border border-[#E6E0D4] shadow-xs">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFE6] border border-transparent rounded-2xl text-sm text-[#140E0A] placeholder-gray-400 focus:outline-none focus:border-[#EAB308] transition-all"
            />
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-[#786C60] flex items-center mr-1.5 flex-shrink-0">
              <Filter size={15} className="mr-1 text-[#786C60]" /> Category:
            </span>
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#140E0A] text-white font-bold shadow-md'
                      : 'bg-[#FAF3EE] text-[#9A3B26] hover:bg-[#F5E6DC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E6E0D4]">
            <p className="font-serif text-xl font-bold text-[#140E0A]">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try matching another search keyword or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E6E0D4] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7] p-12 text-center text-gray-400">Loading catalog...</div>}>
      <ShopInner />
    </Suspense>
  );
}

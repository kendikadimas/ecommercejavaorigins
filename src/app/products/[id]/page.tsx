'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Leaf } from 'lucide-react';
import { ProductType, INITIAL_PRODUCTS } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductType | null>(null);
  const [allProducts, setAllProducts] = useState<ProductType[]>(INITIAL_PRODUCTS);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
          const found = data.find((p: ProductType) => p.id === id || p.slug === id);
          if (found) setProduct(found);
        }
      })
      .catch(() => {});

    const initialMatch = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (initialMatch && !product) {
      setProduct(initialMatch);
    }
  }, [id]);

  if (!product) {
    const fallback = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id) || INITIAL_PRODUCTS[0];
    return (
      <div className="bg-[#FAFAF7] min-h-screen py-16 text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#E6E0D4]">
          <h2 className="font-serif text-2xl font-bold">Loading Java Origins Product...</h2>
          <p className="text-sm text-gray-500 mt-2">Preparing authentic Indonesian herbal beverage details.</p>
          <Link
            href="/shop"
            className="inline-block mt-4 bg-[#140E0A] text-[#FACC15] font-bold px-6 py-2 rounded-xl text-sm"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="bg-[#FAFAF7] py-10 sm:py-16 text-[#140E0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-[#786C60] mb-8 space-x-2">
          <Link href="/" className="hover:text-[#EAB308]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#EAB308]">Shop All</Link>
          <span>/</span>
          <span className="font-semibold text-[#140E0A]">{product.name}</span>
        </nav>

        {/* Top Product Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Product Showcase Images */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E6E0D4] shadow-md">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              <span className="absolute top-4 left-4 bg-[#140E0A] text-[#FACC15] text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                {product.category}
              </span>
            </div>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white border-2 border-[#EAB308] cursor-pointer">
                <Image src={product.image} alt="Thumbnail 1" fill className="object-cover" />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E6E0D4] opacity-80 hover:opacity-100 cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80"
                  alt="Thumbnail 2"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E6E0D4] opacity-80 hover:opacity-100 cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80"
                  alt="Thumbnail 3"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E6E0D4] opacity-80 hover:opacity-100 cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=400&q=80"
                  alt="Thumbnail 4"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Buying Flow */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs text-[#786C60] font-bold uppercase tracking-widest">
                JAVA ORIGINS HERBAL BEVERAGE
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#140E0A] mt-1">
                {product.name}
              </h1>
              
              {/* Reviews Summary */}
              <div className="flex items-center space-x-2 mt-3 text-sm">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="font-bold text-[#140E0A]">5.0</span>
                <span className="text-gray-400">• 12 Customer Reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-y border-[#E6E0D4] py-4">
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-3xl font-extrabold text-[#140E0A]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-gray-500 font-medium">Free Shipping Included</span>
              </div>
            </div>

            {/* Quantity Picker & Add / Buy Buttons */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2B20]">
                Quantity
              </label>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-[#E6E0D4] rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#F5EFE6] rounded-lg transition-colors text-[#140E0A]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 font-bold text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-[#F5EFE6] rounded-lg transition-colors text-[#140E0A]"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  ✓ In Stock ({product.stock} items available)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="w-full bg-white text-[#140E0A] font-bold py-3.5 px-6 rounded-xl border-2 border-[#140E0A] hover:bg-[#F5EFE6] transition-colors flex items-center justify-center space-x-2 text-sm shadow-sm"
                >
                  <ShoppingBag size={18} />
                  <span>Add to cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#140E0A] text-[#FACC15] font-extrabold py-3.5 px-6 rounded-xl hover:bg-[#EAB308] hover:text-[#140E0A] transition-all transform hover:scale-[1.02] shadow-xl text-sm uppercase tracking-wider"
                >
                  Buy with Shop / Checkout
                </button>
              </div>
            </div>

            {/* Product Value Badges */}
            <div className="bg-white p-4 rounded-xl border border-[#E6E0D4] space-y-2 text-xs text-[#3A2B20]">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-[#EAB308]" />
                <span>Orders dispatched within 24 hours nationwide.</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#EAB308]" />
                <span>Prepared in HACCP & ISO certified traditional facility.</span>
              </div>
            </div>

            {/* Description & Ingredients */}
            <div className="space-y-4 pt-4 border-t border-[#E6E0D4]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#140E0A]">Product Description</h3>
                <p className="text-sm text-[#3A2B20] mt-2 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {product.ingredients && (
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#140E0A]">Ingredients & Formulation</h4>
                  <p className="text-xs text-[#786C60] mt-1 bg-[#F5EFE6] p-3 rounded-lg border border-[#E6E0D4] flex items-center space-x-1.5">
                    <Leaf size={14} className="text-[#EAB308] flex-shrink-0" />
                    <span>{product.ingredients}</span>
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* You May Also Like Recommendations */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-[#E6E0D4] pt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#140E0A] mb-8">
              You may also like
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-xl border border-[#E6E0D4] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-square bg-[#F5EFE6]">
                    <Image src={rel.image} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 space-y-1">
                    <Link href={`/products/${rel.id}`} className="block">
                      <h4 className="font-serif text-sm font-bold text-[#140E0A] hover:text-[#EAB308] transition-colors line-clamp-1">
                        {rel.name}
                      </h4>
                    </Link>
                    <p className="font-serif text-xs font-bold text-[#140E0A]">
                      {formatPrice(rel.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

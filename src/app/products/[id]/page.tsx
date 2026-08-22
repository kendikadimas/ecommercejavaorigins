'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Leaf } from 'lucide-react';
import { ProductType, INITIAL_PRODUCTS } from '@/lib/seed-data';
import type { ReviewType } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { PageSpinner } from '@/components/PageSpinner';
import { FetchErrorBanner } from '@/components/FetchErrorBanner';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useCustomerAuth();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [allProducts, setAllProducts] = useState<ProductType[]>(INITIAL_PRODUCTS);
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myReview, setMyReview] = useState<ReviewType | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [fetchError, setFetchError] = useState('');
  const { addToCart } = useCart();

  const loadReviews = () => {
    fetch(`/api/reviews?productId=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setReviews(data.reviews || []);
          setReviewAvg(data.average || 0);
          setReviewCount(data.count || 0);
          if (user) {
            const mine = (data.reviews || []).find(
              (r: ReviewType) => r.userId === user.id
            );
            setMyReview(mine || null);
            if (mine) {
              setReviewRating(mine.rating);
              setReviewComment(mine.comment || '');
            }
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
          const found = data.find((p: ProductType) => p.id === id || p.slug === id);
          if (found) {
            setProduct(found);
          }
        }
      })
      .catch(() => setFetchError('Failed to load products dari server. Data sementara ditampilkan.'));

    const initialMatch = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (initialMatch && !product) {
      setProduct(initialMatch);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadReviews();
  }, [id, user]);

  if (!product) {
    const fallback = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id) || INITIAL_PRODUCTS[0];
    return (
      <div className="bg-white min-h-screen py-20 text-center">
        <PageSpinner label="Loading Product ..." />
      </div>
    );
  }

  const mainImage = product.image;

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, quantity, false); // no drawer — straight to login/checkout
    if (user) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/checkout');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg('');
    if (!user) {
      setReviewMsg('Login is required to submit a review.');
      return;
    }
    if (!product) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save review');
      setReviewMsg('Review saved successfully.');
      loadReviews();
    } catch (err: any) {
      setReviewMsg(err.message || 'Something went wrong.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete your review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyReview(null);
        setReviewRating(5);
        setReviewComment('');
        loadReviews();
      } else {
        alert('Failed to delete review.');
      }
    } catch {
      alert('Something went wrong while deleting the review.');
    }
  };

  return (
    <div className="bg-white py-10 sm:py-16 text-[#140E0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {fetchError && <FetchErrorBanner message={fetchError} />}

        {/* Breadcrumb */}
        <nav className="text-xs text-[#5A7543] mb-8 space-x-2">
          <Link href="/" className="hover:text-[#276F27]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#276F27]">Shop All</Link>
          <span>/</span>
          <span className="font-semibold text-[#140E0A]">{product.name}</span>
        </nav>

        {/* Top Product Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Product Showcase Images */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E0E0E0] shadow-md">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              <span className="absolute top-4 left-4 bg-[#140E0A] text-[#FACC15] text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                {product.category}
              </span>
            </div>


          </div>

          {/* Right Column: Pricing & Buying Flow */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs text-[#5A7543] font-bold uppercase tracking-widest">
                JAVA ORIGINS HERBAL BEVERAGE
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#140E0A] mt-1">
                {product.name}
              </h1>
              
              {/* Reviews Summary */}
              <div className="flex items-center space-x-2 mt-3 text-sm">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(reviewAvg) ? '' : 'opacity-25'}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="font-bold text-[#140E0A]">{reviewAvg.toFixed(1)}</span>
                <span className="text-gray-400">• {reviewCount} Review{reviewCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-y border-[#E0E0E0] py-4">
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-3xl font-extrabold text-[#140E0A]">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Quantity Picker & Add / Buy Buttons */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#22491F]">
                Quantity
              </label>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-[#E0E0E0] rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#F3F3F3] rounded-lg transition-colors text-[#140E0A]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 font-bold text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-[#F3F3F3] rounded-lg transition-colors text-[#140E0A]"
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
                  className="w-full bg-white text-[#140E0A] font-bold py-3.5 px-6 rounded-xl border-2 border-[#140E0A] hover:bg-[#F3F3F3] transition-colors flex items-center justify-center space-x-2 text-sm shadow-sm"
                >
                  <ShoppingBag size={18} />
                  <span>Add to cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#140E0A] text-[#FACC15] font-extrabold py-3.5 px-6 rounded-xl hover:bg-[#276F27] hover:text-white hover:text-[#140E0A] transition-all transform hover:scale-[1.02] shadow-xl text-sm uppercase tracking-wider"
                >
                  Buy with Shop / Checkout
                </button>
              </div>
            </div>

            {/* Product Value Badges */}
            <div className="bg-[#F7F7F7] p-4 rounded-xl border border-[#E0E0E0] space-y-2 text-xs text-[#22491F]">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-[#499A13]" />
                <span>Orders dispatched within 24 hours nationwide.</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#499A13]" />
                <span>Prepared in HACCP & ISO certified traditional facility.</span>
              </div>
            </div>

            {/* Description & Ingredients */}
            <div className="space-y-4 pt-4 border-t border-[#E0E0E0]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#140E0A]">Product Description</h3>
                <p className="text-sm text-[#22491F] mt-2 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {product.ingredients && (
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#140E0A]">Ingredients & Formulation</h4>
                  <p className="text-xs text-[#5A7543] mt-1 bg-[#F7F7F7] p-3 rounded-lg border border-[#E0E0E0] flex items-center space-x-1.5">
                    <Leaf size={14} className="text-[#499A13] flex-shrink-0" />
                    <span>{product.ingredients}</span>
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Customer Reviews */}
        <div className="mt-16 border-t border-[#E0E0E0] pt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#140E0A]">
                Customer Reviews
              </h2>
              <p className="text-xs text-[#5A7543] mt-1">
                {reviewCount === 0
                  ? 'No reviews for this product yet.'
                  : `Average ${reviewAvg.toFixed(1)} from ${reviewCount} review${reviewCount !== 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>

          {user && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-2xl p-5 sm:p-6 space-y-4 mb-8"
            >
              <h3 className="font-serif text-sm font-bold text-[#140E0A]">
                {myReview ? 'Update Your Review' : 'Write a Review'}
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#22491F] mb-1.5">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className="p-0.5"
                      aria-label={`${n} star`}
                    >
                      <Star
                        size={26}
                        className={n <= reviewRating ? 'text-amber-500' : 'text-gray-300'}
                        fill="currentColor"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#22491F] mb-1.5">
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] bg-white text-sm text-[#140E0A] focus:outline-none focus:border-[#499A13] font-normal"
                />
              </div>

              {reviewMsg && (
                <p className="text-xs font-semibold text-[#276F27]">{reviewMsg}</p>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#276F27] hover:bg-[#499A13] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow"
              >
                {myReview ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          )}

          {!user && (
            <p className="text-xs text-[#5A7543] mb-8">
              <Link href={`/login?redirect=/products/${product.id}`} className="font-bold text-[#276F27] hover:underline">
                Login
              </Link>{' '}
              to write a review.
            </p>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border border-[#E0E0E0] rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#276F27] text-white flex items-center justify-center font-extrabold text-sm">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#140E0A]">{r.userName}</p>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < r.rating ? '' : 'opacity-25'}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {user && r.userId === user.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-[#22491F] leading-relaxed mt-3">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* You May Also Like Recommendations */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-[#E0E0E0] pt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#140E0A] mb-8">
              You may also like
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-square bg-[#F7F7F7]">
                    <Image src={rel.image} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 space-y-1">
                    <Link href={`/products/${rel.id}`} className="block">
                      <h4 className="font-serif text-sm font-bold text-[#140E0A] hover:text-[#276F27] transition-colors line-clamp-1">
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

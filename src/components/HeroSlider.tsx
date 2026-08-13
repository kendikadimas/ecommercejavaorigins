'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { BannerType, INITIAL_BANNERS } from '@/lib/seed-data';

export const HeroSlider = () => {
  const [banners, setBanners] = useState<BannerType[]>(INITIAL_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch & Drag Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    fetch(`/api/banners?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeBanners = data.filter((b: BannerType) => b.active);
          if (activeBanners.length > 0) {
            setBanners(activeBanners);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto slide interval every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Mouse Drag Handlers for Desktop Swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setTouchStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setTouchEndX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleTouchEnd();
  };

  const currentBanner = banners[currentIndex] || INITIAL_BANNERS[0];

  return (
    <section
      className="relative w-full bg-white overflow-hidden border-b border-[#CBE0B4] select-none cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Full-width Banner Container */}
      <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] transition-all duration-700">
        
        {/* Banner Background Image */}
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          draggable={false}
          className="w-full h-full object-cover transition-opacity duration-700 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1600&q=80';
          }}
        />

        {/* Hero Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center text-center p-6 sm:p-12 pointer-events-none">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 text-white pointer-events-auto">
            
            {currentBanner.title && (
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight uppercase drop-shadow-md">
                {currentBanner.title}
              </h1>
            )}

            {currentBanner.subtitle && (
              <p className="text-sm sm:text-lg text-gray-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow">
                {currentBanner.subtitle}
              </p>
            )}

            <div className="pt-2">
              <Link
                href={currentBanner.linkUrl || '/shop'}
                className="inline-flex items-center space-x-2 bg-[#FACC15] text-[#140E0A] font-extrabold px-8 py-3.5 rounded-full hover:bg-[#EAB308] transition-all transform hover:scale-105 shadow-2xl text-xs sm:text-sm uppercase tracking-wider"
              >
                <span>Shop the Collection</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>

        {/* Left & Right Slide Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#140E0A]/70 text-white hover:bg-[#FACC15] hover:text-[#140E0A] transition-all backdrop-blur-md border border-white/20 shadow-xl transform hover:scale-110 z-20"
              aria-label="Previous Banner"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#140E0A]/70 text-white hover:bg-[#FACC15] hover:text-[#140E0A] transition-all backdrop-blur-md border border-white/20 shadow-xl transform hover:scale-110 z-20"
              aria-label="Next Banner"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Bottom Slide Indicator Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-[#FACC15]' : 'w-2.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

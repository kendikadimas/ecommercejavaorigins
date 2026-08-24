'use client';

import React from 'react';
import Image from 'next/image';
import { CornerLeaf } from '@/components/CornerLeaf';

const INGREDIENTS = [
  {
    name: 'Ginger',
    sub: 'Red Ginger',
    desc: 'Warming red ginger rhizome that improves circulation and relieves fatigue.',
    image: 'https://i.pinimg.com/736x/c8/66/fe/c866fea62dc79e797b82cc6de3969a0f.jpg',
  },
  {
    name: 'Turmeric',
    sub: 'Pure Turmeric',
    desc: 'Packed with curcumin antioxidants for digestive comfort and joint health.',
    image: 'https://i.pinimg.com/1200x/2c/58/c2/2c58c292ddcc6e075105f058ba11cd01.jpg',
  },
  {
    name: 'Lemongrass',
    sub: 'Fragrant Lemongrass',
    desc: 'Aromatic Indonesian lemongrass for calming citrus notes and digestive ease.',
    image: 'https://i.pinimg.com/1200x/58/3b/3e/583b3e555072c258aee6ae902677faa2.jpg',
  },
  {
    name: 'Lime',
    sub: 'Fresh Lime',
    desc: 'Fresh tropical lime rich in Vitamin C to boost natural immune defense.',
    image: 'https://i.pinimg.com/736x/b7/13/04/b71304558fae51d4535af934c944bd1f.jpg',
  },
  {
    name: 'Palm Sugar',
    sub: 'Arenga Sugar',
    desc: 'Organic unrefined coconut palm sugar providing smooth caramel warmth.',
    image: 'https://i.pinimg.com/1200x/10/3d/7f/103d7f11e1c473ebefe14c815abe79cd.jpg',
  },
  {
    name: 'Honey',
    sub: 'Forest Honey',
    desc: 'Raw Indonesian forest honey to soothe throats and infuse natural sweetness.',
    image: 'https://i.pinimg.com/736x/54/b9/be/54b9be0ebb3e2c85079eeeb574da2d88.jpg',
  },
];

export const IngredientsSection = () => {
  return (
    <section id="ingredients" className="py-20 bg-[#276F27] text-white relative overflow-hidden">
      <CornerLeaf
        src="/leaf-monstera-palm-cluster-fan-upward.png.png"
        className="absolute bottom-0 left-0 right-20"
        size={400}
        opacity={0.35}
      />
      <CornerLeaf
        src="/leaf-monstera-palm-cluster-fan-upward.png.png"
        className="absolute top-0 right-0"
        size={400}
        opacity={0.3}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-left mb-12">
          <span className="inline-block bg-[#499A13] text-white font-bold text-[11px] uppercase tracking-widest px-3 py-1 rounded">
            THE ESSENCE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Ingredients <span className="text-[#A8E06A]">Java Drink</span>
          </h2>
          <p className="text-green-100 text-sm sm:text-base mt-2 max-w-xl">
            Some of the natural, functional ingredients inside every bottle of Java Drink, sourced directly from Javanese herbal artisans.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {INGREDIENTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#CBE0B4] rounded-2xl p-4 flex flex-col items-center text-center hover:border-[#499A13] transition-all transform hover:-translate-y-1 shadow-lg group"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden mb-3 bg-[#F5F5F5] border border-[#E0E0E0]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-base font-bold text-[#276F27] group-hover:text-[#499A13] transition-colors">
                {item.name}
              </h3>
              <span className="bg-[#276F27] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded mt-1">
                {item.sub}
              </span>
              <p className="text-xs text-[#5A7543] mt-2 line-clamp-3 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

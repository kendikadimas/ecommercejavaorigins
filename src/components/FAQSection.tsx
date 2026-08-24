'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { CornerLeaf } from '@/components/CornerLeaf';

const FAQS = [
  {
    q: 'What is Java Drink?',
    a: 'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine.',
  },
  {
    q: 'What Are The Health Benefits of Java Drink?',
    a: 'Java Drink helps soothe everyday body fatigue, boosts immunity with natural curcumin and red ginger antioxidants, relieves throat discomfort, and promotes healthy digestion.',
  },
  {
    q: 'Where Can I Purchase Java Drink?',
    a: 'You can order directly from this official Java Origins e-commerce web platform! We support standard online payment with proof upload verification or direct WhatsApp checkout.',
  },
  {
    q: 'Can I Drink Java Drink Every Day?',
    a: 'Yes, absolutely! All Java Origins products are brewed from 100% authentic natural herbs, wild forest honey, and organic palm sugar without artificial preservatives.',
  },
];

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-white text-[#140E0A] border-t border-[#CBE0B4] relative overflow-hidden">
      <CornerLeaf
        src="/leaf-palm-frond-pair-pointing-topleft-corner.png"
        className="absolute top-0 right-0"
        size={300}
        opacity={0.22}
      />
      <CornerLeaf
        src="/leaf-watercolor-branch-thin-diagonal-bottomleft-to-topright.png"
        className="absolute bottom-0 left-0"
        size={500}
        opacity={0.3}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#5A7543] mt-2">
            Everything you need to know about Java Origins beverages and ordering.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`overflow-hidden transition-all shadow-sm border ${
                  isOpen ? 'bg-white border-[#499A13]' : 'bg-[#276F27] border-[#276F27]'
                }`}
                style={{ borderRadius: '0.75rem' }}
              >
                <button
                  onClick={() => toggle(idx)}
                  className={`w-full px-6 py-4 flex items-center justify-between text-left font-serif text-base sm:text-lg font-semibold transition-colors ${
                    isOpen ? 'text-[#276F27] hover:text-[#499A13]' : 'text-white hover:text-[#A8E06A]'
                  }`}
                >
                  <span>{faq.q}</span>
                  <span
                    className={`p-1 rounded-full flex-shrink-0 ml-4 ${
                      isOpen ? 'bg-[#276F27] text-white' : 'bg-white/20 text-white'
                    }`}
                  >
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-[#22491F] leading-relaxed border-t border-[#CBE0B4] pt-4 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

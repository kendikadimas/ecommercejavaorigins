'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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
    <section id="faq" className="py-20 bg-[#FAFAF7] text-[#140E0A] border-t border-[#E6E0D4]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#786C60] mt-2">
            Everything you need to know about Java Origins beverages and ordering.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E6E0D4] rounded-xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-serif text-base sm:text-lg font-semibold text-[#140E0A] hover:text-[#EAB308] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="p-1 rounded-full bg-[#F5EFE6] text-[#140E0A] ml-4 flex-shrink-0">
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-[#3A2B20] leading-relaxed border-t border-[#F5EFE6] pt-4 bg-[#FDFBF7]">
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

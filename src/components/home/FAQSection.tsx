'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';

const faqData = [
  {
    question: "Are the lectures in Hindi or English?",
    answer: "Both. Our content is explained in Hinglish — primarily Hindi with English technical terms — so students from all backgrounds can follow along comfortably. If you've struggled with full-English courses before, you'll love how this feels."
  },
  {
    question: "My university isn't available yet. What do I do?",
    answer: "We are rapidly expanding! You can request your university through the form in the 'Engineering Courses' section, and we'll prioritize it based on demand."
  },
  {
    question: "Is the content really mapped to my exact syllabus?",
    answer: "Yes. Unlike generic platforms, Edvara content is curated specifically for your university's curriculum, ensuring you only study what's relevant for your exams."
  },
  {
    question: "Is Edvara free or paid?",
    answer: "We offer a mix of free and premium content. You can access many foundational subjects for free, while specialized exam-prep modules are part of our premium tier."
  }
];

export default function FAQSection() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Theme Constants
  const themeBg = isCoding ? 'bg-[#161616]' : 'bg-neutral-100';
  const cardBg = isCoding ? 'bg-stone-950' : 'bg-white';
  const textMain = isCoding ? 'text-white' : 'text-black';
  const textQuestion = isCoding ? 'text-white' : 'text-neutral-950';
  const textAnswer = isCoding ? 'text-white/70' : 'text-gray-600';
  const iconLineColor = isCoding ? 'outline-stone-950' : 'bg-white';

  return (
    <section className={`w-full ${themeBg} flex flex-col items-center overflow-hidden transition-colors duration-500`}>
      <div className="w-full max-w-[1440px] px-5 md:px-20 py-14 md:py-24 flex flex-col justify-center items-center gap-10 md:gap-14">
        
        {/* Header */}
        <div className="self-stretch flex flex-col justify-center items-center gap-1">
          <div className="text-center text-[#FE6100] text-xl md:text-4xl font-normal font-['Libre_Baskerville'] italic leading-6 md:leading-[48px]">
            Frequently
          </div>
          <div className={`text-center ${textMain} text-2xl md:text-5xl font-medium font-['Helvena'] leading-8 md:leading-[57.60px]`}>
            Asked Question
          </div>
        </div>

        {/* Questions List */}
        <div className="w-full max-w-[1000px] flex flex-col justify-start items-start gap-5 md:gap-6">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index}
                className={`w-full p-3 md:p-6 ${cardBg} rounded-xl md:rounded-2xl transition-all duration-500 border border-transparent ${
                  isOpen 
                  ? 'shadow-[0px_5px_10px_0px_rgba(0,0,0,0.10),0px_18px_18px_0px_rgba(0,0,0,0.09),0px_42px_25px_0px_rgba(0,0,0,0.05),0px_74px_30px_0px_rgba(0,0,0,0.01)]' 
                  : isCoding 
                    ? 'border-b border-stone-950/20' 
                    : 'hover:border-gray-200 border-b md:border-transparent border-gray-300'
                }`}
              >
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center gap-4 md:gap-5 text-left"
                >
                  <span className={`flex-1 ${textQuestion} text-base md:text-xl font-medium font-['Helvena'] leading-6 md:leading-8`}>
                    {item.question}
                  </span>
                  
                  {/* Animated Plus/Minus Box */}
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-[#FE6100] rounded flex items-center justify-center shrink-0 relative">
                    {/* Horizontal Bar */}
                    <div className={`w-3 md:w-4 h-[1.5px] rounded-full ${isCoding ? `outline outline-[1.25px] outline-offset-[-0.63px] ${iconLineColor}` : 'bg-white'}`} />
                    {/* Vertical Bar (Rotates and fades to create Minus) */}
                    <motion.div 
                      initial={false}
                      animate={{ 
                        rotate: isOpen ? 90 : 0,
                        opacity: isOpen ? 0 : 1 
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`w-[1.5px] h-3 md:h-4 rounded-full absolute ${isCoding ? `outline outline-[1.25px] outline-offset-[-0.63px] ${iconLineColor}` : 'bg-white'}`}
                    />
                  </div>
                </button>

                {/* Animated Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <div className={`pt-3 md:pt-4 ${textAnswer} text-sm md:text-lg font-normal font-['Helvena'] leading-5 md:leading-7 max-w-[95%]`}>
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
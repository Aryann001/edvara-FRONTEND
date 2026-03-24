'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';

export default function Loading() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  return (
    <div className={`fixed inset-0 z-[2147483647] flex justify-center items-center ${
      isCoding ? 'bg-[#161616]' : 'bg-neutral-50'
    }`}>
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative w-28 md:w-36"
        >
          <img 
            src="/logo.svg" 
            alt="Edvara Logo" 
            className={`w-full h-auto object-contain transition-all duration-500 ${
              isCoding ? 'invert brightness-0' : ''
            }`} 
          />
        </motion.div>
        <div className={`w-32 h-1 rounded-full overflow-hidden relative ${isCoding ? 'bg-white/10' : 'bg-gray-200'}`}>
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/2 bg-[#FE6100] rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
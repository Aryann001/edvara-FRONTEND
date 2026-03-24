'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';

export default function Template({ children }: { children: React.ReactNode }) {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  return (
    <>
      {/* 1. THE SWEEP OVERLAY: 
        This sits on top of everything (including Navbar) and slides up. 
        It does NOT wrap the children, so it can't trap the z-index.
      */}
      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-0 z-[2147483647] pointer-events-none ${
          isCoding ? 'bg-[#161616]' : 'bg-neutral-50'
        }`} 
      />

      {/* 2. THE CONTENT: 
        Renders normally, allowing the 404 page's "fixed inset-0" to work perfectly.
      */}
      <div className="w-full flex flex-col">
        {children}
      </div>
    </>
  );
}
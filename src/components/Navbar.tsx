'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- Added for dynamic active links
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; 
import { toggleDomain } from '@/store/slices/appSlice';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname(); // Get the current route
  
  // Read state from Redux
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const isAuthenticated = useAppSelector((state) => state.app.isAuthenticated);

  // Dynamic color assignments based on domain
  const bgColor = isCoding ? 'bg-[#161616]' : 'bg-[#EAEDEF]';
  const textColor = isCoding ? 'text-gray-200' : 'text-stone-900';
  
  // Perfect Glassmorphism Effect
  const glassmorphismBg = isCoding 
    ? 'bg-zinc-900/40 backdrop-blur-xl border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' // Dark Glass
    : 'bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]'; // Light frosted Glass

  // Helper function to handle active/inactive text styles automatically
  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return isActive 
      ? 'text-[#FE6100] font-bold' 
      : `${textColor} hover:opacity-80`;
  };

  return (
    <motion.div 
      // Changed to fixed, transparent, and pointer-events-none
      className="fixed backdrop-blur-md top-0 left-0 w-full h-32 z-50 flex items-center justify-center bg-transparent pointer-events-none"
    >
      {/* Re-enable pointer events for the actual navbar content so links are clickable */}
      <div className="w-full max-w-[1236px] px-8 flex justify-between items-center gap-8 pointer-events-auto">
        
        {/* LOGO & TOGGLE SECTION */}
        <div className="flex items-center gap-16">
          
          <Link href="/" className="h-8 shrink-0 cursor-pointer flex items-center transition-transform hover:scale-105">
             <img 
               src={isCoding ? "/logo-light-text.svg" : "/logo-dark-text.svg"} 
               alt="Edvara Logo" 
               className="h-full w-auto object-contain"
             />
          </Link>

          {/* Theme Toggle Switch */}
          <div className="flex items-center gap-4">
            <span className={`${textColor} text-base transition-colors duration-500 font-medium`}>Engineers</span>
            
            <div 
              onClick={() => dispatch(toggleDomain())}
              className="w-20 h-8 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-full p-1 cursor-pointer flex items-center shadow-inner relative"
            >
              <motion.div 
                layout
                initial={false}
                animate={{ x: isCoding ? 48 : 0 }} 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full shadow-md flex items-center justify-center relative z-10"
              >
                <img src="/orange-fruit.svg" alt="Toggle Domain" className="w-full h-full object-contain drop-shadow-sm" />
              </motion.div>
            </div>
            
            <span className={`${textColor} text-base transition-colors duration-500 font-medium`}>Coding</span>
          </div>
        </div>

        {/* NAVIGATION LINKS (Glass Box) */}
        <div className={`h-16 px-6 py-4 rounded-[40px] flex items-center gap-8 transition-all duration-500 ${glassmorphismBg}`}>
          <Link href="/" className="px-4 py-2 flex justify-center items-center gap-2.5">
            <span className={`text-base cursor-pointer transition-all ${getLinkStyle('/')}`}>Home</span>
          </Link>
          <Link href="/courses" className="px-4 py-2 flex justify-center items-center gap-2.5">
            <span className={`text-base cursor-pointer transition-all ${getLinkStyle('/courses')}`}>Courses</span>
          </Link>
          <Link href="/classroom" className="px-4 py-2 flex justify-center items-center gap-2.5">
            <span className={`text-base cursor-pointer transition-all ${getLinkStyle('/classroom')}`}>My Classroom</span>
          </Link>
        </div>

        {/* AUTH SECTION */}
        <div className="flex justify-end items-center">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <img 
                className="w-16 h-16 rounded-full border-2 border-[#FE6100] object-cover cursor-pointer hover:scale-105 transition-all shadow-md" 
                src="https://placehold.co/64x64" 
                alt="User Avatar" 
              />
            </Link>
          ) : (
            <Link href="/login">
              <button className="px-6 py-2.5 bg-transparent rounded-[32px] shadow-[0px_-2px_4px_0px_#FE6100] outline outline-2 outline-offset-[-2px] outline-[#FE6100]/60 flex justify-center items-center gap-2.5 hover:bg-[#FE6100]/10 hover:shadow-[0px_0px_10px_0px_#FE6100] transition-all">
                <span className={`${textColor} text-base font-medium`}>Login</span>
              </button>
            </Link>
          )}
        </div>

      </div>
    </motion.div>
  );
}
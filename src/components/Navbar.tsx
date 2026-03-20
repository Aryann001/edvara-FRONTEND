'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; 
import { toggleDomain } from '@/store/slices/appSlice';
import { Menu, X } from 'lucide-react'; // Added for drawer icons

export default function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname(); 
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  
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
    <>
      <motion.div 
        // Changed to fixed, transparent, and pointer-events-none
        className="fixed backdrop-blur-md top-0 left-0 w-full h-24 lg:h-32 z-50 flex items-center justify-center bg-transparent pointer-events-none"
      >
        {/* Re-enable pointer events for the actual navbar content so links are clickable */}
        <div className="w-full max-w-[1236px] px-5 lg:px-8 flex justify-between items-center gap-8 pointer-events-auto">
          
          {/* LOGO & TOGGLE SECTION */}
          <div className="flex items-center gap-6 lg:gap-16">
            
            <Link href="/" className="h-8 shrink-0 cursor-pointer flex items-center transition-transform hover:scale-105">
               <img 
                 src={isCoding ? "/logo-light-text.svg" : "/logo-dark-text.svg"} 
                 alt="Edvara Logo" 
                 className="h-full w-auto object-contain"
               />
            </Link>

            {/* Desktop Theme Toggle Switch (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-4">
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

          {/* DESKTOP NAVIGATION LINKS (Glass Box - Hidden on mobile) */}
          <div className={`hidden lg:flex h-16 px-6 py-4 rounded-[40px] items-center gap-8 transition-all duration-500 ${glassmorphismBg}`}>
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

          {/* DESKTOP AUTH SECTION (Hidden on mobile) */}
          <div className="hidden lg:flex justify-end items-center">
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

          {/* MOBILE MENU BUTTON (Burger in Orange Box - Hidden on Desktop) */}
          <div className="flex lg:hidden justify-end items-center">
             <button 
               onClick={toggleDrawer} 
               className="w-11 h-11 bg-[#FE6100] rounded-xl shadow-[0px_4px_10px_rgba(254,97,0,0.4)] flex justify-center items-center hover:scale-105 transition-transform"
             >
                <Menu className="w-6 h-6 text-black" />
             </button>
          </div>

        </div>
      </motion.div>

      {/* --- MOBILE DRAWER COMPONENT --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dark Background Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Sliding Drawer Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 w-[80%] max-w-sm h-[100dvh] z-[70] flex flex-col p-6 shadow-2xl lg:hidden ${glassmorphismBg}`}
            >
              {/* Close Button */}
              <div className="flex justify-end mb-8">
                <button 
                  onClick={toggleDrawer} 
                  className={`p-2 rounded-full transition-colors ${isCoding ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="flex flex-col gap-4 mb-10 pb-8 border-b border-white/20">
                <span className={`${textColor} text-sm font-medium uppercase tracking-wider opacity-60`}>Domain</span>
                <div className="flex items-center gap-4">
                  <span className={`${textColor} text-base transition-colors duration-500 font-medium`}>Engineers</span>
                  <div 
                    onClick={() => dispatch(toggleDomain())}
                    className="w-16 h-7 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-full p-1 cursor-pointer flex items-center shadow-inner relative"
                  >
                    <motion.div 
                      layout
                      initial={false}
                      animate={{ x: isCoding ? 36 : 0 }} 
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full shadow-md flex items-center justify-center relative z-10"
                    >
                      <img src="/orange-fruit.svg" alt="Toggle Domain" className="w-full h-full object-contain drop-shadow-sm" />
                    </motion.div>
                  </div>
                  <span className={`${textColor} text-base transition-colors duration-500 font-medium`}>Coding</span>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-6 mb-8 border-b border-white/20 pb-8">
                <Link href="/" onClick={toggleDrawer}>
                  <span className={`text-xl cursor-pointer transition-all ${getLinkStyle('/')}`}>Home</span>
                </Link>
                <Link href="/courses" onClick={toggleDrawer}>
                  <span className={`text-xl cursor-pointer transition-all ${getLinkStyle('/courses')}`}>Courses</span>
                </Link>
                <Link href="/classroom" onClick={toggleDrawer}>
                  <span className={`text-xl cursor-pointer transition-all ${getLinkStyle('/classroom')}`}>My Classroom</span>
                </Link>
              </div>

              {/* Mobile Auth */}
              <div className="mt-auto pb-4">
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={toggleDrawer} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <img 
                      className="w-12 h-12 rounded-full border-2 border-[#FE6100] object-cover shadow-md" 
                      src="https://placehold.co/64x64" 
                      alt="User Avatar" 
                    />
                    <span className={`${textColor} text-lg font-medium`}>Go to Dashboard</span>
                  </Link>
                ) : (
                  <Link href="/login" onClick={toggleDrawer} className="w-full">
                    <button className="w-full py-3.5 bg-transparent rounded-[32px] shadow-[0px_-2px_4px_0px_#FE6100] outline outline-2 outline-offset-[-2px] outline-[#FE6100]/60 flex justify-center items-center gap-2.5 hover:bg-[#FE6100]/10 hover:shadow-[0px_0px_10px_0px_#FE6100] transition-all">
                      <span className={`${textColor} text-base font-medium`}>Login to Account</span>
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
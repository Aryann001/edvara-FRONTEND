'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpPopup({ isOpen, onClose }: HelpPopupProps) {
  // Read state from Redux for dynamic theming
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // --- THEME CONSTANTS ---
  const modalBg = isCoding 
    ? 'bg-[#1C1C1C] border border-white/10 shadow-2xl' 
    : 'bg-white border border-black/10 shadow-xl';
  
  const iconBg = isCoding ? 'bg-white text-black' : 'bg-black text-white';
  const textMain = isCoding ? 'text-white' : 'text-neutral-950';
  const textClose = isCoding ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-center p-5 font-['Helvena']"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
              className={`relative w-full max-w-[320px] md:max-w-[400px] lg:max-w-[450px] p-6 md:p-8 rounded-xl flex flex-col justify-center items-center gap-6 ${modalBg}`}
            >
              {/* Close Button (UX addition) */}
              <button 
                onClick={onClose}
                className={`absolute top-4 right-4 transition-colors ${textClose}`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon Container */}
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex justify-center items-center shrink-0 ${iconBg}`}>
                <Mail className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
              </div>

              {/* Text Content */}
              <div className="w-full flex flex-col justify-center items-center gap-2 md:gap-3 text-center">
                <h2 className={`${textMain} italic text-xl md:text-2xl lg:text-3xl font-normal font-['Libre_Baskerville'] leading-tight`}>
                  Contact us and we’ll assist you.
                </h2>
                <div className={`${textMain} text-sm md:text-base lg:text-lg`}>
                  <span className="font-normal">Mail Support </span>
                  <a 
                    href="mailto:Sachin@email.com" 
                    className="font-bold hover:text-[#FE6100] transition-colors underline decoration-transparent hover:decoration-[#FE6100] underline-offset-4"
                  >
                    Sachin@email.com
                  </a>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
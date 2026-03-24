'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface PaymentFailedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export default function PaymentFailedPopup({ isOpen, onClose, onRetry }: PaymentFailedPopupProps) {
  // Read state from Redux for dynamic theming
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // --- THEME CONSTANTS ---
  // Replaced default outlines with proper dynamic borders
  const modalBg = isCoding 
    ? 'bg-[#1C1C1C] border border-white/10 shadow-2xl' 
    : 'bg-white border border-black/10 shadow-[0px_8px_30px_rgba(0,0,0,0.12)]';
    
  const textMain = isCoding ? 'text-white' : 'text-neutral-950';
  const textSub = isCoding ? 'text-gray-300' : 'text-neutral-950';

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
              className={`w-full max-w-[320px] md:max-w-[384px] p-6 rounded-xl flex flex-col justify-center items-center gap-6 ${modalBg}`}
            >
              
              {/* Red Circle with White X */}
              <div className="w-14 h-14 bg-red-500 rounded-full flex justify-center items-center shadow-[0_0_15px_rgba(239,68,68,0.4)] shrink-0">
                <X className="w-8 h-8 text-white" strokeWidth={3} />
              </div>

              {/* Text Content */}
              <div className="w-full flex flex-col justify-center items-center gap-1.5 text-center">
                <h2 className={`${textMain} text-xl md:text-3xl font-normal font-['Libre_Baskerville'] italic`}>
                  Payment Failed
                </h2>
                <p className={`${textSub} text-sm md:text-lg font-normal leading-snug`}>
                  Don’t worry, your money has not been deducted.
                </p>
              </div>

              {/* Retry Button */}
              <button
                onClick={onRetry}
                className="w-full h-11 px-6 py-2 bg-gradient-to-r from-[#FE6100] to-[#FC3500] hover:opacity-90 transition-opacity rounded-lg flex justify-center items-center gap-2 shadow-md group"
              >
                <span className="text-white text-sm font-medium">Retry</span>
                <RotateCcw className="w-4 h-4 text-white group-hover:-rotate-180 transition-transform duration-500" strokeWidth={2.5} />
              </button>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Use :
// import { useState } from 'react';
// import PaymentFailedPopup from '@/components/PaymentFailedPopup';

// export default function CheckoutPage() {
//   const [isFailedPopupOpen, setIsFailedPopupOpen] = useState(false);

//   const handleRetryPayment = () => {
//     setIsFailedPopupOpen(false);
//     // Add your Razorpay/Stripe re-trigger logic here
//   };

//   return (
//     <div>
//       {/* Trigger the error state (for testing) */}
//       <button onClick={() => setIsFailedPopupOpen(true)}>Simulate Failed Payment</button>

//       {/* The Popup Component */}
//       <PaymentFailedPopup 
//         isOpen={isFailedPopupOpen} 
//         onClose={() => setIsFailedPopupOpen(false)} 
//         onRetry={handleRetryPayment} 
//       />
//     </div>
//   );
// }
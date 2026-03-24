'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface RequestCoursePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestCoursePopup({ isOpen, onClose }: RequestCoursePopupProps) {
  const router = useRouter();

  // Read state from Redux for dynamic theming and auth
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const isAuthenticated = useAppSelector((state) => state.app.isAuthenticated);

  // Form States
  const [selectedCategory, setSelectedCategory] = useState<'Engineers' | 'Coding' | null>(null);
  const [courseName, setCourseName] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- THEME CONSTANTS ---
  const modalBg = isCoding 
    ? 'bg-[#1C1C1C] border border-white/10 shadow-2xl' 
    : 'bg-white border border-black/10 shadow-[0px_8px_30px_rgba(0,0,0,0.12)]';
  
  const textMain = isCoding ? 'text-white' : 'text-neutral-950';
  const textSub = isCoding ? 'text-gray-400' : 'text-gray-600';
  const labelColor = isCoding ? 'text-gray-200' : 'text-black';
  const inputBg = isCoding ? 'bg-stone-950 outline-white/10 text-white' : 'bg-white outline-neutral-200 text-stone-900';
  
  // Submit Button Theme (Adapting the raw code's black button)
  const submitBtnBg = isCoding ? 'bg-white text-black hover:bg-gray-200' : 'bg-neutral-950 text-white hover:bg-neutral-800';

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !courseName) return; // Basic validation
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form & close
      setSelectedCategory(null);
      setCourseName('');
      setDetails('');
      onClose();
    }, 1000);
  };

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
              className={`relative w-full max-w-[360px] md:max-w-[420px] p-6 md:p-8 rounded-xl flex flex-col items-center gap-6 ${modalBg}`}
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className={`absolute top-4 right-4 p-1 rounded-md transition-colors ${isCoding ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-black hover:bg-black/5'}`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="w-full flex flex-col justify-center items-start">
                <h3 className="text-orange-600 text-lg md:text-xl font-normal font-['Libre_Baskerville'] italic leading-tight">
                  Can’t find your course?
                </h3>
                <h2 className={`${textMain} text-2xl md:text-3xl font-medium mt-1`}>
                  Request a Course
                </h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                <div className="w-full flex flex-col gap-5">
                  
                  {/* Category Selection */}
                  <div className="w-full flex flex-col gap-2.5">
                    <label className={`${labelColor} text-sm font-medium`}>Select category</label>
                    <div className="flex items-center gap-3">
                      {['Engineers', 'Coding'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat as any)}
                          className={`px-4 py-1.5 rounded-full outline outline-1 outline-offset-[-1px] text-sm font-medium transition-all ${
                            selectedCategory === cat 
                              ? 'bg-[#FE6100] outline-[#FE6100] text-white shadow-md' 
                              : `${isCoding ? 'bg-transparent outline-white/20 text-gray-300 hover:bg-white/5' : 'bg-transparent outline-neutral-200 text-gray-600 hover:bg-neutral-50'}`
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Course Name Input */}
                  <div className="w-full flex flex-col gap-2">
                    <label className={`${labelColor} text-sm font-medium`}>What do you want to learn?</label>
                    <input 
                      type="text" 
                      required
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. Advanced Machine Learning"
                      className={`w-full h-10 px-3.5 py-2 rounded-lg outline outline-1 outline-offset-[-1px] transition-all focus:outline-[#FE6100] ${inputBg} text-sm font-normal placeholder:text-gray-400`}
                    />
                  </div>

                  {/* Optional Details Textarea */}
                  <div className="w-full flex flex-col gap-2">
                    <label className={`${labelColor} text-sm font-medium`}>Optional details</label>
                    <textarea 
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Any specific topics or university syllabus?"
                      className={`w-full h-24 px-3.5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] transition-all focus:outline-[#FE6100] resize-none ${inputBg} text-sm font-normal placeholder:text-gray-400`}
                    />
                  </div>

                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting || !selectedCategory || !courseName}
                  className={`w-full h-11 px-6 py-2 rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group ${submitBtnBg}`}
                >
                  <span className="text-sm font-medium leading-5">
                    {isSubmitting ? 'Submitting...' : 'Request Course'}
                  </span>
                  {!isSubmitting && (
                    <Send className={`w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${isCoding ? 'text-black' : 'text-white'}`} strokeWidth={2.5} />
                  )}
                </button>
              </form>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
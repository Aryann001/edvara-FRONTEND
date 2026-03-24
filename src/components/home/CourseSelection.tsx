'use client';

import React, { useState } from 'react';
import { Search, ArrowRight, Check, ChevronLeft, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import RequestCoursePopup from '@/components/RequestCoursePopup'; // Integrated Popup

// --- DATA ---
const universities = [
  { id: '01', name: 'RGPV (Rajiv Gandhi Proudyogiki Vishwavidyalaya), MP', location: 'Madhya Pradesh', stats: '6 Streams | 23 Courses', ready: true },
  { id: '02', name: 'AKTU (Dr. A.P.J. Abdul Kalam Technical University), UP', location: 'Uttar Pradesh', stats: '6 Streams | 23 Courses', ready: true },
  { id: '03', name: 'IKGPTU (I.K. Gujral Punjab Technical University)', location: 'Kapurthala', stats: '6 Streams | 23 Courses', ready: true },
  { id: '04', name: 'Kurukshetra University, Haryana', location: 'Haryana', stats: '6 Streams | 23 Courses', ready: true },
  { id: '05', name: 'SRM Institute of Science and Technology, Chennai', location: 'Chennai', stats: '6 Streams | 23 Courses', ready: true },
  { id: '06', name: 'VIT Vellore', location: 'Vellore', stats: 'Notify me when ready', ready: false },
  { id: '07', name: 'BITS Pilani', location: 'Goa', stats: 'Notify me when ready', ready: false },
  { id: '08', name: 'Chandigarh University', location: 'Chandigarh', stats: 'Notify me when ready', ready: false },
];

const branches = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Information Technology'];
const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

const codingCourses = [
  {
    id: 1,
    title: "Become a Job-Ready AI Powered Full Stack",
    tags: ["Product Building", "Community Access"],
    price: "4,900",
    mrp: "5,999",
    discount: "11% off",
    img: "https://placehold.co/360x203"
  },
  {
    id: 2,
    title: "Data Science and Analytics with GenAI",
    tags: ["Machine Learning", "Deep Learning"],
    price: "4,900",
    mrp: "5,999",
    discount: "11% off",
    img: "https://placehold.co/360x203"
  },
  {
    id: 3,
    title: "2.0 Job Ready AI Powered Cohort",
    tags: ["Job Ready", "MERN Stack", "DSA With JS"],
    price: "4,900",
    mrp: "5,999",
    discount: "11% off",
    img: "https://placehold.co/360x203"
  }
];

export default function CourseSelection() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // State for the Request Popup
  const [isRequestPopupOpen, setIsRequestPopupOpen] = useState(false);

  const handleSelection = (id: string) => {
    setLastSelectedId(id);
    setTimeout(() => {
      setDirection(1);
      setStep(step + 1);
      setLastSelectedId(null);
    }, 400);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -100 : 100, opacity: 0 })
  };

  const stepNames = ['University', 'Branch', 'Semester', 'Subjects'];

  // --- CODING THEME RENDER ---
  if (isCoding) {
    return (
      <section className="w-full bg-[#161616] flex flex-col items-center overflow-hidden transition-colors duration-500">
        <div className="w-full h-0 border-t border-slate-800" />

        <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-24 flex flex-col justify-center items-center gap-10 lg:gap-14">
          
          <div className="self-stretch flex flex-col justify-center items-center">
            {/* Added italic here as requested */}
            <div className="text-center text-orange-500 text-xl md:text-4xl font-normal font-['Libre_Baskerville'] italic">Master the logic</div>
            <div className="text-center text-white text-2xl md:text-5xl font-medium font-['Helvena']">The rest is code</div>
          </div>

          <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {codingCourses.map((course) => (
              <div key={course.id} className="flex-1 p-5 lg:p-6 relative bg-stone-950 rounded-xl flex flex-col justify-between items-start overflow-hidden border border-white/5">
                {/* Responsive Background Glows (Replaced hardcoded pixels with relative positioning) */}
                <div className="w-32 h-32 absolute -right-10 -bottom-10 bg-orange-500 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none" />
                <div className="w-32 h-32 absolute -right-10 top-1/4 bg-orange-500 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none" />
                
                <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-10 z-10 h-full">
                  <div className="self-stretch flex flex-col justify-start items-start gap-5">
                    {/* Orange Thumbnail Area as requested */}
                    <div className="w-full aspect-video rounded-lg bg-orange-500 flex items-center justify-center overflow-hidden">
                       <img className="w-full h-full object-cover mix-blend-overlay opacity-80" src={course.img} alt="thumbnail" />
                    </div>
                    
                    <div className="self-stretch flex flex-col justify-start items-start gap-4 lg:gap-5">
                      <div className="self-stretch flex justify-start items-start gap-2 flex-wrap">
                        {course.tags.map((tag) => (
                          <div key={tag} className="px-3 py-1.5 bg-white/10 rounded-[100px] flex flex-col justify-start items-start">
                            <div className="text-center text-white text-xs lg:text-sm font-normal font-['Helvena']">{tag}</div>
                          </div>
                        ))}
                      </div>
                      <div className="self-stretch text-white text-xl lg:text-2xl font-medium font-['Helvena'] tracking-wide leading-tight">
                        {course.title}
                      </div>
                    </div>
                  </div>

                  <div className="self-stretch flex flex-col justify-end items-start gap-5 mt-auto">
                    <div className="flex flex-col justify-center items-start gap-1">
                      <div className="text-white text-2xl lg:text-3xl font-medium font-sans">₹{course.price}</div>
                      <div className="flex items-center flex-wrap gap-1.5 lg:gap-2">
                        <span className="text-white/80 text-xs lg:text-sm font-normal font-['Helvena'] line-through">MRP ₹{course.mrp}</span>
                        <span className="text-orange-600 text-xs lg:text-sm font-normal font-['Helvena']">({course.discount})</span>
                      </div>
                    </div>
                    <div className="self-stretch flex justify-start items-start gap-3 lg:gap-4">
                      {/* Check Course Button (Cart Icon Removed) */}
                      <button className="flex-1 h-10 px-4 lg:px-6 bg-white rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-100 transition-colors group">
                        <span className="text-stone-950 text-sm font-medium font-['Helvena'] whitespace-nowrap">Check Course</span>
                        <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="self-stretch h-0 outline outline-[1.40px] outline-slate-800" />
      </section>
    );
  }

  // --- ENGINEERING THEME RENDER (STRICTLY PRESERVED FROM PROVIDED CODE) ---
  return (
    <>
      <section className="w-full bg-neutral-100 flex flex-col items-center">
        <div className="w-full h-0 border-t border-gray-300" />

        <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-24 flex flex-col items-center gap-10 lg:gap-14">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <h2 className="text-[#FE6100] text-xl md:text-4xl italic font-normal font-['Libre_Baskerville']">
              Engineering Courses
            </h2>
            <p className="text-black text-2xl md:text-5xl font-medium font-['Helvena'] leading-tight">
              Find your subjects in 4 clicks
            </p>
          </div>

          {/* Stepper Progress Bar - Responsive Logic */}
          <div className="w-full max-w-[800px] flex items-center justify-between gap-2 overflow-x-hidden pb-4">
            {[1, 2, 3, 4].map((num, idx) => (
              <React.Fragment key={num}>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    step >= num ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-gray-300 text-gray-400'
                  }`}>
                    {step > num ? <Check className="w-4 h-4" strokeWidth={4} /> : num}
                  </div>
                  {/* Desktop: Always show names | Mobile: Show name only if active */}
                  <span className={`text-sm md:text-base font-['Helvena'] ${
                    step === num ? 'inline text-indigo-700 font-bold' : 'hidden md:inline text-gray-400'
                  }`}>
                    {stepNames[idx]}
                  </span>
                </div>
                {idx < 3 && (
                  <div className="flex-1 min-w-[20px] h-[2px] bg-gray-200">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: step > num ? "100%" : "0%" }}
                      className="h-full bg-indigo-700"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Main Selection Card */}
          <div className="w-full bg-white rounded-xl md:rounded-[32px] p-4 md:p-6 lg:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[500px] transition-all">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
              <div className="flex items-center gap-4">
                <AnimatePresence>
                  {step > 1 && (
                    <motion.button 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={handleBack} 
                      className="p-2 hover:bg-neutral-100 rounded-full transition-colors border border-gray-100"
                    >
                      <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <h3 className="text-black text-lg md:text-3xl font-medium font-['Helvena']">
                  {step === 1 && "Choose your university"}
                  {step === 2 && "Select your branch"}
                  {step === 3 && "Which semester?"}
                  {step === 4 && "Preparing Subjects"}
                </h3>
              </div>
              {step === 1 && (
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search university or branch..." 
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-neutral-50 rounded-xl md:rounded-2xl border border-gray-200 focus:border-[#FE6100] outline-none transition-all font-['Helvena'] text-sm md:text-base"
                  />
                </div>
              )}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                {step === 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {universities.map((uni) => (
                      <div 
                        key={uni.id} 
                        onClick={() => handleSelection(uni.id)}
                        className={`relative p-3 md:p-6 rounded-xl md:rounded-3xl border-2 transition-all duration-300 ease-in-out cursor-pointer flex flex-col gap-6 md:gap-10 hover:bg-[#FE6100]/5 ${
                          lastSelectedId === uni.id 
                          ? 'border-[#FE6100] bg-[#FE6100]/5' 
                          : 'border-gray-100 hover:border-[#FE6100]/30'
                        }`}
                      >
                        <div className="w-9 h-9 md:w-14 md:h-14 bg-white flex items-center justify-center rounded-lg md:rounded-xl shadow-sm">
                          <img src={`/universities/${uni.id}.png`} alt="logo" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-neutral-950 text-sm md:text-lg font-bold font-['Helvena'] line-clamp-1">{uni.name}</h4>
                          <p className="text-gray-500 font-['Helvena'] text-xs md:text-sm">{uni.location}</p>
                          <p className="text-[#FE6100] font-['Helvena'] text-[10px] md:text-sm font-semibold mt-1 md:mt-2">{uni.stats}</p>
                        </div>
                        <AnimatePresence>
                          {lastSelectedId === uni.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-3 right-3 md:top-6 md:right-6"
                            >
                              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#FE6100]" strokeWidth={4} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                    {branches.map((branch) => (
                      <button 
                        key={branch}
                        onClick={() => handleSelection(branch)}
                        className={`p-5 md:p-8 rounded-xl md:rounded-[24px] border-2 border-gray-100 hover:border-[#FE6100]/30 hover:bg-[#FE6100]/5 font-['Helvena'] text-base md:text-xl text-left font-medium transition-all duration-300 group flex justify-between items-center ${
                          lastSelectedId === branch ? 'border-[#FE6100] bg-[#FE6100]/5' : ''
                        }`}
                      >
                        {branch}
                        <ArrowRight className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${lastSelectedId === branch ? 'text-[#FE6100]' : 'text-gray-300 group-hover:text-[#FE6100]'}`} />
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                    {semesters.map((sem) => (
                      <button 
                        key={sem}
                        onClick={() => handleSelection(sem)}
                        className={`py-6 md:py-10 rounded-xl md:rounded-[24px] border-2 border-gray-100 hover:border-[#FE6100]/30 hover:bg-[#FE6100]/5 font-['Helvena'] text-base md:text-2xl font-bold transition-all duration-300 ${
                          lastSelectedId === sem ? 'border-[#FE6100] bg-[#FE6100]/5' : ''
                        }`}
                      >
                        {sem.split(' ')[0]}
                        <span className="block text-[10px] md:text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Semester</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[#FE6100] font-['Helvena'] text-xl md:text-2xl font-bold"
                    >
                      Fetching Curriculum...
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer info (Integrated Popup Trigger) */}
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <p className="text-gray-400 text-sm md:text-base font-medium font-['Helvena']">
              🚀 Adding 20+ universities through 2026
            </p>
            <button 
              onClick={() => setIsRequestPopupOpen(true)}
              className="text-indigo-700 text-sm md:text-lg font-bold font-['Helvena'] flex items-center gap-2 hover:underline transition-all"
            >
              Don't see yours? Request your university →
            </button>
          </div>
        </div>
      </section>

      {/* Global Request Course Popup Instance */}
      <RequestCoursePopup isOpen={isRequestPopupOpen} onClose={() => setIsRequestPopupOpen(false)} />
    </>
  );
}
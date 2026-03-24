'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Check, ChevronLeft, Loader2, BookX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import RequestCoursePopup from '@/components/RequestCoursePopup'; 
import api from '@/services/api';

// --- STATIC DATA (These rarely change, so keeping them static is fine) ---
const branches = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Information Technology'];
const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

export default function CoursesPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  // Navigation & UI States
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isRequestPopupOpen, setIsRequestPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Data States
  const [universities, setUniversities] = useState<any[]>([]);
  const [codingCourses, setCodingCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom GenZ Easing
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  // 1. Fetch Coding Courses ONCE on mount
  useEffect(() => {
    const fetchCodingCourses = async () => {
      try {
        const { data } = await api.get('/courses?domain=coding');
        setCodingCourses(data.data);
      } catch (error) {
        console.error("Failed to fetch coding courses", error);
      }
    };
    fetchCodingCourses();
  }, []);

  // 2. Dynamic Server-Side Search for Universities (with debounce & limit=8)
  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoading(true);
      try {
        // Build query string. Limit is always 8 for UI consistency.
        const queryStr = searchQuery 
          ? `/universities?limit=8&search=${encodeURIComponent(searchQuery)}`
          : `/universities?limit=8`;
          
        const { data } = await api.get(queryStr);
        setUniversities(data.data);
      } catch (error) {
        console.error("Failed to fetch universities", error);
      } finally {
        setIsLoading(false);
      }
    };

    // DEBOUNCE LOGIC: Wait 300ms after typing stops before hitting the API
    const delayDebounceFn = setTimeout(() => {
      fetchUniversities();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleSelection = (id: string) => {
    setLastSelectedId(id);
    setTimeout(() => {
      setDirection(1);
      setStep(step + 1);
      setLastSelectedId(null);
    }, 350); 
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(step - 1);
  };
  
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 })
  };

  const stepNames = ['University', 'Branch', 'Semester', 'Subjects'];

  // =========================================================================
  // CODING THEME RENDER (Dark Mode / Sleek Cards)
  // =========================================================================
  if (isCoding) {
    return (
      <section className="min-h-screen w-full bg-[#161616] flex flex-col items-center overflow-hidden transition-colors duration-500 pt-[80px] lg:pt-[100px]">
        <div className="w-full h-[1px] bg-white/5" />

        <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-20 flex flex-col justify-center items-center gap-12 lg:gap-16">
          
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: customEase, duration: 0.6 }}
              className="text-center text-[#FE6100] text-xl md:text-3xl font-normal font-['Libre_Baskerville'] italic tracking-wide"
            >
              Master the logic
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: customEase, duration: 0.6 }}
              className="text-center text-white text-4xl md:text-6xl font-semibold font-['Helvena'] tracking-tight"
            >
              The rest is code.
            </motion.div>
          </div>

          {codingCourses.length > 0 ? (
            <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {codingCourses.map((course, idx) => {
                const discountPercent = course.mrp > course.price 
                  ? Math.round(((course.mrp - course.price) / course.mrp) * 100) 
                  : 0;

                return (
                  <motion.div 
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6, ease: customEase }}
                    className="group flex-1 p-5 lg:p-6 relative bg-[#1C1C1C] rounded-2xl flex flex-col justify-between items-start overflow-hidden outline outline-1 outline-white/5 hover:outline-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(254,97,0,0.15)]"
                  >
                    <div className="w-48 h-48 absolute -right-10 -bottom-10 bg-[#FE6100] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
                    <div className="w-40 h-40 absolute -left-10 top-1/4 bg-[#FE6100] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-10 z-10 h-full">
                      <div className="self-stretch flex flex-col justify-start items-start gap-6">
                        
                        <div className="w-full aspect-[16/10] rounded-xl bg-[#2A2A2A] flex items-center justify-center overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                          <img 
                            className="w-full h-full object-cover mix-blend-overlay opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out" 
                            src={course.thumbnail?.url || "https://placehold.co/360x203"} 
                            alt={course.title} 
                          />
                        </div>
                        
                        <div className="self-stretch flex flex-col justify-start items-start gap-4">
                          <div className="self-stretch flex justify-start items-start gap-2 flex-wrap">
                            {course.tags?.map((tag: string) => (
                              <div key={tag} className="px-3 py-1.5 bg-white/10 rounded-[100px] flex flex-col justify-start items-start backdrop-blur-sm">
                                <div className="text-center text-gray-200 text-xs lg:text-sm font-medium font-['Helvena']">{tag}</div>
                              </div>
                            ))}
                          </div>
                          <div className="self-stretch text-white text-xl lg:text-2xl font-semibold font-['Helvena'] tracking-wide leading-tight group-hover:text-orange-100 transition-colors line-clamp-2">
                            {course.title}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col justify-end items-start gap-6 mt-auto">
                        <div className="flex flex-col justify-center items-start gap-1">
                          <div className="text-white text-3xl font-bold font-sans">₹{course.price}</div>
                          {course.mrp > course.price && (
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-white/60 text-xs lg:text-sm font-normal font-['Helvena'] line-through">MRP ₹{course.mrp}</span>
                              <span className="text-[#FE6100] text-xs lg:text-sm font-semibold font-['Helvena'] tracking-wide">({discountPercent}% off)</span>
                            </div>
                          )}
                        </div>
                        <button className="w-full h-12 bg-white rounded-xl shadow-lg flex justify-center items-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all group/btn">
                          <span className="text-stone-950 text-base font-semibold font-['Helvena']">Check Course</span>
                          <ArrowRight className="w-4 h-4 text-stone-950 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20 opacity-70">
              <BookX className="w-16 h-16 text-white/40 mb-4" />
              <h3 className="text-white text-xl md:text-2xl font-medium font-['Helvena']">New cohorts launching soon.</h3>
              <p className="text-gray-400 mt-2">Stay tuned for upcoming AI and Full Stack programs.</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // =========================================================================
  // ENGINEERING THEME RENDER (Light Mode / Stepper)
  // =========================================================================
  return (
    <>
      <section className="min-h-screen w-full bg-neutral-50 flex flex-col items-center pt-[80px] lg:pt-[100px]">
        <div className="w-full max-w-[1440px] px-4 md:px-10 lg:px-20 py-14 lg:py-20 flex flex-col items-center gap-10 lg:gap-14">
          
          <div className="flex flex-col items-center text-center gap-3">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: customEase, duration: 0.6 }}
              className="text-[#FE6100] text-xl md:text-3xl italic font-normal font-['Libre_Baskerville']"
            >
              Engineering Courses
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: customEase, duration: 0.6 }}
              className="text-neutral-950 text-3xl md:text-5xl font-bold font-['Helvena'] tracking-tight leading-tight"
            >
              Find your subjects in 4 clicks
            </motion.p>
          </div>

          <div className="w-full max-w-[800px] flex items-center justify-between gap-2 overflow-x-hidden pb-4 px-2">
            {[1, 2, 3, 4].map((num, idx) => (
              <React.Fragment key={num}>
                <div className="flex items-center gap-3 shrink-0">
                  <motion.div 
                    layout
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-500 shadow-sm ${
                      step >= num ? 'bg-indigo-600 text-white outline outline-2 outline-indigo-600 outline-offset-2' : 'bg-white text-gray-400 outline outline-1 outline-gray-200'
                    }`}
                  >
                    {step > num ? <Check className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} /> : num}
                  </motion.div>
                  <span className={`text-sm md:text-base font-['Helvena'] transition-colors duration-300 ${
                    step === num ? 'inline text-indigo-700 font-bold' : 'hidden md:inline text-gray-400 font-medium'
                  }`}>
                    {stepNames[idx]}
                  </span>
                </div>
                {idx < 3 && (
                  <div className="flex-1 min-w-[20px] h-[3px] bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: step > num ? "100%" : "0%" }}
                      className="h-full bg-indigo-600"
                      transition={{ duration: 0.5, ease: customEase }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <motion.div 
            layout
            className="w-full bg-white/80 backdrop-blur-xl rounded-[24px] md:rounded-[40px] p-5 md:p-8 lg:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] outline outline-1 outline-gray-200/50 min-h-[500px] flex flex-col"
          >
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
              <div className="flex items-center gap-4">
                <AnimatePresence>
                  {step > 1 && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -10 }}
                      onClick={handleBack} 
                      className="p-2 hover:bg-neutral-100 active:scale-90 rounded-full transition-all outline outline-1 outline-gray-200"
                    >
                      <ChevronLeft className="w-6 h-6 text-black" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <h3 className="text-neutral-950 text-xl md:text-3xl font-semibold font-['Helvena'] tracking-tight">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search university..." 
                    className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-3.5 bg-neutral-50 rounded-xl md:rounded-2xl outline outline-1 outline-gray-200 focus:outline-[#FE6100] focus:bg-white transition-all font-['Helvena'] text-sm md:text-base font-medium placeholder:font-normal shadow-inner"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: customEase }}
                  className="w-full h-full"
                >
                  {step === 1 && (
                    isLoading ? (
                      <div className="flex justify-center items-center h-[300px]">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      </div>
                    ) : universities.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {universities.map((uni) => (
                          <div 
                            key={uni._id} 
                            onClick={() => {
                              if (uni.isReady) handleSelection(uni._id);
                            }}
                            className={`relative p-4 md:p-6 rounded-2xl md:rounded-[28px] outline transition-all duration-300 ease-out flex flex-col gap-6 md:gap-8 ${
                              !uni.isReady ? 'opacity-60 grayscale cursor-not-allowed outline-1 outline-gray-200 bg-gray-50' :
                              lastSelectedId === uni._id 
                              ? 'outline-2 outline-[#FE6100] bg-[#FE6100]/5 shadow-md cursor-pointer' 
                              : 'outline-1 outline-gray-200 hover:outline-[#FE6100]/30 hover:shadow-lg hover:-translate-y-1 bg-white cursor-pointer active:scale-[0.98]'
                            }`}
                          >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-50 flex items-center justify-center rounded-xl md:rounded-2xl outline outline-1 outline-gray-100 shadow-sm overflow-hidden">
                              <img src={uni.logo?.url || "/placeholder.png"} alt="logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                            </div>
                            <div className="flex flex-col gap-1.5 pr-4">
                              <h4 className="text-neutral-950 text-base md:text-lg font-bold font-['Helvena'] line-clamp-2 leading-snug">{uni.name}</h4>
                              <p className="text-gray-500 font-['Helvena'] text-xs md:text-sm font-medium">{uni.location}</p>
                              <p className={`${uni.isReady ? 'text-[#FE6100]' : 'text-gray-500'} font-['Helvena'] text-[11px] md:text-sm font-bold tracking-wide mt-1 md:mt-2`}>
                                {uni.stats || (uni.isReady ? 'Available Now' : 'Notify me when ready')}
                              </p>
                            </div>
                            <AnimatePresence>
                              {lastSelectedId === uni._id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute top-4 right-4 md:top-6 md:right-6 bg-white rounded-full shadow-sm"
                                >
                                  <Check className="w-5 h-5 md:w-6 md:h-6 text-[#FE6100]" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center h-[300px] gap-4 text-center">
                        <BookX className="w-12 h-12 text-gray-300" />
                        <div>
                          <h3 className="text-gray-900 text-xl font-semibold">No universities found</h3>
                          <p className="text-gray-500 mt-1">We couldn't find any match for "{searchQuery}"</p>
                        </div>
                        <button 
                          onClick={() => setIsRequestPopupOpen(true)}
                          className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Request this University
                        </button>
                      </div>
                    )
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {branches.map((branch) => (
                        <button 
                          key={branch}
                          onClick={() => handleSelection(branch)}
                          className={`p-5 md:p-8 rounded-2xl md:rounded-[28px] outline outline-1 outline-gray-200 hover:outline-[#FE6100]/30 hover:shadow-lg font-['Helvena'] text-base md:text-xl text-left font-semibold transition-all duration-300 active:scale-[0.98] group flex justify-between items-center ${
                            lastSelectedId === branch ? 'outline-2 outline-[#FE6100] bg-[#FE6100]/5 shadow-md' : 'bg-white hover:-translate-y-1'
                          }`}
                        >
                          {branch}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${lastSelectedId === branch ? 'bg-[#FE6100]' : 'bg-neutral-100 group-hover:bg-[#FE6100]/10'}`}>
                            <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${lastSelectedId === branch ? 'text-white' : 'text-gray-400 group-hover:text-[#FE6100]'}`} strokeWidth={3} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {semesters.map((sem) => (
                        <button 
                          key={sem}
                          onClick={() => handleSelection(sem)}
                          className={`py-8 md:py-12 rounded-2xl md:rounded-[28px] outline outline-1 outline-gray-200 hover:outline-[#FE6100]/30 hover:shadow-lg font-['Helvena'] text-2xl md:text-4xl font-bold transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 ${
                            lastSelectedId === sem ? 'outline-2 outline-[#FE6100] bg-[#FE6100]/5 text-[#FE6100] shadow-md' : 'bg-white text-neutral-900'
                          }`}
                        >
                          {sem.split(' ')[0]}
                          <span className="block text-xs md:text-sm font-semibold text-gray-400 mt-2 tracking-widest uppercase">Semester</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="flex flex-col items-center justify-center py-20 h-full">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ease: customEase, duration: 0.5 }}
                        className="flex flex-col items-center gap-6"
                      >
                        <div className="w-16 h-16 bg-[#FE6100]/10 rounded-full flex items-center justify-center">
                           <Loader2 className="w-8 h-8 text-[#FE6100] animate-spin" strokeWidth={3} />
                        </div>
                        <h3 className="text-neutral-900 font-['Helvena'] text-xl md:text-2xl font-bold tracking-tight">
                          Fetching your exact syllabus...
                        </h3>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-3 md:gap-4 mt-4">
            <div className="px-4 py-1.5 bg-gray-200/50 rounded-full text-gray-500 text-xs md:text-sm font-semibold font-['Helvena'] tracking-wide uppercase">
              🚀 Adding 20+ universities through 2026
            </div>
            <button 
              onClick={() => setIsRequestPopupOpen(true)}
              className="text-indigo-600 text-sm md:text-lg font-bold font-['Helvena'] flex items-center gap-2 hover:text-indigo-800 transition-colors group"
            >
              Don't see yours? Request your university 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          </div>

        </div>
      </section>

      <RequestCoursePopup isOpen={isRequestPopupOpen} onClose={() => setIsRequestPopupOpen(false)} />
    </>
  );
}
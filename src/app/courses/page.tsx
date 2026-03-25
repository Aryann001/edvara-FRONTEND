'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Check, ChevronLeft, Loader2, BookX, Layers, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import RequestCoursePopup from '@/components/RequestCoursePopup'; 
import Link from 'next/link';
import api from '@/services/api';

const branches = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Information Technology'];
const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

export default function CourseSelection() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // State for the Request Popup
  const [isRequestPopupOpen, setIsRequestPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Data States
  const [universities, setUniversities] = useState<any[]>([]);
  const [codingCourses, setCodingCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Selection States
  const [selectedUni, setSelectedUni] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  
  // Fetched Subjects State
  const [fetchedSubjects, setFetchedSubjects] = useState<any[]>([]);
  const [isFetchingSubjects, setIsFetchingSubjects] = useState(false);

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

  // 2. Dynamic Server-Side Search for Universities
  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoading(true);
      try {
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

    const delayDebounceFn = setTimeout(() => {
      fetchUniversities();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleUniSelect = (uni: any) => {
    setLastSelectedId(uni._id);
    setSelectedUni(uni);
    setTimeout(() => {
      setDirection(1);
      setStep(2);
      setLastSelectedId(null);
    }, 400);
  };

  const handleBranchSelect = (branch: string) => {
    setLastSelectedId(branch);
    setSelectedBranch(branch);
    setTimeout(() => {
      setDirection(1);
      setStep(3);
      setLastSelectedId(null);
    }, 400);
  };

  const handleSemesterSelect = (sem: string | number) => {
    const semNumber = typeof sem === 'string' ? parseInt(sem.split(' ')[0]) : sem;
    
    setLastSelectedId(sem.toString());
    setSelectedSemester(semNumber);
    fetchSubjects(selectedUni._id, selectedBranch, semNumber);
    setTimeout(() => {
      setDirection(1);
      setStep(4);
      setLastSelectedId(null);
    }, 400);
  };

  const fetchSubjects = async (uniId: string, branch: string, sem: number) => {
    setIsFetchingSubjects(true);
    try {
      const queryUrl = `/courses?domain=university&university=${uniId}&branch=${encodeURIComponent(branch)}&semester=${sem}`;
      const { data } = await api.get(queryUrl);
      setFetchedSubjects(data.data);
    } catch (error: any) {
      console.error("Failed to fetch subjects.", error);
    } finally {
      setIsFetchingSubjects(false);
    }
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

  if (isCoding) {
    return (
      <section className="w-full bg-[#161616] flex flex-col items-center overflow-hidden transition-colors duration-500 pt-[80px] lg:pt-[100px]">
        <div className="w-full h-0 border-t border-slate-800" />

        <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-24 flex flex-col justify-center items-center gap-10 lg:gap-14">
          
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
                  <Link key={course._id} href={`/courses/${course._id}`} className="flex flex-col group outline-none cursor-pointer">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ delay: idx * 0.1, duration: 0.6, ease: customEase }}
                      className="flex-1 w-full relative p-5 lg:p-6 bg-stone-950 rounded-xl flex flex-col justify-between items-start border border-white/5 transition-all duration-300 overflow-hidden"
                    >
                      <div className="w-32 h-32 absolute -right-10 -bottom-10 bg-[#FE6100] opacity-20 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none z-0" />
                      <div className="w-32 h-32 absolute -right-10 top-1/4 bg-[#FE6100] opacity-20 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none z-0" />
                      
                      <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-10 z-10 h-full w-full">
                        <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                          
                          <div className="w-full aspect-video rounded-lg bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0 relative z-10">
                            <img 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              src={course.thumbnail?.url || "https://placehold.co/360x203"} 
                              alt={course.title} 
                            />
                          </div>
                          
                          <div className="self-stretch flex flex-col justify-start items-start gap-4 lg:gap-5 w-full relative z-10">
                            <div className="self-stretch flex justify-start items-start gap-2 flex-wrap w-full">
                              {course.tags?.map((tag: string) => (
                                <div key={tag} className="px-3 py-1.5 bg-white/10 rounded-[100px] flex flex-col justify-start items-start backdrop-blur-sm border border-transparent">
                                  <div className="text-center text-gray-200 text-xs lg:text-sm font-normal font-['Helvena']">{tag}</div>
                                </div>
                              ))}
                            </div>
                            
                            <h3 className="self-stretch text-white text-xl lg:text-2xl font-medium font-['Helvena'] tracking-wide leading-tight line-clamp-2 w-full">
                              {course.title}
                            </h3>
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col justify-end items-start gap-5 mt-auto w-full relative z-10">
                          <div className="flex flex-col justify-center items-start gap-1 w-full">
                            <div className="text-white text-2xl lg:text-3xl font-medium font-sans">₹{course.price}</div>
                            {course.mrp > course.price && (
                              <div className="flex items-center flex-wrap gap-1.5 lg:gap-2">
                                <span className="text-white/60 text-xs lg:text-sm font-normal font-['Helvena'] line-through">MRP ₹{course.mrp}</span>
                                <span className="text-[#FE6100] text-xs lg:text-sm font-semibold font-['Helvena']">({discountPercent}% off)</span>
                              </div>
                            )}
                          </div>
                          <div className="self-stretch flex justify-start items-start gap-3 lg:gap-4 w-full">
                            <button className="flex-1 w-full h-11 px-4 lg:px-6 bg-[#FE6100] hover:bg-orange-700 transition-colors rounded-lg flex justify-center items-center gap-2 shadow-md cursor-pointer">
                              <span className="text-white text-base font-medium font-['Helvena'] whitespace-nowrap">Check Course</span>
                              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
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
        <div className="self-stretch h-0 outline outline-[1.40px] outline-slate-800" />
      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen w-full bg-neutral-50 flex flex-col items-center pt-[80px] lg:pt-[100px]">
        <div className="w-full h-0 border-t border-gray-300" />

        <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-20 flex flex-col items-center gap-10 lg:gap-14">
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
                      className="p-2 hover:bg-neutral-100 active:scale-90 rounded-full transition-all outline outline-1 outline-gray-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6 text-black" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <h3 className="text-neutral-950 text-xl md:text-3xl font-semibold font-['Helvena'] tracking-tight">
                  {step === 1 && "Choose your university"}
                  {step === 2 && "Select your branch"}
                  {step === 3 && "Which semester?"}
                  {step === 4 && "Your Subjects"}
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
              {step === 4 && selectedUni && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold outline outline-1 outline-indigo-100">
                  <span>{selectedUni.name}</span>
                  <span className="text-indigo-300">•</span>
                  <span>{selectedBranch}</span>
                  <span className="text-indigo-300">•</span>
                  <span>Sem {selectedSemester}</span>
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
                              if (uni.isReady) handleUniSelect(uni);
                              else setIsRequestPopupOpen(true);
                            }}
                            className={`relative p-4 md:p-6 rounded-2xl md:rounded-[28px] outline transition-all duration-300 ease-out flex flex-col gap-6 md:gap-8 group cursor-pointer ${
                              !uni.isReady ? 'opacity-70 hover:opacity-100 outline-1 outline-gray-200 bg-gray-50 hover:shadow-md' :
                              lastSelectedId === uni._id 
                              ? 'outline-2 outline-[#FE6100] bg-[#FE6100]/5 shadow-md' 
                              : 'outline-1 outline-gray-200 hover:outline-[#FE6100]/30 hover:shadow-lg bg-white'
                            }`}
                          >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-50 flex items-center justify-center rounded-xl md:rounded-2xl outline outline-1 outline-gray-100 shadow-sm overflow-hidden">
                              <img src={uni.logo?.url || "/placeholder.png"} alt="logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                            </div>
                            <div className="flex flex-col gap-1.5 pr-4">
                              <h4 className="text-neutral-950 text-base md:text-lg font-bold font-['Helvena'] line-clamp-2 leading-snug">{uni.name}</h4>
                              <p className="text-gray-500 font-['Helvena'] text-xs md:text-sm font-medium">{uni.location}</p>
                              
                              <p className={`${uni.isReady ? 'text-[#FE6100]' : 'text-gray-500'} font-['Helvena'] text-[11px] md:text-sm font-bold tracking-wide mt-1 md:mt-2`}>
                                {uni.isReady ? (
                                  <span className="flex items-center">
                                    Explore Now <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                  </span>
                                ) : (
                                  uni.stats || `Notify me when ${uni.name} is ready`
                                )}
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
                          className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Request this University
                        </button>
                      </div>
                    )
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {selectedUni?.branches?.length > 0 ? (
                        selectedUni.branches.map((branch: string) => (
                          <button 
                            key={branch}
                            onClick={() => handleBranchSelect(branch)}
                            className={`p-5 md:p-8 rounded-2xl md:rounded-[28px] outline outline-1 outline-gray-200 hover:outline-[#FE6100]/30 hover:shadow-lg font-['Helvena'] text-base md:text-xl text-left font-semibold transition-all duration-300 flex justify-between items-center cursor-pointer group ${
                              lastSelectedId === branch ? 'outline-2 outline-[#FE6100] bg-[#FE6100]/5 shadow-md' : 'bg-white'
                            }`}
                          >
                            {branch}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${lastSelectedId === branch ? 'bg-[#FE6100]' : 'bg-neutral-100 group-hover:bg-[#FE6100]/10'}`}>
                              <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${lastSelectedId === branch ? 'text-white' : 'text-gray-400 group-hover:text-[#FE6100]'}`} strokeWidth={3} />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full flex flex-col justify-center items-center py-20 text-center">
                          <Layers className="w-12 h-12 text-gray-300 mb-4" />
                          <h3 className="text-gray-900 text-xl font-semibold">No branches configured</h3>
                          <p className="text-gray-500 mt-1">Check back later or contact support.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {semesters.map((sem) => (
                        <button 
                          key={sem}
                          onClick={() => handleSemesterSelect(sem)}
                          className={`py-8 md:py-12 rounded-2xl md:rounded-[28px] outline outline-1 outline-gray-200 hover:outline-[#FE6100]/30 hover:shadow-lg font-['Helvena'] text-2xl md:text-4xl font-bold transition-all duration-300 cursor-pointer ${
                            lastSelectedId === sem.toString() ? 'outline-2 outline-[#FE6100] bg-[#FE6100]/5 text-[#FE6100] shadow-md' : 'bg-white text-neutral-900'
                          }`}
                        >
                          {sem.split(' ')[0]}
                          <span className="block text-xs md:text-sm font-semibold text-gray-400 mt-2 tracking-widest uppercase">Semester</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="w-full min-h-[300px]">
                      {isFetchingSubjects ? (
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
                      ) : fetchedSubjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {fetchedSubjects.map((course, idx) => {
                            const discountPercent = course.mrp > course.price 
                              ? Math.round(((course.mrp - course.price) / course.mrp) * 100) : 0;

                            return (
                              <Link key={course._id} href={`/courses/${course._id}`} className="flex flex-col group outline-none cursor-pointer">
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.5 }}
                                  className="w-full bg-white outline outline-1 outline-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:outline-[#FE6100]/30 transition-all duration-300 flex flex-col h-full cursor-pointer"
                                >
                                  <div className="w-full aspect-video bg-gray-100 overflow-hidden relative">
                                    <img 
                                      src={course.thumbnail?.url || "https://placehold.co/360x203"} 
                                      alt={course.title} 
                                      className="w-full h-full object-cover" 
                                    />
                                    {course.price === 0 && (
                                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">FREE</div>
                                    )}
                                  </div>
                                  
                                  <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-2 mb-2 font-['Helvena']">{course.title}</h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {course.tags?.slice(0, 2).map((tag: string) => (
                                        <span key={tag} className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{tag}</span>
                                      ))}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="text-gray-900 font-bold text-xl">₹{course.price}</span>
                                        {course.mrp > course.price && (
                                          <span className="text-xs text-gray-400 line-through">MRP ₹{course.mrp}</span>
                                        )}
                                      </div>
                                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
                          <h3 className="text-gray-900 text-2xl font-bold font-['Helvena']">Syllabus arriving soon</h3>
                          <p className="text-gray-500 mt-2 max-w-md">We are currently preparing the exact modules and previous year questions for {selectedUni?.name} - {selectedBranch} (Sem {selectedSemester}).</p>
                          <button onClick={() => setIsRequestPopupOpen(true)} className="mt-6 cursor-pointer">
                            <div className={`font-['Helvena'] text-sm font-bold tracking-wide text-[#FE6100] px-6 py-2.5 bg-[#FE6100]/10 hover:bg-[#FE6100]/20 rounded-lg transition-colors`}>
                              Notify me when ready
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-3 md:gap-4 mt-4 z-10">
            <div className="px-4 py-1.5 bg-gray-200/50 rounded-full text-gray-500 text-xs md:text-sm font-semibold font-['Helvena'] tracking-wide uppercase">
              🚀 Adding 20+ universities through 2026
            </div>
            <button 
              onClick={() => setIsRequestPopupOpen(true)}
              className="text-indigo-600 text-sm md:text-lg font-bold font-['Helvena'] flex items-center gap-2 hover:text-indigo-800 transition-colors group cursor-pointer"
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
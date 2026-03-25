'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, BookOpen, Loader2, PlayCircle, Compass, ArrowRight, Star } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import api from '@/services/api';

export default function ClassroomPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const user = useAppSelector((state: any) => state.app.user);
  
  const [activeTab, setActiveTab] = useState<'engineering' | 'coding'>(isCoding ? 'coding' : 'engineering');
  
  // States
  const [engineeringEnrollments, setEngineeringEnrollments] = useState<any[]>([]);
  const [codingEnrollments, setCodingEnrollments] = useState<any[]>([]);
  
  const [engineeringRecs, setEngineeringRecs] = useState<any[]>([]);
  const [codingRecs, setCodingRecs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch User's Active Enrollments
        const { data: enrollData } = await api.get('/courses/my-enrollments'); 
        let enrolledIds: string[] = [];

        if (enrollData.success) {
          const eng = enrollData.data.filter((c: any) => c.course?.domain === 'university');
          const cod = enrollData.data.filter((c: any) => c.course?.domain === 'coding');
          setEngineeringEnrollments(eng);
          setCodingEnrollments(cod);
          enrolledIds = enrollData.data.map((e: any) => e.course?._id).filter(Boolean);
        }

        // 2. Fetch Recommendations dynamically using your existing advancedResults middleware
        // For Engineering: Target their specific semester (Default to 1 if unknown)
        const userSemester = user?.semester || 1;
        const engReq = api.get(`/courses?domain=university&semester=${userSemester}&limit=8`);
        
        // For Coding: Get the newest cohorts
        const codReq = api.get(`/courses?domain=coding&sort=-createdAt&limit=8`);

        const [engRes, codRes] = await Promise.all([engReq, codReq]);

        // Filter out courses the user is already enrolled in, then strictly limit to 3
        if (engRes.data.success) {
          const filteredEng = engRes.data.data.filter((c: any) => !enrolledIds.includes(c._id)).slice(0, 3);
          setEngineeringRecs(filteredEng);
        }

        if (codRes.data.success) {
          const filteredCod = codRes.data.data.filter((c: any) => !enrolledIds.includes(c._id)).slice(0, 3);
          setCodingRecs(filteredCod);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.semester]);

  // Theme Variables
  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-600";
  const borderTheme = isCoding ? "border-white/10" : "border-gray-200";
  const cardBg = isCoding ? "bg-[#1C1C1C] border border-white/10 shadow-xl" : "bg-white shadow-[0px_8px_30px_rgba(0,0,0,0.04)] border border-transparent";

  const activeEnrollments = activeTab === 'engineering' ? engineeringEnrollments : codingEnrollments;
  const activeRecommendations = activeTab === 'engineering' ? engineeringRecs : codingRecs;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center pt-[100px] lg:pt-[140px] pb-14 ${bgTheme} font-['Helvena'] transition-colors duration-500`}>
      
      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 flex flex-col justify-start items-start gap-8 lg:gap-12">
        
        {/* Page Title */}
        <div className="flex flex-col gap-2">
          <h1 className={`${textMain} text-3xl md:text-4xl font-['Libre_Baskerville'] italic`}>
            My Dashboard
          </h1>
          <p className={`${textSub} text-sm md:text-base`}>Pick up right where you left off.</p>
        </div>

        {/* --- TABS --- */}
        <div className="w-full flex flex-col gap-8 lg:gap-12">
          <div className={`w-full border-b ${borderTheme} flex justify-start items-start gap-8`}>
            <LayoutGroup>
              {[
                { id: 'engineering', label: 'Engineering Courses' },
                { id: 'coding', label: 'Coding Courses' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="pb-3 relative flex flex-col items-center sm:items-start whitespace-nowrap outline-none flex-1 sm:flex-none"
                >
                  <span className={`${activeTab === tab.id ? 'text-[#FE6100]' : `${textSub} hover:${textMain}`} text-sm sm:text-base font-medium transition-colors z-10 relative`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="classroomTabIndicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#FE6100] z-20" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                </button>
              ))}
            </LayoutGroup>
          </div>

          {isLoading ? (
            <div className="w-full flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#FE6100] animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="w-full flex flex-col gap-16"
              >
                
                {/* ========================================== */}
                {/* SECTION 1: CONTINUE LEARNING (ENROLLED)    */}
                {/* ========================================== */}
                <div className="w-full flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCoding ? 'bg-white/5' : 'bg-orange-50'}`}>
                      <PlayCircle className={`w-5 h-5 ${isCoding ? 'text-gray-300' : 'text-[#FE6100]'}`} />
                    </div>
                    <h2 className={`${textMain} text-xl md:text-2xl font-bold`}>Continue Learning</h2>
                  </div>

                  {activeEnrollments.length > 0 ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                      {activeEnrollments.map((enrollment) => (
                        <Link key={enrollment._id} href={`/classroom/${enrollment.course?._id}`}>
                          <div className={`group flex-1 p-4 lg:p-5 relative rounded-2xl flex flex-col justify-start items-start overflow-hidden outline outline-1 transition-all duration-300 hover:-translate-y-1 ${isCoding ? 'bg-[#1C1C1C] outline-white/10 hover:outline-white/30' : 'bg-white outline-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'}`}>
                            
                            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-200 mb-5 relative">
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={enrollment.course?.thumbnail?.url || "https://placehold.co/400x225"} alt={enrollment.course?.title} />
                              
                              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                  <PlayCircle className="w-6 h-6 text-white fill-white/20" />
                                </div>
                              </div>
                            </div>
                            
                            <h3 className={`${textMain} text-lg font-bold line-clamp-2 mb-2 group-hover:text-[#FE6100] transition-colors`}>
                              {enrollment.course?.title || 'Unknown Course'}
                            </h3>
                            <p className={`${textSub} text-sm mb-6`}>Instructor: {enrollment.course?.instructor?.name || 'Edvara Expert'}</p>
                            
                            {/* Progress Tracker */}
                            <div className="w-full flex flex-col gap-2 mt-auto">
                              <div className="flex justify-between items-end">
                                <span className={`${textMain} text-xs font-medium uppercase tracking-wider`}>Overall Progress</span>
                                <span className="text-[#FE6100] text-xs font-bold">{enrollment.progress || 0}%</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${isCoding ? 'bg-white/10' : 'bg-orange-100'}`}>
                                <div className="h-full bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-full transition-all duration-1000" style={{ width: `${enrollment.progress || 0}%` }} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className={`w-full p-8 md:p-12 rounded-2xl flex flex-col justify-center items-center gap-5 ${isCoding ? 'bg-white/5 border border-white/10' : 'bg-white shadow-sm border border-gray-100'}`}>
                      <div className="w-16 h-16 rounded-full bg-[#FE6100]/10 flex justify-center items-center">
                        <BookOpen className="w-8 h-8 text-[#FE6100]" />
                      </div>
                      <div className="flex flex-col justify-center items-center gap-1 text-center">
                        <h3 className={`${textMain} text-xl font-semibold`}>Your learning journey begins here</h3>
                        <p className={`${textSub} text-sm md:text-base font-normal max-w-md`}>You haven't enrolled in any {activeTab} courses yet. Browse our recommendations below to get started.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ========================================== */}
                {/* SECTION 2: RECOMMENDATIONS                 */}
                {/* ========================================== */}
                {activeRecommendations.length > 0 && (
                  <div className="w-full flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isCoding ? 'bg-white/5' : 'bg-indigo-50'}`}>
                        <Compass className={`w-5 h-5 ${isCoding ? 'text-gray-300' : 'text-indigo-600'}`} />
                      </div>
                      <h2 className={`${textMain} text-xl md:text-2xl font-bold`}>
                        {activeTab === 'engineering' ? `Recommended for Semester ${user?.semester || 1}` : 'Latest Bootcamps'}
                      </h2>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                      {activeRecommendations.map((course, idx) => {
                        const discountPercent = course.mrp > course.price 
                          ? Math.round(((course.mrp - course.price) / course.mrp) * 100) 
                          : 0;

                        return (
                          <Link key={course._id} href={`/courses/${course._id}`} className="flex flex-col group outline-none">
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.6 }}
                              className={`flex-1 w-full relative rounded-2xl flex flex-col justify-start items-start overflow-hidden group-hover:-translate-y-1 transition-all duration-300 ${cardBg}`}
                            >
                              {isCoding && (
                                <>
                                  <div className="w-32 h-32 absolute -bottom-10 -right-10 bg-[#FE6100] opacity-20 rounded-full blur-[70px] pointer-events-none z-0" />
                                  <div className="w-32 h-32 absolute -top-10 -left-10 bg-[#FE6100] opacity-10 rounded-full blur-[70px] pointer-events-none z-0" />
                                </>
                              )}
                              
                              <div className="w-full aspect-[16/10] bg-[#2A2A2A] overflow-hidden relative z-10 shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                                <img 
                                  className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out" 
                                  src={course.thumbnail?.url || "https://placehold.co/360x203"} 
                                  alt={course.title} 
                                />
                              </div>
                              
                              <div className="w-full p-5 sm:p-6 flex flex-col justify-start items-start gap-6 relative z-10 h-full">
                                
                                <div className="w-full flex flex-col gap-3">
                                  <div className="flex justify-start items-start gap-2 flex-wrap">
                                    {course.tags?.slice(0, 2).map((tag: string) => (
                                      <div key={tag} className={`px-3 py-1 rounded-[100px] flex flex-col justify-start items-start backdrop-blur-sm ${isCoding ? 'bg-white/10' : 'bg-neutral-100'}`}>
                                        <div className={`text-center text-xs font-medium font-['Helvena'] ${isCoding ? 'text-gray-200' : 'text-gray-600'}`}>{tag}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <h3 className={`${textMain} text-lg md:text-xl font-bold font-['Helvena'] leading-snug line-clamp-2 group-hover:text-[#FE6100] transition-colors`}>
                                    {course.title}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className={`${textMain} text-xs font-semibold`}>{course.averageRating ? course.averageRating.toFixed(1) : '0.0'}</span>
                                    <span className={`${textSub} text-xs ml-1`}>({course.numOfReviews || 0} Reviews)</span>
                                  </div>
                                </div>

                                <div className="w-full flex flex-col gap-4 mt-auto border-t border-gray-500/20 pt-4">
                                  <div className="flex items-end justify-between w-full">
                                    <div className="flex flex-col justify-center items-start gap-0.5">
                                      <div className={`${textMain} text-2xl font-bold font-sans`}>₹{course.price}</div>
                                      {course.mrp > course.price && (
                                        <div className="flex items-center flex-wrap gap-1.5">
                                          <span className={`${textSub} text-xs font-normal line-through`}>MRP ₹{course.mrp}</span>
                                          <span className="text-[#FE6100] text-xs font-bold">({discountPercent}% off)</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCoding ? 'bg-white/10 group-hover:bg-[#FE6100]' : 'bg-neutral-100 group-hover:bg-[#FE6100]'}`}>
                                      <ArrowRight className={`w-4 h-4 transition-colors ${isCoding ? 'text-white' : 'text-gray-600 group-hover:text-white'}`} strokeWidth={2.5} />
                                    </div>
                                  </div>
                                </div>
                                
                              </div>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
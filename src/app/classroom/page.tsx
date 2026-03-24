'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import api from '@/services/api';

export default function ClassroomPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [activeTab, setActiveTab] = useState<'engineering' | 'coding'>(isCoding ? 'coding' : 'engineering');
  
  const [engineeringCourses, setEngineeringCourses] = useState<any[]>([]);
  const [codingCourses, setCodingCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        // Fetch the user's profile which includes their enrollments (if your backend populates it)
        // Alternatively, if you built an /api/v1/enrollments/me route, hit that instead.
        // For this example, assuming we fetch courses they own:
        const { data } = await api.get('/courses/my-enrollments'); 
        
        if (data.success) {
          const eng = data.data.filter((c: any) => c.course.domain === 'university');
          const cod = data.data.filter((c: any) => c.course.domain === 'coding');
          setEngineeringCourses(eng);
          setCodingCourses(cod);
        }
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-600";
  const borderTheme = isCoding ? "border-white/10" : "border-gray-200";

  const currentCourses = activeTab === 'engineering' ? engineeringCourses : codingCourses;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center pt-[100px] lg:pt-[140px] pb-14 ${bgTheme} font-['Helvena'] transition-colors duration-500`}>
      
      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 flex flex-col justify-start items-start gap-8 lg:gap-10">
        <h1 className={`${textMain} text-2xl md:text-3xl lg:text-4xl font-bold`}>My Classroom</h1>

        <div className="w-full flex flex-col gap-6 lg:gap-8">
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

          <div className="w-full min-h-[300px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="w-full flex justify-center py-20">
                  <Loader2 className="w-10 h-10 text-[#FE6100] animate-spin" />
                </div>
              ) : currentCourses.length > 0 ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                  className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                >
                  {currentCourses.map((enrollment) => (
                    <Link key={enrollment._id} href={`/classroom/${enrollment.course._id}`}>
                      <div className={`group flex-1 p-4 lg:p-5 relative rounded-xl inline-flex flex-col justify-start items-start overflow-hidden outline outline-1 transition-all duration-300 hover:-translate-y-1 ${isCoding ? 'bg-[#1C1C1C] outline-white/10 hover:outline-white/30' : 'bg-white outline-gray-200 hover:shadow-lg'}`}>
                        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 mb-4">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={enrollment.course.thumbnail?.url || "https://placehold.co/400x225"} alt={enrollment.course.title} />
                        </div>
                        <h3 className={`${textMain} text-lg font-bold line-clamp-2 mb-2`}>{enrollment.course.title}</h3>
                        <p className={`${textSub} text-sm mb-4`}>Instructor: {enrollment.course.instructor?.name || 'Edvara Expert'}</p>
                        
                        <div className="w-full flex flex-col gap-2 mt-auto">
                          <div className="flex justify-between items-end">
                            <span className={`${textMain} text-xs font-medium`}>Progress</span>
                            <span className="text-indigo-500 text-xs font-medium">{enrollment.progress || 0}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isCoding ? 'bg-white/10' : 'bg-indigo-50'}`}>
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${enrollment.progress || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                  className={`w-full p-8 md:p-12 rounded-xl flex flex-col justify-center items-center gap-6 ${isCoding ? 'bg-white/5 border border-white/10' : 'bg-white shadow-sm border border-gray-100'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#FE6100]/10 flex justify-center items-center mb-2">
                    <BookOpen className="w-8 h-8 text-[#FE6100]" />
                  </div>
                  <div className="flex flex-col justify-center items-center gap-2 text-center">
                    <h2 className={`${textMain} text-xl md:text-2xl font-normal font-['Libre_Baskerville'] italic`}>No {activeTab} courses yet</h2>
                    <p className={`${textSub} text-sm md:text-base font-normal`}>Start learning {activeTab} and get placement ready.</p>
                  </div>
                  <Link href="/courses">
                    <button className="h-11 px-6 bg-[#FE6100] hover:bg-orange-700 transition-colors rounded-lg flex justify-center items-center gap-2 shadow-md mt-2">
                      <span className="text-white text-sm font-medium">Explore Courses</span>
                      <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
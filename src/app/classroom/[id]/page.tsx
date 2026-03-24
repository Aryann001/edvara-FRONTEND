'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import api from '@/services/api';
import { 
  PlayCircle, CheckCircle2, Lock, ChevronDown, ChevronUp, 
  FileText, Eye, Download, Loader2, AlertCircle, Maximize, Settings, SkipForward
} from 'lucide-react';

export default function CoursePlayerPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const user = useAppSelector((state: any) => state.app.user); 
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player States
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'pyqs'>('content');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [watermark, setWatermark] = useState({ top: '10%', left: '10%', visible: false, trace: null as any });

  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch Course & Syllabus
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await api.get(`/courses/${courseId}`);
        setCourse(data.data);
        
        // Auto-expand first folder
        if (data.data.lectures && data.data.lectures.length > 0) {
          const firstFolder = data.data.lectures[0].folderName || 'General';
          setExpandedUnits({ [firstFolder]: true });
          // Optionally auto-select first lecture
          handleSelectLecture(data.data.lectures[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // Fetch individual lecture (Triggers Anti-Piracy Check)
  const handleSelectLecture = async (lectureMeta: any) => {
    if (!lectureMeta.isFree && !course.isEnrolled) {
      // Basic check, actual validation happens on backend
      // alert("Please enroll to watch this lecture.");
      // return;
    }
    
    try {
      const { data } = await api.get(`/lectures/${lectureMeta._id}`);
      if (data.success) {
        setActiveLecture(data.data);
        setWatermark(prev => ({ ...prev, trace: data.trace })); // Save trace data for watermark
        
        // On mobile, scroll up to player
        if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load video stream.');
    }
  };

  // Watermark randomizer logic
  useEffect(() => {
    if (!activeLecture || !watermark.trace) return;
    
    const interval = setInterval(() => {
      const show = Math.random() > 0.6; 
      if (show) {
        setWatermark(prev => ({
          ...prev,
          top: `${Math.floor(Math.random() * 60) + 15}%`, 
          left: `${Math.floor(Math.random() * 50) + 10}%`, 
          visible: true
        }));
        setTimeout(() => setWatermark(prev => ({ ...prev, visible: false })), 3000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeLecture, watermark.trace]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && activeTab === 'content') setActiveTab('notes');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const toggleUnit = (folder: string) => {
    setExpandedUnits(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-600";
  const borderTheme = isCoding ? "border-white/10" : "border-gray-200";
  const cardBg = isCoding ? "bg-[#1C1C1C] border border-white/10 shadow-lg" : "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100";
  const innerBg = isCoding ? "bg-white/5" : "bg-neutral-100";

  if (isLoading) {
    return <div className={`min-h-screen w-full flex justify-center items-center ${bgTheme}`}><Loader2 className="w-10 h-10 text-[#FE6100] animate-spin" /></div>;
  }

  if (error || !course) {
    return (
      <div className={`min-h-screen w-full flex flex-col justify-center items-center gap-4 ${bgTheme}`}>
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className={`${textMain} text-2xl font-semibold`}>Access Denied</h2>
        <p className={textSub}>{error}</p>
        <button onClick={() => router.push('/classroom')} className="px-6 py-2 mt-4 bg-[#FE6100] text-white rounded-lg">Back to Classroom</button>
      </div>
    );
  }

  // Group lectures
  const groupedLectures = course.lectures?.reduce((acc: any, lecture: any) => {
    const folder = lecture.folderName || 'General';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(lecture);
    return acc;
  }, {}) || {};

  const CourseContentBlock = () => (
    <div className={`w-full rounded-md overflow-hidden flex flex-col ${borderTheme}`}>
      {Object.keys(groupedLectures).map((folderName, index) => {
        const lectures = groupedLectures[folderName];
        return (
          <div key={folderName} className={`w-full flex flex-col ${index !== Object.keys(groupedLectures).length - 1 ? `border-b ${borderTheme}` : ''}`}>
            <button onClick={() => toggleUnit(folderName)} className={`w-full p-4 flex justify-between items-center transition-colors ${innerBg} hover:opacity-80`}>
              <div className="flex items-center gap-3">
                {expandedUnits[folderName] ? <ChevronUp className={`w-4 h-4 ${textMain}`} /> : <ChevronDown className={`w-4 h-4 ${textMain}`} />}
                <span className={`${textMain} text-sm sm:text-base font-medium text-left`}>{folderName}</span>
              </div>
              <span className={`${textSub} text-xs font-medium shrink-0`}>{lectures.length} Lectures</span>
            </button>

            <AnimatePresence initial={false}>
              {expandedUnits[folderName] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className={`w-full flex flex-col overflow-hidden ${isCoding ? 'bg-[#1C1C1C]' : 'bg-white'}`}
                >
                  {lectures.map((lecture: any) => {
                    const isActive = activeLecture?._id === lecture._id;
                    const isLocked = !lecture.isFree && !course.isEnrolled;

                    return (
                      <div 
                        key={lecture._id} 
                        onClick={() => handleSelectLecture(lecture)}
                        className={`w-full pl-5 pr-4 py-3.5 flex justify-between items-center border-t ${borderTheme} ${isActive ? (isCoding ? 'bg-[#FE6100]/10 border-l-2 border-l-[#FE6100]' : 'bg-orange-50 border-l-2 border-l-[#FE6100]') : 'border-l-2 border-l-transparent hover:bg-black/5 cursor-pointer'}`}
                      >
                        <div className="flex-1 flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {isActive ? <PlayCircle className="w-4 h-4 text-[#FE6100] fill-[#FE6100]/20" /> : isLocked ? <Lock className={`w-4 h-4 ${textSub}`} /> : <PlayCircle className={`w-4 h-4 ${textSub}`} />}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`${textMain} text-sm font-medium line-clamp-2`}>{lecture.title}</span>
                            {isActive && <span className={`${textSub} text-xs font-normal`}>Now Playing • {lecture.duration || 0} mins</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen w-full pt-[100px] lg:pt-[130px] pb-14 flex justify-center ${bgTheme} font-['Helvena'] transition-colors duration-500`}>
      <div className="w-full max-w-[1440px] px-4 md:px-8 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-start gap-8">
        
        {/* LEFT COLUMN: PLAYER */}
        <div className="flex-1 w-full flex flex-col gap-6 lg:gap-8">
          
          <div className="w-full relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg group">
            {activeLecture ? (
              <video 
                src={activeLecture.videoUrl} 
                controls controlsList="nodownload"
                className="w-full h-full object-cover"
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>Select a lecture from the syllabus to start</p>
              </div>
            )}
            
            <AnimatePresence>
              {watermark.visible && watermark.trace && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ top: watermark.top, left: watermark.left }}
                  className="absolute z-10 pointer-events-none select-none flex flex-col justify-center items-center opacity-40 mix-blend-overlay"
                >
                  <span className="text-white text-xs md:text-sm font-mono tracking-widest bg-black/40 px-2 py-1 rounded">
                    ID: {watermark.trace.viewerId}
                  </span>
                  <span className="text-white text-[10px] md:text-xs font-mono tracking-widest bg-black/40 px-2 py-1 rounded mt-1">
                    IP: {watermark.trace.viewerIp}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata */}
          <div className="w-full flex flex-col gap-4">
            <h1 className={`${textMain} text-xl md:text-2xl font-bold leading-tight`}>
              {activeLecture ? activeLecture.title : course.title}
            </h1>
            <p className={`${textSub} text-sm`}>{activeLecture ? activeLecture.description : course.description}</p>
          </div>

          {/* TABS */}
          <div ref={tabsRef} className="w-full flex flex-col gap-6 mt-2 scroll-mt-24">
            <div className={`w-full border-b ${borderTheme} flex items-center gap-6 sm:gap-8 no-scrollbar`}>
              <LayoutGroup>
                {[
                  { id: 'content', label: 'Course Content', mobileOnly: true },
                  { id: 'notes', label: 'Notes' },
                  { id: 'pyqs', label: 'PYQs' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 relative flex-col items-center outline-none whitespace-nowrap ${tab.mobileOnly ? 'flex lg:hidden' : 'flex'}`}
                  >
                    <span className={`${activeTab === tab.id ? 'text-[#FE6100]' : `${textSub} hover:${textMain}`} text-sm sm:text-base font-medium transition-colors z-10 relative`}>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="courseTabIndicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#FE6100] z-20" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    )}
                  </button>
                ))}
              </LayoutGroup>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'content' && (
                <motion.div key="content-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex lg:hidden flex-col gap-4">
                  <CourseContentBlock />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div key="notes-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col gap-4">
                  {course.notes?.map((note: any) => (
                    <div key={note._id} className={`w-full p-4 rounded-md outline outline-1 flex justify-between items-center ${isCoding ? 'bg-white/5 outline-white/10' : 'bg-white outline-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={20} />
                        <div>
                          <p className={`${textMain} text-sm font-medium`}>{note.title}</p>
                          <p className={`${textSub} text-xs mt-0.5`}>{note.fileSize || 'PDF Document'}</p>
                        </div>
                      </div>
                      <a href={note.pdfUrl} download target="_blank" rel="noreferrer" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors">
                        <Download size={18} />
                      </a>
                    </div>
                  ))}
                  {(!course.notes || course.notes.length === 0) && <p className={textSub}>No notes uploaded yet.</p>}
                </motion.div>
              )}

              {activeTab === 'pyqs' && (
                <motion.div key="pyqs-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col gap-4">
                  {course.pyqs?.map((pyq: any) => (
                    <div key={pyq._id} className={`w-full p-4 rounded-md outline outline-1 flex justify-between items-center ${isCoding ? 'bg-white/5 outline-white/10' : 'bg-white outline-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <FileText className="text-purple-500" size={20} />
                        <div>
                          <p className={`${textMain} text-sm font-medium`}>{pyq.title}</p>
                          <p className={`${textSub} text-xs mt-0.5`}>{pyq.fileSize || 'PDF Document'}</p>
                        </div>
                      </div>
                      <a href={pyq.pdfUrl} download target="_blank" rel="noreferrer" className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors">
                        <Download size={18} />
                      </a>
                    </div>
                  ))}
                  {(!course.pyqs || course.pyqs.length === 0) && <p className={textSub}>No PYQs uploaded yet.</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Syllabus */}
        <div className={`hidden lg:flex w-full lg:w-[380px] xl:w-[420px] rounded-xl flex-col p-4 sm:p-5 gap-4 shrink-0 ${cardBg}`}>
          <h2 className={`${textMain} text-xl font-semibold`}>Course Content</h2>
          <CourseContentBlock />
        </div>

      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Mail, Loader2, User, Clock, ChevronRight, Play, BookOpen, Download } from 'lucide-react';
import api from '@/services/api';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Extract params from URL
  const courseId = searchParams.get('courseId');
  const txId = searchParams.get('tx');

  const [countdown, setCountdown] = useState(5);
  const [course, setCourse] = useState<any>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  // Fetch Course details to show in success card
  useEffect(() => {
    if (courseId) {
      api.get(`/courses/${courseId}`).then((res) => {
        setCourse(res.data.data);
      }).catch(err => console.error("Error fetching course", err));
    }
  }, [courseId]);

  // Auto-Redirect Logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(`/classroom/${courseId}`); // Redirects straight to the course player
    }
  }, [countdown, router, courseId]);

  // --- THEME CONSTANTS ---
  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const cardBg = isCoding ? "bg-[#1C1C1C] border border-white/10 shadow-2xl" : "bg-white shadow-[0px_8px_30px_rgba(0,0,0,0.04)]";
  const innerCardBg = isCoding ? "bg-white/5 border border-white/10" : "bg-white shadow-[0px_5px_15px_rgba(0,0,0,0.05)] border border-gray-100";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-600";
  const btnOutline = isCoding ? "border border-white/20 hover:bg-white/10 text-white" : "border border-neutral-200 hover:bg-neutral-50 text-black";

  return (
    <div className={`min-h-screen w-full flex justify-center items-start pt-[100px] lg:pt-[140px] pb-14 px-5 ${bgTheme} font-['Helvena'] transition-colors duration-500`}>
      <div className="w-full max-w-[800px] flex flex-col justify-center items-center gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`w-full p-5 sm:p-8 md:p-10 rounded-2xl flex flex-col justify-start items-center gap-8 ${cardBg}`}
        >
          <div className="w-full flex flex-col justify-center items-center gap-5 sm:gap-6">
            <img className="w-36 h-36 object-contain" src="/Done.gif" alt="Success Animation" />
            
            <div className="flex flex-col justify-center items-center gap-1.5 text-center">
              <h1 className={`${textMain} text-2xl sm:text-3xl font-normal italic font-['Libre_Baskerville']`}>
                Payment Successful 🎉
              </h1>
              <p className={`${textMain} text-base sm:text-lg font-normal`}>Your course is now unlocked</p>
              {txId && <p className={`${textSub} text-xs font-mono mt-1`}>TxID: {txId}</p>}
            </div>

            <div className="flex justify-center items-center gap-1.5 text-center">
              <Mail className={`w-4 h-4 ${textSub}`} />
              <span className={`${textSub} text-sm font-normal`}>A confirmation has been sent to your email.</span>
            </div>

            <div className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-700/10 border border-indigo-700/20 rounded-full inline-flex justify-center items-center gap-1.5">
              <Loader2 className="w-4 h-4 text-indigo-700 animate-spin" />
              <span className="text-indigo-700 text-xs sm:text-sm font-medium">
                Redirecting to your course in {countdown} seconds...
              </span>
            </div>
          </div>

          {course && (
            <div className={`w-full p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 ${innerCardBg}`}>
              <img className="w-full sm:w-28 h-40 sm:h-16 rounded-md sm:rounded-lg object-cover" src={course.thumbnail?.url || "https://placehold.co/286x160"} alt="Course" />
              <div className="flex-1 flex flex-col justify-start items-start gap-2 w-full">
                <h3 className={`${textMain} text-base sm:text-xl font-medium leading-6 line-clamp-1`}>{course.title}</h3>
                <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-1 sm:gap-3">
                  <div className="flex justify-start items-center gap-1.5">
                    <User className={`w-4 h-4 ${textSub}`} />
                    <span className={`${textSub} text-sm font-normal`}>Instructor: {course.mentorName}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => router.push(`/classroom/${courseId}`)} className="hidden sm:flex w-6 h-6 justify-center items-center rounded-full bg-[#FE6100]/10 hover:bg-[#FE6100]/20 transition-colors shrink-0">
                <ChevronRight className="w-4 h-4 text-[#FE6100]" />
              </button>
            </div>
          )}

          <div className="w-full flex flex-col gap-4">
            <button 
              onClick={() => router.push(`/classroom/${courseId}`)}
              className="w-full h-11 px-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] hover:opacity-90 transition-opacity rounded-lg flex justify-center items-center gap-2 shadow-md"
            >
              <span className="text-white text-sm sm:text-base font-medium">Start Learning</span>
              <Play className="w-4 h-4 text-white fill-white" />
            </button>
            
            <div className="w-full flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => invoiceUrl ? window.open(invoiceUrl, '_blank') : alert('Invoice generating, please check your email shortly.')}
                className={`w-full sm:flex-1 h-11 px-6 rounded-lg flex justify-center items-center gap-2 transition-colors ${btnOutline}`}
              >
                <span className="text-sm sm:text-base font-medium">Download Invoice</span>
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push('/classroom')}
                className={`w-full sm:flex-1 h-11 px-6 rounded-lg flex justify-center items-center gap-2 transition-colors ${btnOutline}`}
              >
                <span className="text-sm sm:text-base font-medium">Go to My Classroom</span>
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
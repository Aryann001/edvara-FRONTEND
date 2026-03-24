'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

export interface CourseCardProps {
  title: string;
  instructor: string;
  progressPercent: number;
  progressText: string;
  thumbnail: string;
  isCoding: boolean;
}

export default function CourseCard({ title, instructor, progressPercent, progressText, thumbnail, isCoding }: CourseCardProps) {
  const cardBg = isCoding ? 'bg-[#1C1C1C] border border-white/10' : 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-transparent';
  const textMain = isCoding ? 'text-white' : 'text-neutral-950';
  const textSub = isCoding ? 'text-gray-400' : 'text-gray-600';
  const progressTrack = isCoding ? 'bg-white/10' : 'bg-indigo-50';
  const progressFill = isCoding ? 'bg-indigo-500' : 'bg-indigo-700';

  return (
    <div className={`w-full relative rounded-xl overflow-hidden flex flex-col justify-start items-start group hover:-translate-y-1 transition-transform duration-300 ${cardBg}`}>
      
      {/* Orange Ambient Blur (Bottom Right) */}
      <div className={`w-32 h-32 absolute -bottom-10 -right-10 bg-[#FE6100] ${isCoding ? 'opacity-20' : 'opacity-10'} rounded-full blur-[70px] pointer-events-none z-0`} />

      {/* Thumbnail */}
      <div className="w-full aspect-video bg-neutral-200 overflow-hidden relative z-10 shrink-0">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={thumbnail} alt={title} />
      </div>

      {/* Content */}
      <div className="w-full p-5 sm:p-6 flex flex-col justify-start items-start gap-6 relative z-10 h-full">
        
        {/* Title & Instructor */}
        <div className="w-full flex flex-col gap-3">
          <h3 className={`${textMain} text-lg md:text-xl font-medium font-['Helvena'] leading-snug line-clamp-2`}>
            {title}
          </h3>
          <div className="flex justify-start items-center gap-1.5">
            <User className={`w-4 h-4 ${textSub}`} />
            <span className={`${textSub} text-sm font-normal font-['Helvena']`}>
              Instructor: {instructor}
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="w-full flex flex-col gap-2 mt-auto">
          <div className="w-full flex justify-between items-end">
            <span className={`${textMain} text-xs font-medium font-['Helvena']`}>Progress</span>
            <span className="text-indigo-500 text-xs font-medium font-['Helvena']">{progressPercent}% ({progressText})</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${progressTrack}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${progressFill}`} 
            />
          </div>
        </div>

        {/* Continue Button */}
        <button className="w-full h-11 bg-[#FE6100] hover:bg-orange-700 transition-colors rounded-lg flex justify-center items-center gap-2 shadow-md">
          <span className="text-white text-base font-medium font-['Helvena']">Continue</span>
          <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>

      </div>
    </div>
  );
}
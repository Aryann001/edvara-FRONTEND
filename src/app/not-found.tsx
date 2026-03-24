'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function NotFoundPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-500";
  const btnStyle = isCoding 
    ? "bg-white text-black hover:bg-gray-200" 
    : "bg-neutral-950 text-white hover:bg-neutral-800";

  return (
    <>
      {/* Pure CSS Animations + Failsafe to hide Navbar/Footer instantly */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Force hide any global navigations */
        nav, header, footer, .z-50 { display: none !important; }
        
        @keyframes float-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float-pulse 8s ease-in-out infinite; }
        .animate-enter-1 { animation: fade-slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-enter-2 { animation: fade-slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards; opacity: 0; }
        .animate-enter-3 { animation: fade-slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; opacity: 0; }
      `}} />

      {/* Massive Z-index to cover everything */}
      <main className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden ${bgTheme} font-['Helvena'] px-5`}>
        
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center z-0">
          <div className={`w-[40vw] h-[40vw] absolute rounded-full blur-[120px] animate-float ${isCoding ? 'bg-[#FE6100]/20' : 'bg-[#FE6100]/10'}`} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-2xl">
          
          <div className="relative flex justify-center items-center animate-enter-1">
            <h1 className={`text-[120px] md:text-[180px] font-bold leading-none tracking-tighter ${textMain}`}>
              4<span className="text-[#FE6100]">0</span>4
            </h1>
            <Compass className="absolute w-20 h-20 md:w-32 md:h-32 text-[#FE6100] opacity-20 -z-10" strokeWidth={1} />
          </div>

          <div className="flex flex-col gap-3 animate-enter-2">
            <h2 className={`text-2xl md:text-4xl font-normal font-['Libre_Baskerville'] italic ${textMain}`}>
              Out of syllabus?
            </h2>
            <p className={`text-base md:text-lg ${textSub} max-w-md mx-auto leading-relaxed`}>
              Looks like the page you are looking for has been moved, deleted, or never existed in the first place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto animate-enter-3">
            <Link href="/" className="w-full sm:w-auto">
              <button className={`w-full sm:w-auto h-12 px-8 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all active:scale-[0.98] group ${btnStyle}`}>
                <span className="text-base font-semibold">Back to Home</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>
            </Link>
            
            <Link href="/courses" className="w-full sm:w-auto">
              <button className={`w-full sm:w-auto h-12 px-8 rounded-xl outline outline-1 flex justify-center items-center gap-2 transition-all active:scale-[0.98] ${
                isCoding ? 'outline-white/20 text-white hover:bg-white/10' : 'outline-gray-300 text-black hover:bg-gray-100'
              }`}>
                <span className="text-base font-medium">Explore Courses</span>
              </button>
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
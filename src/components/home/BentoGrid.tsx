'use client';

import React from 'react';
import { BookOpen, Laptop, Terminal, Briefcase, Youtube } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

const engineerPreviews = [
  {
    title: "DBMS Exam Strategy",
    stats: "62 videos • 100k+ views",
    thumbnail: "/thumbnails/bentoGrid/01.webp"
  },
  {
    title: "Master Plan For All Semesters",
    stats: "28 videos • 50k+ views",
    thumbnail: "/thumbnails/bentoGrid/02.webp"
  },
  {
    title: "Complete Plan For Placement",
    stats: "5 videos • 34k+ views",
    thumbnail: "/thumbnails/bentoGrid/03.webp"
  }
];

const codingPreviews = [
  {
    title: "Coding junction - Launch",
    stats: "1 video • 4k+ views",
    thumbnail: "/thumbnails/bentoGrid/04.jpeg"
  },
  {
    title: "Java DSA for Placement",
    stats: "Coming Soon",
    thumbnail: "/thumbnails/coding/01.png"
  },
  {
    title: "Aptitude & Logical Reasoning",
    stats: "Coming Soon",
    thumbnail: "/thumbnails/coding/02.png"
  }
];

const BentoGrid = () => {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Dynamic Content Selection
  const previews = isCoding ? codingPreviews : engineerPreviews;
  const heroTitle = isCoding ? <>Beginner to<br />placement ready</> : <>Your journey<br />begins here</>;
  const journeyTitle = isCoding ? "Your Coding Journey" : "From first semester to first job";
  
  // FIXED: Learners/Universities now on new line
  const universityHeading = isCoding 
    ? <><span className="text-[#FE6100]">Pan-India</span> <br /> Learners</> 
    : <><span className="text-[#FE6100]">Pan-India</span> <br /> Universities</>;
  
  const journeySteps = isCoding 
    ? [
        { year: 'Step 1', text: 'Start with Basics', icon: <BookOpen size={16} /> },
        { year: 'Step 2', text: 'Learn DSA', icon: <Laptop size={18} /> },
        { year: 'Step 3', text: 'Build Projects', icon: <Terminal size={18} /> },
        { year: 'Step 4', text: 'Crack Placement', icon: <Briefcase size={18} /> }
      ]
    : [
        { year: 'Year 1', text: 'Foundations', icon: <BookOpen size={16} /> },
        { year: 'Year 2', text: 'Core Engineering', icon: <Laptop size={18} /> },
        { year: 'Year 3', text: 'Coding & Projects', icon: <Terminal size={18} /> },
        { year: 'Year 4', text: 'Placement Ready', icon: <Briefcase size={18} /> }
      ];

  // Theme Constants
  const sectionBg = isCoding ? 'bg-[#161616]' : 'bg-neutral-100';
  const cardBg = isCoding ? 'bg-stone-950' : 'bg-white';
  const textMain = isCoding ? 'text-white' : 'text-black';
  const textSub = isCoding ? 'text-white/70' : 'text-gray-500';
  const borderTheme = isCoding ? 'border-white/5' : 'border-gray-100';
  const lineTheme = isCoding ? 'bg-neutral-800' : 'bg-neutral-100';
  
  const sharedRadialBg = isCoding 
    ? { background: 'radial-gradient(circle at top left, rgba(254, 97, 0, 0.15) 0%, #0c0a09 85%)' } 
    : { background: 'radial-gradient(circle at top left, rgba(255, 223, 204, 0.15) 0%, #ffffff 85%)' };

  return (
    <section className={`w-full ${sectionBg} py-10 md:py-24 px-5 flex flex-col items-center gap-8 md:gap-14 overflow-hidden font-['Helvena'] transition-colors duration-500`}>
      {/* --- HEADER --- */}
      <div className="flex flex-col items-center text-center">
        <h2 className="text-[#FE6100] text-xl md:text-4xl font-normal font-['Libre_Baskerville'] italic leading-tight">
          Learn the skills
        </h2>
        <p className={`${textMain} text-3xl md:text-5xl font-medium leading-tight`}>
          Build The Future
        </p>
      </div>

      {/* --- BENTO GRID CONTAINER --- */}
      <div className="w-full max-w-[1200px] relative flex flex-col lg:grid lg:grid-cols-12 gap-5 md:gap-6">
        
        {/* ROW 1 (MOBILE) / BOX 2: HERO */}
        <div 
          className="order-1 w-full lg:col-span-6 lg:order-2 rounded-3xl p-8 lg:pt-10 flex flex-col items-center justify-center lg:justify-start text-center relative overflow-hidden min-h-[450px] lg:min-h-[350px]"
          style={{ 
            background: 'var(--hero-bg)' 
          }}
        >
          {/* RESTORED ORIGINAL GRADIENTS */}
          <style jsx>{`
            div {
              --hero-bg: radial-gradient(rgb(255, 223, 204) 0%, #FE6100 100%);
            }
            @media (min-width: 1024px) {
              div {
                --hero-bg: linear-gradient(180deg, #FE6100 75%, rgb(255, 223, 204) 100%);
              }
            }
          `}</style>

          <div className="relative z-10 flex flex-col items-center gap-6 lg:gap-1 w-full">
            <img src="/whitelogoforbentogrid.svg" alt="Edvara" className="w-28 md:w-40 h-auto" />
            
            <div className="lg:hidden relative w-full flex items-center justify-center shrink-0">
               <div className={`absolute w-screen h-[25px] ${lineTheme} z-0`} />
               <div className={`relative w-52 h-52 rounded-full border-[15px] ${isCoding ? 'border-stone-900' : 'border-neutral-100'} bg-white overflow-hidden z-10 shadow-none`}>
                  <img className="w-full h-full object-cover" src="/sachingridimage.png" alt="Owner" />
               </div>
            </div>

            <h2 className="text-white text-4xl md:text-6xl font-normal leading-tight">
              {heroTitle}
            </h2>
          </div>
        </div>

        {/* ROW 2 (MOBILE): SIDE-BY-SIDE CARDS */}
        <div className="order-2 w-full flex flex-row lg:contents gap-4">
          {/* Box 1: Students Learning */}
          <div 
            className={`flex-1 lg:col-span-3 lg:order-1 ${cardBg} rounded-3xl p-5 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm border ${borderTheme} min-h-[220px] md:min-h-[320px]`}
            style={sharedRadialBg}
          >
            <div className="relative z-10">
              <h3 className="text-[#FE6100] text-lg md:text-3xl font-bold">120K+</h3>
              <p className={`${textMain} text-sm md:text-2xl font-bold leading-tight`}>Students Learning</p>
            </div>
            <div className="relative mt-4 flex flex-col justify-end h-full">
              <p className={`${textSub} text-[10px] md:text-xs font-normal font-['Helvena'] mb-2`}>Across engineering colleges in India</p>
              <div className="flex items-center h-10 relative">
                <div className={`absolute left-0 right-0 h-[2px] ${lineTheme} z-0`} />
                <div className="flex -space-x-2 md:-space-x-3 relative z-10">
                   {[1,2,3,4].map((student, i) => (
                     <img src={`/students/s${student}.jpeg`}
                          alt={`Student ${student}`} key={i} className={`w-7 h-7 md:w-10 md:h-10 rounded-full border-2 ${isCoding ? 'border-stone-900' : 'border-white'} bg-neutral-200`} />
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: Universities / Learners */}
          <div 
            className={`flex-1 lg:col-span-3 lg:order-3 ${cardBg} rounded-3xl p-5 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm border ${borderTheme} min-h-[220px] md:min-h-[320px]`}
            style={sharedRadialBg}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FE6100]/10 rounded-full blur-[80px] hidden lg:block" />
            <div className="relative h-full flex flex-col justify-between z-10">
              <h3 className="text-sm md:text-2xl font-bold leading-tight">{universityHeading}</h3>
              <div className="flex flex-col gap-3 mt-auto">
                <p className={`${textMain} text-[10px] md:text-sm font-normal font-['Helvena']`}>{isCoding ? 'Step-by-step Path' : '20+ Universities'}</p>
                <div className="flex flex-wrap gap-1">
                  {(isCoding ? ['Basics', 'DSA', 'Projects', 'Placement'] : ['RGPV', 'BITS', 'SRM', 'VIT', 'LPU', '+15']).map((u) => (
                    <span key={u} className={`px-4 py-1 ${isCoding ? 'bg-white text-stone-950' : 'bg-black text-white'} rounded-full text-[8px] md:text-xs`}>{u}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP CENTER CIRCLE */}
        <div className="hidden lg:block absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className={`w-72 h-72 rounded-full border-[25px] ${isCoding ? 'border-stone-900' : 'border-neutral-100'} bg-white overflow-hidden shadow-none`}>
              <img className="w-full h-full object-cover" src="/sachingridimage.png" alt="Owner" />
           </div>
        </div>

        {/* --- BOX 5: ENGINEERING & CODING --- */}
        <div 
          className={`order-3 w-full lg:col-span-6 lg:order-5 ${cardBg} rounded-3xl p-6 md:p-8 pb-4 lg:pb-8 flex flex-col relative shadow-sm border ${borderTheme} min-h-[420px] lg:min-h-[420px] overflow-hidden`}
          style={sharedRadialBg}
        >
           <div className="flex justify-between items-start w-full relative z-10 mb-8 lg:mb-0 lg:mt-auto">
              <div className="flex flex-col lg:relative lg:z-20">
                <h3 className={`text-5xl font-semibold leading-none ${textMain}`}>{isCoding ? '10+' : '60+'}</h3>
                <p className="text-[#FE6100] text-sm md:text-xl font-medium mt-1 uppercase">{isCoding ? 'Coding & Placement Courses coming' : 'Engineering & Coding Courses'}</p>
              </div>
              <div className="w-20 h-20 md:w-28 md:h-28 lg:absolute lg:bottom-0 lg:right-0 shrink-0">
                <img className={`w-full h-full object-contain rounded-lg`} src="/4rdgridmeme.png" alt="meme" />
              </div>
           </div>

           <div className="flex flex-col gap-3 relative z-10 w-full lg:absolute lg:top-8 lg:right-8 lg:w-[380px]">
              {previews.map((item, i) => (
                <div 
                  key={i} 
                  className={`w-full ${isCoding ? 'bg-neutral-900' : 'bg-white'} rounded-xl border ${isCoding ? 'border-white/10' : 'border-gray-100'} shadow-md flex items-center gap-3 p-3`}
                  style={{ 
                    marginLeft: `var(--ml-${i})`,
                    transform: `translateX(var(--tx-${i}))`,
                    maxWidth: `var(--mw-${i})`
                  }}
                  data-index={i}
                >
                  <style jsx>{`
                    div[data-index="${i}"] {
                      --ml-0: 0%; --ml-1: 6%; --ml-2: 12%;
                      --tx-0: 0px; --tx-1: 0px; --tx-2: 0px;
                      --mw-0: 100%; --mw-1: 94%; --mw-2: 88%;
                    }
                    @media (min-width: 1024px) {
                      div[data-index="${i}"] {
                        margin-left: -${i * 32}px !important;
                        transform: none !important;
                        max-width: 100% !important;
                      }
                    }
                  `}</style>
                  <div className="w-14 h-9 md:w-20 md:h-12 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={item.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className={`${textMain} text-[10px] md:text-sm font-semibold truncate`}>{item.title}</h4>
                    <p className={`${textSub} text-[8px] md:text-xs truncate`}>{item.stats}</p>
                  </div>
                  <span className="text-[#FE6100] text-[8px] md:text-[10px] font-bold shrink-0">Free</span>
                </div>
              ))}
           </div>
        </div>

        {/* ROW 4 (MOBILE): 4-YEAR JOURNEY */}
        <div 
          className={`order-4 w-full lg:col-span-6 lg:order-4 ${cardBg} rounded-3xl p-6 md:p-8 relative shadow-sm border ${borderTheme} min-h-[380px] md:min-h-[450px]`}
          style={sharedRadialBg}
        >
           <div className="flex flex-col mb-8 md:mb-10">
              <h3 className={`text-2xl md:text-3xl font-bold ${textMain}`}>{isCoding ? '4 - Steps' : '4-Year Journey'}</h3>
              <p className="text-[#FE6100] text-sm md:text-xl font-medium">{journeyTitle}</p>
           </div>
           <div className="flex flex-col gap-6 md:gap-10 relative pl-1">
              <div className="absolute left-[20px] md:left-[25px] top-6 bottom-6 w-0 border-l-[3px] border-dashed border-[#FE6100]/50" />
              {journeySteps.map((step, i) => (
                <div key={i} className="flex items-center gap-6 md:gap-8 relative z-10">
                  <div className={`${isCoding ? 'bg-white text-stone-950' : 'bg-black text-white'} w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center shadow-lg shrink-0`}>
                    {step.icon}
                  </div>
                  <div className="flex flex-col">
                    <p className={`${textSub} text-[9px] md:text-[11px] uppercase font-bold tracking-widest leading-none`}>{step.year}</p>
                    <p className={`${textMain} font-semibold text-sm md:text-lg mt-0.5`}>{step.text}</p>
                  </div>
                </div>
              ))}
           </div>
           <div className="absolute bottom-6 right-6 w-24 h-24 md:w-32 md:h-32 overflow-hidden z-10">
              <img className="w-full h-full object-contain" src="/3rdgridmeme.png" alt="cat" />
           </div>
        </div>

      </div>
    </section>
  );
};

export default BentoGrid;
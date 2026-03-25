"use client";

import React from "react";
import { Heart, Star, ArrowRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function HeroSection() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Your 8 university logos from the public folder
  const universityLogos = isCoding ? ["09", "10", "11", "12", "13", "14", "15"] : ["01", "02", "03", "04", "05", "06", "07", "08"];

  // Theme Constants
  const themeBg = isCoding ? "bg-[#161616]" : "bg-neutral-100";
  const themeTextMain = isCoding ? "text-white" : "text-black";
  const themeTextSub = isCoding ? "text-white/70" : "text-gray-600";
  const badgeBg = isCoding ? "bg-white/10" : "bg-white";
  const glassCardBg = isCoding ? "bg-white/10" : "bg-white/20";
  const marqueeFade = isCoding ? "from-[#161616]" : "from-neutral-100";
  const ctaBg = isCoding ? "bg-white" : "bg-black";
  const ctaText = isCoding ? "text-stone-950" : "text-white";
  const ownerGradientOverlay = isCoding
    ? "from-neutral-900/0 to-[#161616]"
    : "from-transparent to-neutral-100";

  return (
    <>
      {/* CSS Animation for the infinite marquee scroll */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: infinite-scroll 30s linear infinite;
        }
      `,
        }}
      />

      <div
        className={`w-full relative ${themeBg} flex flex-col justify-start items-center transition-colors duration-500 overflow-hidden overflow-x-hidden`}
      >
        {/* --- BACKGROUND GRID (Opacity adjusted for dark theme) --- */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1440px] h-[921.60px] overflow-hidden pointer-events-none z-0 ${
            isCoding ? "opacity-40" : "opacity-100"
          }`}
        >
          {[...Array(13)].map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="left-0 absolute inline-flex justify-start items-start"
              style={{ top: `${rowIndex * 68.57}px` }}
            >
              {[...Array(21)].map((_, colIndex) => {
                // Matching your specific grid highlights
                const isHighlighted =
                  (rowIndex === 1 && (colIndex === 2 || colIndex === 9)) ||
                  (rowIndex === 2 && colIndex === 16) ||
                  (rowIndex === 4 && (colIndex === 3 || colIndex === 12)) ||
                  (rowIndex === 5 && colIndex === 18) ||
                  (rowIndex === 7 && colIndex === 8) ||
                  (rowIndex === 8 && colIndex === 4);

                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`w-16 h-16 outline outline-[1.37px] outline-offset-[-0.69px] outline-orange-600/5 ${
                      isHighlighted ? "bg-orange-600/5" : ""
                    }`}
                  />
                );
              })}
            </div>
          ))}

          {/* Radial Gradient */}
          <div className="w-[1738.97px] h-[1369.64px] left-[-116.57px] top-[-966.97px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(254,_97,_0,_0.69)_2%,_rgba(254,_97,_0,_0.34)_22%,_rgba(254,_97,_0,_0)_91%)] blur-[205.71px]" />
        </div>

        {/* --- HERO CONTENT WRAPPER --- */}
        <div className="w-full max-w-[1440px] flex flex-col justify-start items-center relative z-10 pt-32">
          <div className="w-full px-5 md:px-10 lg:px-20 pb-14 flex justify-between items-center">
            {/* Reduced gap from gap-14 to gap-4 on mobile */}
            <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-20">
              
              {/* --- LEFT SIDE (TEXT & CTA) --- */}
              <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-10 lg:gap-20 w-full max-w-2xl lg:max-w-none">
                <div className="flex flex-col justify-start items-center lg:items-start gap-8 lg:gap-10">
                  <div className="flex flex-col justify-center items-center lg:items-start gap-4 lg:gap-3">
                    {/* Badge */}
                    <div
                      className={`px-2 lg:px-3 py-1 lg:py-1.5 ${badgeBg} rounded-[100px] inline-flex justify-center items-center gap-1.5 lg:gap-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border ${
                        isCoding ? "border-white/10" : "border-gray-100"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-orange-500 fill-orange-500" />
                      <div
                        className={`${
                          isCoding ? "text-white" : "text-indigo-700"
                        } text-xs lg:text-sm font-medium font-['Helvena'] uppercase leading-4 tracking-wide`}
                      >
                        Edvara has it all covered.
                      </div>
                    </div>
                    {/* Heading */}
                    <div className="flex flex-col lg:block w-full">
                      <span
                        className={`${
                          isCoding
                            ? "text-orange-600"
                            : "text-black lg:text-orange-600"
                        } text-5xl md:text-5xl lg:text-6xl italic font-normal font-['Libre_Baskerville'] leading-tight lg:leading-[67.20px] inline`}
                      >
                        Padhai bhi,{" "}
                      </span>
                      <span className="text-orange-600 text-5xl md:text-5xl lg:text-6xl italic font-normal font-['Libre_Baskerville'] leading-tight lg:leading-[67.20px] inline">
                        placement bhi.{" "}
                      </span>
                      <span
                        className={`hidden lg:inline ${themeTextMain} text-3xl md:text-5xl lg:text-6xl font-medium font-['Helvena'] leading-tight lg:leading-[67.20px] mt-3 lg:mt-0`}
                      >
                        Clear your university exams.
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div
                    className={`h-12 lg:h-10 px-6 py-2 ${ctaBg} rounded-lg shadow-[0px_3px_6px_0px_rgba(0,0,0,0.10),_0px_11px_11px_0px_rgba(0,0,0,0.09),_0px_26px_15px_0px_rgba(0,0,0,0.05),_inset_0px_4px_4px_0px_rgba(255,255,255,0.25)] inline-flex justify-center items-center gap-2 cursor-pointer hover:opacity-90 transition-all`}
                  >
                    <div
                      className={`justify-center ${ctaText} text-sm md:text-base font-medium font-['Helvena'] leading-5`}
                    >
                      Find My Subjects
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 md:w-5 md:h-5 ${ctaText}`}
                    />
                  </div>
                </div>

                {/* Social Proof Students */}
                <div className="hidden lg:flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 w-full">
                  <div className="flex justify-center items-end">
                    {[1, 2, 3, 4, 5].map((student, i) => (
                      <div
                        key={student}
                        className={`w-10 h-10 rounded-full outline outline-[1.67px] ${
                          isCoding ? "outline-stone-950" : "outline-white"
                        } flex justify-start items-center ${
                          i !== 0 ? "-ml-3" : ""
                        }`}
                      >
                        <img
                          className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                          src={`/students/s${student}.png`}
                          alt={`Student ${student}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <div
                        className={`${themeTextMain} text-sm md:text-base font-semibold font-['Helvena']`}
                      >
                        5.0
                      </div>
                    </div>
                    <div
                      className={`${themeTextSub} text-sm font-medium font-['Helvena'] leading-6`}
                    >
                      from 200+ reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT SIDE (IMAGE & GLASSMORPH CARDS) --- */}
              {/* Reduced top margin on mobile from mt-10 to mt-4 */}
              <div className="w-full max-w-[320px] md:max-w-[440px] lg:max-w-[563.20px] aspect-[563.2/640] relative mt-4 lg:mt-0">
                <img
                  className="absolute inset-0 w-full h-full object-contain block z-0"
                  src="/sachinHero.png"
                  alt="Owner"
                />

                {/* Responsive Gradient Overlay over bottom of image */}
                <div
                  className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b ${ownerGradientOverlay} pointer-events-none z-0`}
                />

                {/* Floating Info Cards */}
                {[
                  {
                    id: "c1",
                    label: "120K+ Students",
                    icon: "/students.svg",
                    pos: "right-[-10px] md:right-[-20px] lg:right-auto lg:left-[66.4%] top-[4%]",
                  },
                  {
                    id: "c2",
                    label: "15K+ YouTube subs",
                    icon: "/youtubesubs.svg",
                    pos: "left-[-10px] md:left-0 lg:left-[10%] top-[41.7%]",
                  },
                  {
                    id: "c3",
                    label: "20+ Universities",
                    icon: "/universities.svg",
                    pos: "left-[-10px] md:left-[-20px] lg:left-[-6.7%] top-[80%] lg:top-[82.7%]",
                  },
                  {
                    id: "c4",
                    label: "60+ Courses",
                    icon: "/courses.svg",
                    pos: "right-[-10px] md:right-[-20px] lg:right-auto lg:left-[78.8%] top-[45%] lg:top-[48.6%]",
                  },
                ].map((card) => (
                  <div
                    key={card.id}
                    className={`p-2 lg:p-3 absolute ${
                      card.pos
                    } ${glassCardBg} backdrop-blur-md rounded-lg lg:rounded-xl shadow-[1px_2px_24px_0px_rgba(0,0,0,0.08)] border ${
                      isCoding ? "border-white/10" : "border-white/30"
                    } flex flex-col items-center gap-1.5 lg:gap-2 z-10 w-[max-content]`}
                  >
                    <img
                      src={card.icon}
                      alt="icon"
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 object-contain"
                    />
                    <div
                      className={`${themeTextMain} text-[10px] md:text-xs lg:text-sm font-medium font-['Geist'] whitespace-nowrap`}
                    >
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- UNIVERSITY MARQUEE --- */}
          {/* Added Solid Background to explicitly cover the grid lines on mobile */}
          <div className={`w-full ${themeBg} px-0 md:px-10 lg:px-20 py-10 lg:py-14 relative flex flex-col items-center gap-6 overflow-hidden z-20`}>
            <div
              className={`text-center ${themeTextMain} text-sm lg:text-base font-normal font-['Helvena'] uppercase tracking-wider relative z-10`}
            >
              University exam prep
            </div>

            <div className="w-full max-w-[1280px] relative overflow-hidden flex">
              <div className="inline-flex justify-start items-center gap-4 lg:gap-5 animate-marquee whitespace-nowrap w-max pr-4 lg:pr-5">
                {[...Array(3)].map((_, setIdx) => (
                  <React.Fragment key={`set-${setIdx}`}>
                    {universityLogos.map((logo, idx) => (
                      <div
                        key={`${setIdx}-${idx}`}
                        className={`w-24 lg:w-36 h-[60px] lg:h-[88px] px-4 lg:px-6 py-2.5 lg:py-4 ${badgeBg} rounded-lg lg:rounded-xl outline outline-1 outline-offset-[-1px] ${
                          isCoding ? "outline-white/10" : "outline-gray-300"
                        } inline-flex flex-col justify-center items-center flex-shrink-0`}
                      >
                        <img
                          className="max-w-[40px] lg:max-w-[60px] max-h-[40px] lg:max-h-[60px] object-contain"
                          src={`/universities/${logo}.png`}
                          alt={`University ${logo}`}
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              {/* Edge Fade Gradients */}
              <div
                className={`absolute right-0 inset-y-0 w-16 lg:w-40 bg-gradient-to-l ${marqueeFade} to-transparent pointer-events-none z-10`}
              />
              <div
                className={`absolute left-0 inset-y-0 w-16 lg:w-40 bg-gradient-to-r ${marqueeFade} to-transparent pointer-events-none z-10`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
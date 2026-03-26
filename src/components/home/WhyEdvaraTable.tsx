"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

// --- DATA DEFINITIONS ---

const engineerData = [
  {
    feature: "Covers Your University Syllabus",
    col1: "dot",
    col2: "dot",
    col3: "Sometimes",
  },
  {
    feature: "All subjects in one place",
    col1: "dot",
    col2: "dot",
    col3: "dot",
  },
  {
    feature: "Video + text notes together",
    col1: "Video only",
    col2: "Text only",
    col3: "Notes only",
  },
  {
    feature: "Exam-oriented coverage",
    col1: "Hit or miss",
    col2: "dot",
    col3: "Depends on senior",
  },
  {
    feature: "Hindi + English explanations",
    col1: "Some channels",
    col2: "dot",
    col3: "dot",
  },
  {
    feature: "Placement / coding skills included",
    col1: "dot",
    col2: "dot",
    col3: "dot",
  },
  {
    feature: "Updated every semester",
    col1: "dot",
    col2: "dot",
    col3: "dot",
  },
];

const codingData = [
  {
    feature: "Structured roadmap",
    col1: "dot",
    col2: "dot",
  },
  {
    feature: "DSA + Aptitude combo",
    col1: "dot",
    col2: "dot",
  },
  {
    feature: "Placement-focused prep",
    col1: "dot",
    col2: "dot",
  },
  {
    feature: "Real projects",
    col1: "dot",
    col2: "dot",
  },
  {
    feature: "Doubt support",
    col1: "dot",
    col2: "dot",
  },
  {
    feature: "Beginner to advanced path",
    col1: "dot",
    col2: "dot",
  },
];

export default function WhyEdvaraTable() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Dynamic Logic
  const comparisonData = isCoding ? codingData : engineerData;
  const headers = isCoding 
    ? ["YouTube", "Others"] 
    : ["YouTube", "ChatGPT / PDFs", "Senior's notes"];

  // Theme Constants
  const sectionBg = isCoding ? "bg-[#161616]" : "bg-neutral-100";
  const tableBg = isCoding ? "bg-stone-950" : "bg-white";
  const dividerColor = isCoding ? "border-slate-800" : "border-gray-300";
  const textMain = isCoding ? "text-white" : "text-black";
  const headerOutline = isCoding ? "outline-slate-800" : "outline-gray-300";

  return (
    <section
      className={`w-full ${sectionBg} flex flex-col items-center overflow-hidden transition-colors duration-500`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* Top Divider */}
      <div
        className={`self-stretch h-0 outline outline-[1.40px] ${headerOutline}`}
      />

      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-24 relative flex flex-col justify-center items-center gap-10">
        {/* Header Section */}
        <div className="self-stretch relative flex justify-center items-end gap-10">
          <div className="flex-1 flex flex-col justify-center items-center z-10">
            <div className="text-center text-[#FE6100] text-xl lg:text-4xl font-normal font-['Libre_Baskerville'] italic leading-tight lg:leading-[48px]">
              Why Edvara
            </div>
            <div
              className={`text-center ${textMain} text-2xl lg:text-5xl font-medium font-['Helvena'] leading-tight lg:leading-[57.60px]`}
            >
              Here&apos;s what&apos;s different.
            </div>
          </div>

          {/* Meme & Arrow */}
          <div className="hidden xl:flex absolute right-[0px] top-[-30px] flex flex-col items-center z-20">
            <img
              src="/memeforthewhyedvara.png"
              alt="Meme"
              className="w-40 h-auto object-contain"
            />
            <img
              src="/memearrow.svg"
              alt="Curvy Arrow"
              className={`w-16 h-16 mt-[-25px] ml-[-175px] rotate-[5deg] ${
                isCoding ? "invert brightness-200" : ""
              }`}
            />
          </div>
        </div>

        {/* Comparison Table Wrapper */}
        <div className="w-full relative flex flex-col items-start gap-6">
          <div className="w-full overflow-x-auto no-scrollbar touch-pan-x touch-pan-y">
            <div
              className={`min-w-[940px] lg:min-w-full p-3 lg:p-8 ${tableBg} rounded-2xl lg:rounded-xl flex flex-col justify-start items-start shadow-sm border ${
                isCoding ? "border-white/5" : "border-gray-100"
              }`}
            >
              {/* Table Header Row */}
              <div className="self-stretch inline-flex justify-start items-start gap-8">
                <div className="w-72 lg:w-96 h-14 px-4 py-3 flex flex-col justify-end items-start gap-1">
                  <div
                    className={`${textMain} text-lg lg:text-2xl font-medium font-['Helvena']`}
                  >
                    What you need
                  </div>
                </div>
                <div className="flex-1 flex justify-start items-center">
                  {headers.map((header) => (
                    <div
                      key={header}
                      className={`flex-1 h-14 px-4 py-3 flex justify-center items-end ${textMain} text-base lg:text-lg font-medium font-['Helvena'] text-center`}
                    >
                      {header}
                    </div>
                  ))}
                  <div className="flex-1 h-14 p-4 bg-[#FE6100] rounded-tl-xl rounded-tr-xl flex justify-center items-center gap-2">
                    <img
                      src="/edvaralogoforwhyedvara.svg"
                      alt="Edvara"
                      className="w-6 h-6 invert brightness-0"
                    />
                    <span className="text-white text-base lg:text-lg font-bold font-['Helvena'] lowercase">
                      edvara.
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Body Rows */}
              <div className="self-stretch flex flex-col justify-start items-start font-['Helvena']">
                {comparisonData.map((row, index) => (
                  <React.Fragment key={index}>
                    <div
                      className={`self-stretch h-14 lg:h-16 inline-flex justify-start items-center gap-8 group transition-colors ${
                        isCoding ? "hover:bg-white/5" : "hover:bg-neutral-50/50"
                      }`}
                    >
                      <div
                        className={`w-72 lg:w-96 ${textMain} text-base lg:text-lg font-medium leading-tight lg:leading-7 group-hover:text-[#FE6100] transition-colors`}
                      >
                        {row.feature}
                      </div>
                      <div className="flex-1 self-stretch flex justify-start items-center">
                        {/* Map through columns 1 to N based on header length */}
                        {headers.map((_, i) => {
                           const key = `col${i+1}` as keyof typeof row;
                           const val = row[key];
                           return (
                            <div
                              key={i}
                              className="flex-1 h-full p-3 flex justify-center items-center"
                            >
                              {val === "dot" ? (
                                <X
                                  className="w-5 h-5 text-red-500"
                                  strokeWidth={3}
                                />
                              ) : (
                                <span
                                  className={`${textMain} text-sm lg:text-base font-normal text-center leading-tight`}
                                >
                                  {val}
                                </span>
                              )}
                            </div>
                           )
                        })}
                        
                        <div
                          className={`flex-1 h-full p-3 bg-[#FE6100] flex justify-center items-center ${
                            index === comparisonData.length - 1
                              ? "rounded-bl-xl rounded-br-xl"
                              : ""
                          }`}
                        >
                          <Check
                            className="w-6 h-6 text-white"
                            strokeWidth={4}
                          />
                        </div>
                      </div>
                    </div>
                    {index < comparisonData.length - 1 && (
                      <div
                        className={`self-stretch h-0 border-t ${dividerColor}`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Scroll Indicator */}
          <div className="lg:hidden flex flex-col items-start gap-2 px-1 cursor-pointer group">
            <span
              className={`${textMain} text-base font-medium font-['Helvena'] leading-7`}
            >
              Scroll To check
            </span>
            <img
              src="/scrolltocheckarrow.svg"
              alt="arrow"
              className={`w-6 h-6 transition-transform group-hover:translate-x-1`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className={`self-stretch h-0 border-t ${dividerColor}`} />
    </section>
  );
}
'use client';

import React, { useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, wrap } from 'framer-motion';
import { Star } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  profilePic: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Chandramani",
    role: "Computer Science Student",
    text: "Thank you Sachin bhaiya for your countless efforts. Your dedication to the students is truly inspiring! ❤️❤️❤️❤️",
    profilePic: "/students/s1.jpeg"
  },
  {
    name: "Yuti Mishra",
    role: "3rd Sem Student",
    text: "Thank you so much bhaiya! Bohot badiya padhate ho aap. I got so much help for my 3rd-semester exams through your videos.",
    profilePic: "/students/s2.jpeg"
  },
  {
    name: "Muskan",
    role: "Engineering Student",
    text: "Thank you so much Sachin sir 🤗 Apne video bana di, it helped me clarify so many doubts!",
    profilePic: "/students/s3.jpeg"
  },
  {
    name: "Sarvesh Sejwar",
    role: "RGPV Student",
    text: "Kya hi bolu sir! Aaj lga topper feer se zinda ho gya 🔥 Sabse achha paper gya OOPM ka thanks to you.",
    profilePic: "/students/s4.jpeg"
  },
  {
    name: "Mahi",
    role: "Tech Enthusiast",
    text: "Sachin Sir is honestly the best teacher for RGPV OOPM right now. 🙌 The content is exactly what we need.",
    profilePic: "/students/s5.jpeg"
  },
  {
    name: "Unnati",
    role: "Computer Science Student",
    text: "Thank you bhaiya itna accha content free me dene ke liye. Bhagwan apke channel ko bohot age badhye, we all are supporting you! ❤️❤️",
    profilePic: "/students/s6.jpeg"
  },
  {
    name: "Sam",
    role: "Student",
    text: "Sir, your consistency in uploading lectures for different subjects at the same time shows your hard work. You truly deserve all the success! 🎉❤️❤️",
    profilePic: "/students/s7.jpeg"
  },
  {
    name: "Amratansh",
    role: "Engineering Student",
    text: "Grt bhaiya… Aapki vjh se DSA and Discrete Mathematics dono exam acche gye. Thank you for the guidance!",
    profilePic: "/students/s8.jpeg"
  }
];

interface MarqueeProps {
  items: Testimonial[];
  direction?: 1 | -1;
  baseVelocity: number;
  isCoding: boolean;
}

function MarqueeRow({ items, direction = 1, baseVelocity = 5, isCoding }: MarqueeProps) {
  const [hovered, setHovered] = useState(false);
  const baseX = useMotionValue(0);
  
  const duplicatedItems = [...items, ...items, ...items, ...items];
  
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);

  useAnimationFrame((t, delta) => {
    const speedFactor = hovered ? 0.25 : 0.4;
    let moveBy = direction * baseVelocity * (delta / 1000) * speedFactor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div 
      className="overflow-hidden whitespace-nowrap flex flex-nowrap w-full cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div 
        className="inline-flex gap-4" 
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={(e, info) => {
           baseX.set(baseX.get() + info.delta.x / 50);
        }}
      >
        {duplicatedItems.map((item, i) => (
          <div key={i} className={`w-72 md:w-96 p-4 md:p-6 ${isCoding ? 'bg-stone-950 border-white/5' : 'bg-white border-gray-100'} rounded-xl inline-flex flex-col justify-center items-start gap-4 md:gap-8 shadow-sm border shrink-0 select-none`}>
            <div className="self-stretch inline-flex justify-between items-start">
              <div className="flex justify-start items-start gap-3 md:gap-4">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-[#FE6100] shrink-0 overflow-hidden">
                   <img src={item.profilePic} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="inline-flex flex-col justify-start items-start">
                  <div className={`justify-center ${isCoding ? 'text-white' : 'text-neutral-950'} text-sm md:text-lg font-medium font-['Helvena'] leading-tight md:leading-6`}>{item.name}</div>
                  <div className={`justify-center ${isCoding ? 'text-white/70' : 'text-gray-600'} text-[10px] md:text-sm font-normal font-['Helvena'] leading-tight md:leading-6`}>{item.role}</div>
                </div>
              </div>
              <div className="flex justify-center items-center gap-1">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-3 h-3 md:w-4 md:h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>
            <div className={`self-stretch justify-center ${isCoding ? 'text-white/70' : 'text-gray-600'} text-sm md:text-base font-medium font-['Helvena'] leading-5 md:leading-6 whitespace-normal`}>
              &quot;{item.text.length > 110 ? `${item.text.substring(0, 110)}...` : item.text}&quot;
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialSection() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Theme Constants
  const sectionBg = isCoding ? 'bg-[#161616]' : 'bg-neutral-100';
  const outlineTheme = isCoding ? 'outline-slate-800' : 'outline-gray-300';
  const textMain = isCoding ? 'text-white' : 'text-black';
  const gradientTheme = isCoding ? 'from-[#161616]' : 'from-neutral-100';

  return (
    <section className={`w-full ${sectionBg} flex flex-col items-center overflow-hidden transition-colors duration-500`}>
      <div className={`self-stretch h-0 outline outline-[1.40px] ${outlineTheme}`} />

      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 md:py-24 flex flex-col justify-center items-center gap-10 md:gap-14 relative">
        
        {/* Header */}
        <div className="self-stretch flex flex-col justify-center items-center gap-1 md:gap-2">
          <div className="text-center text-[#FE6100] text-xl md:text-4xl font-normal font-['Libre_Baskerville'] italic leading-tight md:leading-[48px]">
            Don’t Take Our Words.
          </div>
          <div className={`text-center ${textMain} text-2xl md:text-5xl font-medium font-['Helvena'] leading-tight md:leading-[57.60px]`}>
            Read Theirs
          </div>
        </div>

        {/* Marquee Rows Container */}
        <div className="w-full flex flex-col gap-4 md:gap-6 relative">
          
          {/* Row 1: Moving Left */}
          <div className="w-full overflow-hidden">
            <MarqueeRow items={testimonials} direction={-1} baseVelocity={1.5} isCoding={isCoding} />
          </div>

          {/* Row 2: Moving Right */}
          <div className="w-full overflow-hidden">
            <MarqueeRow items={testimonials} direction={1} baseVelocity={1.5} isCoding={isCoding} />
          </div>

          {/* Edge Gradients - Responsive width */}
          <div className={`w-16 md:w-40 h-full left-0 top-0 absolute bg-gradient-to-r ${gradientTheme} to-transparent z-10 pointer-events-none`} />
          <div className={`w-16 md:w-40 h-full right-0 top-0 absolute bg-gradient-to-l ${gradientTheme} to-transparent z-10 pointer-events-none`} />
        </div>
      </div>

      <div className={`self-stretch h-0 outline outline-[1.40px] ${outlineTheme}`} />
    </section>
  );
}
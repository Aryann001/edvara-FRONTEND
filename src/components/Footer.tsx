'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

// --- DATA CONFIGURATION ---
const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/sachin.bhardwaaj", brandColor: "#E4405F" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/sachindwivedii", brandColor: "#0A66C2" },
  { icon: Youtube, href: "https://www.youtube.com/@Btech.Junction", brandColor: "#FF0000" },
];

const universities = [
  "Rgpv MP", 
  "AKTU UP", 
  "IKGPTU Kapurthala", 
  "LPU", 
  "BEU Patna", 
  "AKU Patna", 
  "SPPU Pune", 
  "SRM Chennai", 
  "MU Mumbai"
];

const courseLinks = [
  { name: "Java DSA", href: "#" },
  { name: "Web Development", href: "#" },
  { name: "Mobile App", href: "#" },
  { name: "DSA", href: "#" },
];

const quickLinks = [
  { name: "Free Resources", href: "#" },
  { name: "Blogs", href: "#" },
  { name: "Privacy Policy", href: "#" },
  { name: "Terms & Conditions", href: "#" },
  { name: "Refund Policy", href: "#" },
];
// --------------------------

export default function Footer() {
  return (
    <footer className="w-full relative bg-zinc-950 px-6 md:px-12 lg:px-20 pt-16 md:pt-24 pb-12 overflow-hidden flex flex-col items-center">
      
      {/* --- RESPONSIVE BACKGROUND ENGINE --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Large Brand Watermark - Centers with mx-auto if needed, but fixed relative to viewport here */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[22vw] font-['Helvena'] font-black text-white/[0.02] leading-none whitespace-nowrap translate-y-1/4">
          edvara.
        </div>

        {/* Dynamic Brand Orange Blobs */}
        <div className="w-[80%] md:w-[60%] aspect-square left-[-10%] top-[40%] absolute opacity-20 bg-[#FE6100] rounded-full blur-[80px] md:blur-[150px] lg:blur-[210px]" />
        <div className="w-[80%] md:w-[60%] aspect-square right-[-10%] top-[10%] absolute opacity-20 bg-[#FE6100] rounded-full blur-[80px] md:blur-[150px] lg:blur-[210px]" />
        
        {/* Responsive Conic Sweep */}
        <div className="w-[300%] h-[300%] left-[-100%] top-[-100%] absolute opacity-10 bg-[conic-gradient(from_180deg_at_50%_50%,_#FE6100_0deg,transparent_60deg,transparent_300deg,#FE6100_360deg)] blur-[100px] rotate-[24deg]" />
      </div>

      {/* --- MAIN CONTENT wrapper - Centered with mx-auto --- */}
      <div className="w-full max-w-[1440px] mx-auto relative z-10 flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-8 self-stretch">
        
        {/* Left Branding Section */}
        <div className="flex flex-col justify-start items-start gap-10 md:gap-12 w-full lg:max-w-[500px]">
          <div className="flex flex-col justify-start items-start gap-6">
            <img src="/logo-light-text.svg" alt="Edvara Logo" className="h-7 md:h-10 w-auto" />
            <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-normal font-['Libre_Baskerville'] italic leading-tight">
              Four hours of YouTube<br />
              Or two minutes of EdVara
            </h2>
          </div>

          <div className="flex flex-col gap-8 font-['Helvena'] w-full">
            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-sm md:text-base font-normal flex items-center gap-2">
                <span>🇮🇳</span> Bhopal
              </p>
              <p className="text-white/60 text-sm md:text-base font-normal leading-relaxed max-w-[300px]">
                Patel Nagar, Bhopal, Madhya Pradesh 462022
              </p>
            </div>

            {/* Social Buttons with Smooth Circle Reveal */}
            <div className="flex flex-col gap-4">
              <span className="text-white/50 text-sm md:text-base font-normal">Follow us</span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden group border border-white/10"
                    initial="initial"
                    whileHover="hover"
                  >
                    <motion.div
                      className="absolute inset-0 z-0"
                      style={{ backgroundColor: social.brandColor }}
                      variants={{
                        initial: { scale: 0, opacity: 0 },
                        hover: { scale: 1, opacity: 1 }
                      }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                    <motion.div
                      className="relative z-10"
                      variants={{
                        initial: { color: "rgba(255,255,255,0.6)" },
                        hover: { color: "#ffffff" }
                      }}
                    >
                      <social.icon size={18} strokeWidth={2} />
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Links Section - Balanced spacing */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-12 lg:gap-x-24 font-['Helvena'] w-full lg:w-auto">
          {/* Universities */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white/40 text-[10px] md:text-xs font-normal uppercase tracking-[0.2em]">Universities</h4>
            <div className="flex flex-col gap-3">
              {universities.map((name, idx) => (
                <span 
                  key={idx} 
                  className="text-white/70 text-xs md:text-sm font-normal hover:text-[#FE6100] transition-colors ease-in-out whitespace-nowrap cursor-default"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white/40 text-[10px] md:text-xs font-normal uppercase tracking-[0.2em]">Courses</h4>
            <div className="flex flex-col gap-3">
              {courseLinks.map((item, idx) => (
                <Link key={idx} href={item.href} className="text-white/70 text-xs md:text-sm font-normal hover:text-[#FE6100] transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white/40 text-[10px] md:text-xs font-normal uppercase tracking-[0.2em]">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {quickLinks.map((item, idx) => (
                <Link key={idx} href={item.href} className="text-white/70 text-xs md:text-sm font-normal hover:text-[#FE6100] transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- COPYRIGHT wrapper --- */}
      <div className="w-full max-w-[1440px] mx-auto relative z-10 mt-16 font-['Helvena']">
        <div className="w-full h-[1px] bg-white/5 mb-8" />
        <p className="text-white/40 text-[10px] md:text-sm font-normal text-center leading-loose">
          © 2026 Edvara. Built with ❤️ for Indian engineering students By{' '}
          <Link href="https://www.linkedin.com/in/sachindwivedii" target="_blank" className="text-white/80 hover:text-[#FE6100] underline underline-offset-4 decoration-white/20 transition-all duration-200">
              Sachin Sir
          </Link>
        </p>
      </div>
    </footer>
  );
}
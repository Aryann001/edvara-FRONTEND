'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

const engineerPreviews = [
  {
    title: "RGPV Engineering Physics | Full Course",
    stats: "5 videos • 34k+ views",
    link: "/thumbnails/universities/01.png",
    id: "1",
    ytLink: "https://youtube.com/playlist?list=PLVbxzb9b13LAxBeM2d5D9Ep5VxtpYG1HO&si=vay6bEF5X_jTKhVt",
    isComingSoon : false
  },
  {
    title: "AKTU Engineering Chemistry | Full Course",
    stats: "",
    link: "/thumbnails/universities/02.png",
    id: "2",
    ytLink: "https://www.youtube.com/@EdvaraOfficial/playlists",
    isComingSoon : true
  },
  {
    title: "RGPV Basic Civil & Engineering Mechanics | Full Course",
    stats: "",
    link: "/thumbnails/universities/03.png",
    id: "3",
    ytLink: "https://www.youtube.com/@EdvaraOfficial/playlists",
    isComingSoon : true
  },
  {
    title: "IKG PTU Object Oriented Programming | Full Course",
    stats: "",
    link: "/thumbnails/universities/04.png",
    id: "4",
    ytLink: "https://www.youtube.com/@EdvaraOfficial/playlists",
    isComingSoon : true
  },
  {
    title: "SPPU Pune Mathematics 2 | Full Course",
    stats: "",
    link: "/thumbnails/universities/05.png",
    id: "5",
    ytLink: "https://www.youtube.com/@EdvaraOfficial/playlists",
    isComingSoon : true
  }
];

const codingPreviews = [
  {
    title: "Java DSA for Placement | Complete Course 2026",
    stats: "12 videos • 45k+ views",
    link: "/thumbnails/coding/01.png",
    id: "1",
    ytLink: "https://www.youtube.com/@EdvaraCoding/playlists",
    isComingSoon : true
  },
  {
    title: "Aptitude & Logical Reasoning | Complete Course 2026",
    stats: "45 videos • 80k+ views",
    link: "/thumbnails/coding/02.png",
    id: "2",
    ytLink: "https://www.youtube.com/@EdvaraCoding/playlists",
    isComingSoon : true
  },
  {
    title: "Zero to Placements | Complete Roadmap",
    stats: "50 videos • 120k+ views",
    link: "/thumbnails/coding/03.png",
    id: "3",
    ytLink: "https://www.youtube.com/@EdvaraCoding/playlists",
    isComingSoon : true
  },
  {
    title: "Tech Placement Roadmaps | 2026",
    stats: "8 videos • 15k+ views",
    link: "/thumbnails/coding/04.png",
    id: "4",
    ytLink: "https://www.youtube.com/@EdvaraCoding/playlists",
    isComingSoon : true
  },
  {
    title: "Complete C++ for Placement | Complete Course 2026",
    stats: "8 videos • 15k+ views",
    link: "/thumbnails/coding/05.png",
    id: "5",
    ytLink: "https://www.youtube.com/@EdvaraCoding/playlists",
    isComingSoon : true
  }
];

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/sachin.bhardwaaj", color: "#E4405F" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/edvara-official/posts/?feedView=all", color: "#0A66C2" },
  { icon: Youtube, href: "https://www.youtube.com/@Btech.Junction", color: "#FF0000" },
];

export default function FreePreviews() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentPreviews = isCoding ? codingPreviews : engineerPreviews;
  const youtubeChannelLink = isCoding 
    ? "https://www.youtube.com/@EdvaraCoding" 
    : "https://www.youtube.com/@Btech.Junction";

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const themeBg = isCoding ? 'bg-[#161616]' : 'bg-neutral-100';
  const cardBg = isCoding ? 'bg-stone-950' : 'bg-white';
  const textMain = isCoding ? 'text-white' : 'text-black';
  const textSub = isCoding ? 'text-white/70' : 'text-gray-600';
  const borderTheme = isCoding ? 'border-white/5' : 'border-gray-100';
  const dashBorder = isCoding ? 'border-white/10' : 'border-gray-300';
  const socialBg = 'bg-white';

  return (
    <section className={`w-full ${themeBg} flex flex-col items-center transition-colors duration-500`}>
      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 md:py-24 flex flex-col items-center gap-10 md:gap-14 overflow-hidden">
        
        <div className="self-stretch flex flex-col justify-center items-center gap-1">
          <h2 className="text-[#FE6100] text-xl md:text-4xl italic font-normal font-['Libre_Baskerville'] leading-tight">
            Free Previews
          </h2>
          <p className={`${textMain} text-2xl md:text-5xl font-medium font-['Helvena'] leading-tight`}>
            Try Before You Enroll
          </p>
        </div>

        <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-10 lg:gap-14">
          
          <div className="flex-1 w-full flex flex-col gap-6 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isCoding ? 'coding-list' : 'engineer-list'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {currentPreviews.map((item) => (
                  <Link key={item.id} href={item.ytLink} target="_blank" className="group">
                    <motion.div 
                      whileHover={{ x: 10 }}
                      className={`w-full p-3 md:p-4 ${cardBg} rounded-xl md:rounded-2xl shadow-[0px_5px_10px_rgba(0,0,0,0.10),0px_18px_18px_rgba(0,0,0,0.04)] border ${borderTheme} flex items-start gap-4 md:gap-5 transition-all`}
                    >
                      <div className={`w-28 h-14 md:w-36 md:h-20 bg-neutral-200 rounded-md md:rounded-lg shrink-0 overflow-hidden relative`}>
                        <img 
                          src={item.link} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                          <Youtube className="text-white w-6 h-6 md:w-8 md:h-8" />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-0.5 md:gap-1 pr-2">
                        <h4 className={`${textMain} text-base md:text-xl font-medium font-['Helvena'] leading-tight line-clamp-1`}>
                          {item.title}
                        </h4>
                        <p className={`${textSub} text-sm md:text-base font-normal font-['Helvena']`}>
                          {item.stats}
                        </p>
                        <span className="text-[#FE6100] text-sm font-normal font-['Helvena'] mt-1">{item.isComingSoon ? `Coming soon` : `Free`}</span>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-1">
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-gray-300 transition-colors duration-300 group-hover:text-[#FE6100]" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
            
            <Link href={youtubeChannelLink} target="_blank" className="w-full">
              <button className={`w-full py-4 rounded-xl md:rounded-2xl border-2 border-dashed ${dashBorder} text-gray-400 font-['Helvena'] text-sm md:text-base font-medium hover:border-[#FE6100] hover:text-[#FE6100] transition-all cursor-pointer`}>
                View all free playlists on YouTube →
              </button>
            </Link>
          </div>

          <div className="w-full lg:w-[450px] flex flex-col gap-6 md:gap-8 order-2 lg:order-1">
            <div 
              onClick={togglePlay}
              className={`aspect-[9/16] w-full max-h-[800px] relative bg-black rounded-xl md:rounded-3xl overflow-hidden group cursor-pointer shadow-2xl transition-all duration-500 mx-auto`}
            >
              <video
                ref={videoRef}
                src="/video.mp4"
                poster="/thumbnail.jpeg" 
                className="w-full h-full object-cover"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              <AnimatePresence>
                {!isPlaying && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 pointer-events-none ${isCoding ? 'bg-black/30' : 'bg-gradient-to-t from-black/70 to-transparent'}`} 
                  />
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 md:w-20 md:h-20 ${isCoding ? 'bg-[#FE6100]' : 'bg-white'} rounded-full flex items-center justify-center shadow-xl`}
                    >
                      <Play className={`w-5 h-5 md:w-8 md:h-8 ${isCoding ? 'text-white fill-white' : 'text-black fill-black'} ml-1`} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <p className={`${isCoding ? 'text-white' : 'text-white/60'} font-['Helvena'] text-xs md:text-sm uppercase tracking-widest mb-1`}>Founder & CEO</p>
                <p className="text-white text-lg md:text-2xl font-medium font-['Helvena']">The Edvara Mission</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 font-['Helvena']">
              <span className={`${textMain} text-sm md:text-lg font-normal`}>Follow us:</span>
              <div className="flex items-center gap-3 md:gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${socialBg} border ${isCoding ? 'border-white/5' : 'border-gray-200'} flex items-center justify-center relative overflow-hidden group`}
                    whileHover="hover"
                  >
                    <motion.div className="absolute inset-0 z-0" variants={{ hover: { backgroundColor: social.color, opacity: 0.1 } }} />
                    <motion.div className="z-10" style={{ color: '#1c1c1c' }} variants={{ hover: { color: social.color, y: -2 } }}>
                      <social.icon size={18} />
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div className={`w-full h-0 border-t ${isCoding ? 'border-slate-800' : 'border-gray-300'}`} />
    </section>
  );
}
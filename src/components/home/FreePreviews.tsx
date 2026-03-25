'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

const previews = [
  {
    title: "RGPV 2nd Year | Most Important Questions",
    stats: "5 videos • 34k+ views",
    link: "/testimonial/t1.webp",
    id: "rgpv-2nd"
  },
  {
    title: "Theory of Computation (TOC) Full Course | BTech 3rd Year",
    stats: "62 videos • 100k+ views",
    link: "/testimonial/t2.webp",
    id: "toc-course"
  },
  {
    title: "RGPV BTech 2nd Year | Guidance",
    stats: "28 videos • 50k+ views",
    link: "/testimonial/t3.webp",
    id: "rgpv-guidance"
  },
  {
    title: "RGPV BTech 1st Year | Guidance",
    stats: "2 videos • 9k+ views",
    link: "/testimonial/t4.webp",
    id: "rgpv-1st"
  }
];

const socialLinks = [
  { icon: Instagram, href: "#", color: "#E4405F" },
  { icon: Linkedin, href: "#", color: "#0A66C2" },
  { icon: Youtube, href: "#", color: "#FF0000" },
];

export default function FreePreviews() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Theme Constants
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
        
        {/* Header */}
        <div className="self-stretch flex flex-col justify-center items-center gap-1">
          <h2 className="text-[#FE6100] text-xl md:text-4xl italic font-normal font-['Libre_Baskerville'] leading-tight">
            Free Previews
          </h2>
          <p className={`${textMain} text-2xl md:text-5xl font-medium font-['Helvena'] leading-tight`}>
            Try Before You Enroll
          </p>
        </div>

        {/* Content Grid */}
        <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-10 lg:gap-14">
          
          {/* Playlist Cards */}
          <div className="flex-1 w-full flex flex-col gap-6 order-1 lg:order-2">
            {previews.map((item) => (
              <Link key={item.id} href={item.link} target="_blank" className="group">
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
                    <span className="text-[#FE6100] text-sm font-normal font-['Helvena'] mt-1">
                      Free
                    </span>
                  </div>

                  <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-1">
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-gray-300 transition-colors duration-300 group-hover:text-[#FE6100]" />
                  </div>
                </motion.div>
              </Link>
            ))}
            
            <button className={`w-full py-4 rounded-xl md:rounded-2xl border-2 border-dashed ${dashBorder} text-gray-400 font-['Helvena'] text-sm md:text-base font-medium hover:border-[#FE6100] hover:text-[#FE6100] transition-all`}>
              View all free playlists on YouTube →
            </button>
          </div>

          {/* Real Video Section */}
          <div className="w-full lg:w-[564px] flex flex-col gap-6 md:gap-8 order-2 lg:order-1">
            <div 
              onClick={togglePlay}
              className={`aspect-square md:aspect-[564/666] w-full relative bg-black rounded-xl md:rounded-3xl overflow-hidden group cursor-pointer shadow-2xl transition-all duration-500`}
            >
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src="/video.mp4"
                poster="/thumbnail.jpeg" // Premium Thumbnail
                className="w-full h-full object-cover"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Overlay for Video Aesthetics */}
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
              
              {/* Play Button */}
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
              
              {/* Video Info Labels */}
              <div className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <p className={`${isCoding ? 'text-white' : 'text-white/60'} font-['Helvena'] text-xs md:text-sm uppercase tracking-widest mb-1`}>Owner Introduction</p>
                <p className="text-white text-lg md:text-2xl font-medium font-['Helvena']">The Edvara Mission</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 md:gap-6 font-['Helvena']">
              <span className={`${textMain} text-sm md:text-lg font-normal`}>Follow us:</span>
              <div className="flex items-center gap-3 md:gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${socialBg} border ${isCoding ? 'border-white/5' : 'border-gray-200'} flex items-center justify-center relative overflow-hidden group`}
                    whileHover="hover"
                  >
                    <motion.div 
                      className="absolute inset-0 z-0"
                      variants={{
                        hover: { backgroundColor: social.color, opacity: 0.1 }
                      }}
                    />
                    <motion.div
                      className="z-10"
                      style={{ color: '#1c1c1c' }} 
                      variants={{
                        hover: { color: social.color, y: -2 }
                      }}
                    >
                      <social.icon size={18} />
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Bottom Divider */}
      <div className={`w-full h-0 border-t ${isCoding ? 'border-slate-800' : 'border-gray-300'}`} />
    </section>
  );
}
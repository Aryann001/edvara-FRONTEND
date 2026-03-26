'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; 
import { toggleDomain, logout } from '@/store/slices/appSlice'; // Ensure logout is imported
import { 
  Menu, X, ChevronDown, HelpCircle, User, LogOut, 
  LayoutDashboard, ArrowLeft, Receipt 
} from 'lucide-react';
import HelpPopup from '@/components/HelpPopup'; 
import api from '@/services/api'; // Import your api utility

export default function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname(); 
  const router = useRouter(); // Initialize router
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const isAuthenticated = useAppSelector((state) => state.app.isAuthenticated);
  const user = useAppSelector((state: any) => state.app.user); 

  const textColor = isCoding ? 'text-gray-200' : 'text-stone-900';
  const glassBgBase = isCoding 
    ? 'bg-zinc-900/40 backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
    : 'bg-white/40 backdrop-blur-xl border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.05)]';

  const menuBg = isCoding ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900';
  const menuHover = isCoding ? 'hover:bg-white/10' : 'hover:bg-neutral-100';
  const iconColor = isCoding ? 'text-gray-400' : 'text-gray-600';

  const isCoursePlayer = pathname.startsWith('/classroom/') && pathname.length > '/classroom/'.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return isActive ? 'text-[#FE6100] font-bold' : `${textColor} hover:opacity-80`;
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await api.get('/auth/logout'); // Clears backend cookie
      dispatch(logout()); // Clears Redux state (user: null, isAuthenticated: false)
      setIsDropdownOpen(false);
      setIsDrawerOpen(false);
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenHelp = () => {
    setIsDropdownOpen(false);
    setIsDrawerOpen(false);
    setIsHelpOpen(true);
  };

  if (isCoursePlayer) {
    return (
      <>
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full lg:pt-6 z-50 flex items-center justify-center pointer-events-none font-['Helvena']"
        >
          <div className={`w-full lg:max-w-[1280px] h-16 lg:h-auto px-4 lg:py-3 flex justify-between items-center pointer-events-auto transition-all duration-500 ${glassBgBase} border-b lg:border rounded-none lg:rounded-[100px] lg:mx-8`}>
            
            <div className="flex-1 flex justify-start">
              <Link href="/classroom" className={`group px-3 sm:px-4 py-2 rounded-full inline-flex justify-center items-center gap-1.5 sm:gap-2 transition-all active:scale-95 ${isCoding ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${textColor}`} />
                <span className={`hidden sm:block ${textColor} text-sm font-medium`}>Back to my classroom</span>
                <span className={`block sm:hidden ${textColor} text-xs font-medium`}>Back</span>
              </Link>
            </div>

            <div className="flex justify-center">
              <Link href="/" className="h-5 sm:h-6 shrink-0 cursor-pointer flex items-center transition-transform hover:scale-105">
                 <img src={isCoding ? "/logo-light-text.svg" : "/logo-dark-text.svg"} alt="Edvara Logo" className="h-full w-auto object-contain"/>
              </Link>
            </div>

            <div className="flex-1 flex justify-end items-center relative" ref={dropdownRef}>
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className={`h-9 pl-1 pr-2 sm:pr-3 py-1.5 rounded-[100px] shadow-sm outline outline-1 outline-offset-[-1px] ${isCoding ? 'outline-white/20 bg-[#1C1C1C] hover:bg-white/5' : 'outline-gray-200 bg-white hover:bg-gray-50'} inline-flex justify-center items-center gap-1.5 sm:gap-2 overflow-hidden transition-colors active:scale-95`}
                  >
                    <div className="flex justify-start items-center gap-1.5 sm:gap-2">
                      {user?.avatar ? (
                        <img className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" src={user.avatar.url || user.avatar} alt="Profile" />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 relative flex justify-center items-center">
                          <div className="absolute inset-0 bg-orange-600 rounded-full" />
                          <span className="relative z-10 text-white text-xs sm:text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                      )}
                      <div className={`${textColor} hidden sm:block text-sm font-medium truncate max-w-[80px]`}>
                        {user?.name?.split(' ')[0] || 'User'}
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} ${textColor}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                        className={`absolute right-0 top-12 w-48 rounded-lg shadow-lg outline-offset-[-1px] flex flex-col justify-start items-start overflow-hidden z-50 ${menuBg}`}
                      >
                        <div className={`self-stretch p-1 border-b flex flex-col justify-start items-start ${isCoding ? 'border-white/10' : 'border-neutral-200'}`}>
                          {user?.role === 'admin' && (
                            <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className={`self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                              <LayoutDashboard className={`w-4 h-4 ${iconColor}`} />
                              <span className="flex-1 text-sm font-normal line-clamp-1">Dashboard</span>
                            </Link>
                          )}
                          <button onClick={handleOpenHelp} className={`w-full self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                            <HelpCircle className={`w-4 h-4 ${iconColor}`} />
                            <span className="flex-1 text-left text-sm font-normal line-clamp-1">Help</span>
                          </button>
                          <Link href="/invoices" onClick={() => setIsDropdownOpen(false)} className={`self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                            <Receipt className={`w-4 h-4 ${iconColor}`} />
                            <span className="flex-1 text-sm font-normal line-clamp-1">My Invoices</span>
                          </Link>
                          <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className={`self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                            <User className={`w-4 h-4 ${iconColor}`} />
                            <span className="flex-1 text-sm font-normal line-clamp-1">Profile</span>
                          </Link>
                        </div>
                        <div className="self-stretch p-1 flex flex-col justify-start items-start">
                          <button onClick={handleLogout} className={`w-full h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover} text-red-500`}>
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span className="flex-1 text-left text-sm font-medium line-clamp-1">Log out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className={`h-8 sm:h-9 px-4 sm:px-5 rounded-[100px] flex justify-center items-center overflow-hidden transition-all active:scale-95 outline outline-1 outline-offset-[-1px] ${isCoding ? 'outline-white/30 hover:bg-white/10 text-white' : 'outline-black/20 hover:bg-black/5 text-black'}`}>
                  <span className="text-xs sm:text-sm font-medium">Login</span>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
        <HelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div className="fixed top-0 left-0 w-full lg:pt-6 z-50 flex items-center justify-center pointer-events-none font-['Helvena']">
        <div className="w-full max-w-[1440px] lg:px-20 flex flex-col justify-center items-center pointer-events-auto">
          
          <div className={`w-full lg:max-w-[1280px] h-16 lg:h-auto px-5 lg:p-4 flex justify-between items-center transition-all duration-500 ${glassBgBase} border-b lg:border rounded-none lg:rounded-[100px]`}>
            
            <div className="flex-1 flex justify-start items-center gap-4 lg:gap-8">
              <Link href="/" className="h-5 lg:h-6 shrink-0 cursor-pointer flex items-center transition-transform hover:scale-105">
                 <img src={isCoding ? "/logo-light-text.svg" : "/logo-dark-text.svg"} alt="Edvara Logo" className="h-full w-auto object-contain"/>
              </Link>

              <div className="hidden lg:flex rounded-md justify-start items-center gap-3">
                <span className={`${textColor} text-sm font-medium transition-colors duration-500 ${isCoding ? 'opacity-60' : ''}`}>Engineers</span>
                <div onClick={() => dispatch(toggleDomain())} className="w-12 h-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl cursor-pointer flex items-center shadow-inner relative px-1">
                  <motion.div layout initial={false} animate={{ x: isCoding ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-4 h-4 flex items-center justify-center relative z-10">
                    <img src="/orange-fruit.svg" alt="Toggle" className="w-full h-full object-contain drop-shadow-md" />
                  </motion.div>
                </div>
                <span className={`${textColor} text-sm font-medium transition-colors duration-500 ${!isCoding ? 'opacity-60' : ''}`}>Coding</span>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 justify-end items-center gap-4 lg:gap-6">
              
              <div className="flex justify-start items-center">
                <Link href="/" className="h-8 px-4 flex justify-start items-center gap-1.5 group"><span className={`text-sm font-medium leading-6 transition-all ${getLinkStyle('/')}`}>Home</span></Link>
                <Link href="/courses" className="h-8 px-4 flex justify-start items-center gap-1.5 group"><span className={`text-sm font-medium leading-6 transition-all ${getLinkStyle('/courses')}`}>Courses</span></Link>
                <Link href="/classroom" className="h-8 px-4 flex justify-start items-center gap-1.5 group"><span className={`text-sm font-medium leading-6 transition-all ${getLinkStyle('/classroom')}`}>My Classroom</span></Link>
              </div>

              <div className="flex justify-end items-center relative" ref={dropdownRef}>
                {isAuthenticated ? (
                  <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`h-9 pl-1 pr-3 py-1.5 rounded-[100px] shadow-sm outline outline-1 outline-offset-[-1px] ${isCoding ? 'outline-white/20 bg-white/5 hover:bg-white/10' : 'outline-black/10 bg-white hover:bg-gray-50'} inline-flex justify-center items-center gap-2 overflow-hidden transition-colors`}>
                      <div className="flex justify-start items-center gap-2">
                        {user?.avatar ? (
                          <img className="w-7 h-7 rounded-full object-cover" src={user.avatar.url || user.avatar} alt="Profile" />
                        ) : (
                          <div className="w-7 h-7 relative flex justify-center items-center">
                            <div className="absolute inset-0 bg-orange-600 rounded-full" />
                            <span className="relative z-10 text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                          </div>
                        )}
                        <div className={`${textColor} text-sm font-medium leading-6 truncate max-w-[100px]`}>{user?.name?.split(' ')[0] || 'User'}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} ${textColor}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className={`absolute right-0 top-12 w-48 rounded-lg shadow-lg flex flex-col justify-start items-start overflow-hidden z-50 ${menuBg}`}>
                          <div className={`self-stretch p-1 border-b flex flex-col justify-start items-start ${isCoding ? 'border-white/10' : 'border-neutral-200'}`}>
                            {user?.role === 'admin' && (
                              <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className={`self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                                <LayoutDashboard className={`w-4 h-4 ${iconColor}`} />
                                <span className="flex-1 text-sm font-normal line-clamp-1">Dashboard</span>
                              </Link>
                            )}
                            <button onClick={handleOpenHelp} className={`w-full self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                              <HelpCircle className={`w-4 h-4 ${iconColor}`} />
                              <span className="flex-1 text-left text-sm font-normal line-clamp-1">Help</span>
                            </button>
                            <Link href="/invoices" onClick={() => setIsDropdownOpen(false)} className={`self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                              <Receipt className={`w-4 h-4 ${iconColor}`} />
                              <span className="flex-1 text-sm font-normal line-clamp-1">My Invoices</span>
                            </Link>
                            <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className={`self-stretch h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover}`}>
                              <User className={`w-4 h-4 ${iconColor}`} />
                              <span className="flex-1 text-sm font-normal line-clamp-1">Profile</span>
                            </Link>
                          </div>
                          <div className="self-stretch p-1 flex flex-col justify-start items-start">
                            <button onClick={handleLogout} className={`w-full h-9 p-2 rounded-md inline-flex justify-start items-center gap-3 transition-colors ${menuHover} text-red-500`}>
                              <LogOut className="w-4 h-4 text-red-500" />
                              <span className="flex-1 text-left text-sm font-medium line-clamp-1">Log out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/login" className={`h-9 px-5 rounded-[100px] flex justify-center items-center gap-2 overflow-hidden transition-all active:scale-95 outline outline-1 outline-offset-[-1px] ${isCoding ? 'outline-white/30 hover:bg-white/10 text-white' : 'outline-black/20 hover:bg-black/5 text-black'}`}>
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex lg:hidden flex-1 justify-end items-center">
               <button onClick={toggleDrawer} className="w-10 h-10 bg-[#FE6100] rounded-xl shadow-[0px_4px_10px_rgba(254,97,0,0.4)] flex justify-center items-center hover:scale-105 transition-transform">
                 <Menu className="w-5 h-5 text-black" />
               </button>
            </div>

          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleDrawer} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed top-0 right-0 w-[80%] max-w-sm h-[100dvh] z-[70] flex flex-col p-6 shadow-2xl lg:hidden ${glassBgBase} border-l font-['Helvena']`}>
              
              <div className="flex justify-end mb-8">
                <button onClick={toggleDrawer} className={`p-2 rounded-full transition-colors ${isCoding ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-4 mb-10 pb-8 border-b border-white/20">
                <span className={`${textColor} text-sm font-medium uppercase tracking-wider opacity-60`}>Domain</span>
                <div className="flex items-center gap-4">
                  <span className={`${textColor} text-base transition-colors duration-500 font-medium`}>Engineers</span>
                  <div onClick={() => dispatch(toggleDomain())} className="w-12 h-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl cursor-pointer flex items-center shadow-inner relative px-1">
                    <motion.div layout initial={false} animate={{ x: isCoding ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-4 h-4 flex items-center justify-center relative z-10">
                      <img src="/orange-fruit.svg" alt="Toggle Domain" className="w-full h-full object-contain drop-shadow-md" />
                    </motion.div>
                  </div>
                  <span className={`${textColor} text-base transition-colors duration-500 font-medium`}>Coding</span>
                </div>
              </div>

              <div className="flex flex-col gap-6 mb-8 border-b border-white/20 pb-8">
                <Link href="/" onClick={toggleDrawer} className={`text-xl cursor-pointer transition-all ${getLinkStyle('/')}`}>Home</Link>
                <Link href="/courses" onClick={toggleDrawer} className={`text-xl cursor-pointer transition-all ${getLinkStyle('/courses')}`}>Courses</Link>
                <Link href="/classroom" onClick={toggleDrawer} className={`text-xl cursor-pointer transition-all ${getLinkStyle('/classroom')}`}>My Classroom</Link>
              </div>

              <div className="mt-auto pb-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                      {user?.avatar ? (
                        <img className="w-10 h-10 rounded-full object-cover" src={user.avatar.url || user.avatar} alt="Profile" />
                      ) : (
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className={`${textColor} font-medium`}>{user?.name || 'User'}</span>
                        <Link href="/profile" onClick={toggleDrawer} className="text-xs text-orange-500 hover:underline">View Profile</Link>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <Link href="/dashboard" onClick={toggleDrawer} className={`flex items-center gap-3 ${textColor} hover:text-orange-500 transition-colors`}>
                        <LayoutDashboard className="w-5 h-5" /> <span>Dashboard</span>
                      </Link>
                    )}
                    <button onClick={handleOpenHelp} className={`flex items-center gap-3 ${textColor} hover:text-orange-500 transition-colors text-left`}>
                      <HelpCircle className="w-5 h-5" /> <span>Help</span>
                    </button>
                    <Link href="/invoices" onClick={toggleDrawer} className={`flex items-center gap-3 ${textColor} hover:text-orange-500 transition-colors text-left mt-2`}>
                      <Receipt className="w-5 h-5" /> <span>My Invoices</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors mt-2 text-left">
                      <LogOut className="w-5 h-5" /> <span>Log out</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={toggleDrawer} className="w-full">
                    <button className="w-full py-3.5 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl shadow-lg flex justify-center items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-95">
                      <span className="text-white text-base font-medium">Login to Account</span>
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <HelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, Ticket, Megaphone, Settings, Menu, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const sidebarBg = isCoding ? 'bg-[#161616]/95' : 'bg-white/95';
  const borderColor = isCoding ? 'border-white/10' : 'border-zinc-200';
  const textColor = isCoding ? 'text-gray-300' : 'text-zinc-600';
  const activeBg = 'bg-gradient-to-r from-[#FE6100]/10 to-transparent border-r-4 border-[#FE6100]';
  const activeText = 'text-[#FE6100] font-semibold';

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Students', path: '/dashboard/students', icon: Users },
    { name: 'Coupons', path: '/dashboard/coupons', icon: Ticket },
    { name: 'Broadcast', path: '/dashboard/broadcast', icon: Megaphone },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen w-full flex ${isCoding ? 'bg-[#161616]' : 'bg-neutral-50'} transition-colors duration-500 font-['Helvena']`}>
      
      {/* MOBILE HEADER & TOGGLE */}
      <div className={`lg:hidden fixed top-[70px] left-0 right-0 h-14 ${sidebarBg} backdrop-blur-md border-b ${borderColor} z-40 flex items-center px-5`}>
        <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 rounded-md ${textColor}`}>
          <Menu className="w-6 h-6" />
        </button>
        <span className={`ml-3 font-semibold uppercase tracking-widest text-xs ${textColor}`}>Admin Panel</span>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -300) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-64 fixed top-0 lg:top-[80px] bottom-0 left-0 backdrop-blur-xl border-r z-50 lg:z-40 flex flex-col pt-6 lg:pt-8 pb-8 transition-colors duration-500 ${sidebarBg} ${borderColor}`}
      >
        <div className="px-8 mb-8 flex justify-between items-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Admin Panel</p>
          <button onClick={() => setIsMobileMenuOpen(false)} className={`lg:hidden p-1 rounded-md ${textColor}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-4 px-8 py-3 transition-all ${isActive ? activeBg : 'hover:bg-zinc-500/5'} ${isActive ? activeText : textColor}`}>
                  <Icon size={20} className={isActive ? 'text-[#FE6100]' : ''} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full lg:ml-64 p-5 sm:p-8 pt-[140px] lg:pt-[120px] min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
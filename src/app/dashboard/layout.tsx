'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, Ticket, Megaphone, Settings } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  const sidebarBg = isCoding ? 'bg-[#161616]/80' : 'bg-white/80';
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
    <div className="min-h-screen w-full flex">
      {/* FIXED SIDEBAR */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className={`w-64 fixed top-32 bottom-0 left-0 backdrop-blur-xl border-r z-40 flex flex-col pt-8 pb-8 transition-colors duration-500 ${sidebarBg} ${borderColor}`}
      >
        <div className="px-8 mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">Admin Panel</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-4 px-8 py-3 transition-all ${isActive ? activeBg : 'hover:bg-zinc-500/5'} ${isActive ? activeText : textColor}`}>
                  <Icon size={20} className={isActive ? 'text-[#FE6100]' : ''} />
                  <span className="text-sm font-helvena">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      {/* ml-64 pushes content past the sidebar. pt-8 gives breathing room below the global Navbar */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
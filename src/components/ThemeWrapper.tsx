'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setDomain, setAuth, logout } from '@/store/slices/appSlice';
import Navbar from './Navbar';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [mounted, setMounted] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // 1. App Initialization (Theme & Auth Rehydration)
  useEffect(() => {
    // A. Rehydrate Theme
    const savedDomain = localStorage.getItem('isCodingDomain');
    if (savedDomain !== null) {
      dispatch(setDomain(savedDomain === 'true'));
    }

    // B. Rehydrate Auth State (The Fix!)
    const checkAuthSession = async () => {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          // This tells the browser to send the HTTP-only cookie to the backend
          credentials: 'include', 
          cache: 'no-store'
        });
        const data = await res.json();

        if (res.ok && data.success) {
          dispatch(setAuth(data.data)); // User is valid, update Redux!
        } else {
          dispatch(logout()); // Cookie is expired or missing
        }
      } catch (error) {
        dispatch(logout());
      } finally {
        setMounted(true); // Don't show the UI until we know their auth status
      }
    };

    checkAuthSession();
  }, [dispatch, apiUrl]);

  // 2. Theme Switching Logic
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('isCodingDomain', String(isCoding));
      if (isCoding) {
        document.documentElement.classList.add('theme-coding');
        document.documentElement.classList.remove('theme-university');
      } else {
        document.documentElement.classList.add('theme-university');
        document.documentElement.classList.remove('theme-coding');
      }
    }
  }, [isCoding, mounted]);

  // Prevent flash of unstyled content while checking auth/theme
  if (!mounted) return <div className="min-h-screen w-full bg-[#EAEDEF] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#FE6100] border-t-transparent rounded-full animate-spin" />
  </div>;

  const globalThemeClass = isCoding ? 'bg-[#161616] text-gray-200' : 'bg-[#EAEDEF] text-stone-900';

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${globalThemeClass}`}>
      {!isAuthPage && <Navbar />}
      
      <main className={!isAuthPage ? "pt-0" : ""}>
        {children}
      </main>
    </div>
  );
}
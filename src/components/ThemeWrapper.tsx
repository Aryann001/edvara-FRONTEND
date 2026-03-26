'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setDomain, setAuth, logout } from '@/store/slices/appSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '@/services/api'; // <-- ADDED: Importing your Axios instance

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter(); 
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  // --- ADDED AUTH STATES FROM REDUX ---
  const isAuthenticated = useAppSelector((state) => state.app.isAuthenticated);
  const user = useAppSelector((state) => state.app.user);

  const [mounted, setMounted] = useState(false);
  const [initialTheme, setInitialTheme] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Handles client-side redirect animations

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isDashboardPage = pathname.startsWith('/dashboard'); // <-- Identifies dashboard routes

  // =====================================================================
  // 1. INITIAL FETCH (Runs exactly ONCE on full page load)
  // =====================================================================
  useEffect(() => {
    // Read theme instantly to prevent white flashes
    const savedDomain = localStorage.getItem('isCodingDomain');
    const isDark = savedDomain === 'true';
    setInitialTheme(isDark);
    
    if (savedDomain !== null) {
      dispatch(setDomain(isDark));
    }

    const checkAuthSession = async () => {
      let isAuth = false;
      let userRole = null;

      try {
        // FIXED: Uses the `api` instance so it seamlessly hits the proxy and carries cookies
        const { data } = await api.get('/auth/me');
        if (data && data.success) {
          dispatch(setAuth(data.data)); 
          isAuth = true;
          userRole = data.data.role;
        } else {
          dispatch(logout()); 
        }
      } catch (error) {
        dispatch(logout());
      } finally {
        // INITIAL ROUTE GUARD: Check validity before showing the app
        const isProtectedRoute = pathname.startsWith('/classroom') || pathname === '/payment-success' || pathname === '/profile';
        const isAdminRoute = pathname.startsWith('/dashboard');
        const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

        let shouldRedirect = false;
        let redirectUrl = '';

        // Logged in users are sent strictly to their dashboard if they hit an auth route
        if (isAuthRoute && isAuth) {
          shouldRedirect = true; 
          redirectUrl = userRole === 'admin' ? '/dashboard' : '/classroom';
        } else if ((isProtectedRoute || isAdminRoute) && !isAuth) {
          shouldRedirect = true; 
          redirectUrl = '/login';
        } else if (isAdminRoute && isAuth && userRole !== 'admin') {
          shouldRedirect = true; 
          redirectUrl = '/';
        }

        if (shouldRedirect) {
          setIsRedirecting(true); // Keeps the loader up during initial redirect
          router.replace(redirectUrl);
        }
        
        setMounted(true); // Safe to mount, isRedirecting will block children from flashing if invalid
      }
    };

    checkAuthSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Removed apiUrl dependency since we are using Axios

  // =====================================================================
  // 2. CLIENT-SIDE ROUTE GUARD (Runs instantly on every page click)
  // =====================================================================
  useEffect(() => {
    if (!mounted) return; // Let the initial fetch handle the first load

    const isProtectedRoute = pathname.startsWith('/classroom') || pathname === '/payment-success' || pathname === '/profile' || pathname === '/invoices';
    const isAdminRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

    let shouldRedirect = false;
    let redirectUrl = '';

    if (isAuthRoute && isAuthenticated) {
      shouldRedirect = true; 
      redirectUrl = user?.role === 'admin' ? '/dashboard' : '/classroom';
    } else if ((isProtectedRoute || isAdminRoute) && !isAuthenticated) {
      shouldRedirect = true; 
      redirectUrl = '/login';
    } else if (isAdminRoute && isAuthenticated && user?.role !== 'admin') {
      shouldRedirect = true; 
      redirectUrl = '/';
    }

    if (shouldRedirect) {
      setIsRedirecting(true); // Instantly cover the screen with the loader!
      router.replace(redirectUrl);
    } else {
      setIsRedirecting(false); // Valid route, gently fade out the loader
    }
  }, [pathname, mounted, isAuthenticated, user, router]);

  // =====================================================================
  // 3. THEME SWITCHER
  // =====================================================================
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

  const globalThemeClass = isCoding ? 'bg-[#161616] text-gray-200' : 'bg-[#EAEDEF] text-stone-900';
  
  // Dynamically calculate scrollbar colors based on the current active theme
  const activeTheme = mounted ? isCoding : initialTheme;
  const trackColor = activeTheme ? '#161616' : '#eaedef';
  const thumbColor = activeTheme ? '#333333' : '#c0c4c8';

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${mounted ? globalThemeClass : (initialTheme ? 'bg-[#161616]' : 'bg-neutral-50')} font-['Helvena']`}>
      
      {/* INSTANT SCROLLBAR INJECTION 
        Forces the browser to use the custom scrollbar from the first millisecond,
        eliminating the default scrollbar flash and layout shift.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        html {
          scrollbar-width: thin;
          scrollbar-color: ${thumbColor} ${trackColor};
          overflow-y: scroll !important;
        }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background-color: ${trackColor}; }
        ::-webkit-scrollbar-thumb { 
          background-color: ${thumbColor}; 
          border-radius: 10px; 
          border: 2px solid ${trackColor}; 
        }
        ::-webkit-scrollbar-thumb:hover { background-color: #fe6100; }
      `}} />

      {/* PERFECT SMOOTH LOADER */}
      <AnimatePresence>
        {/* We show the loader if the app hasn't mounted OR if a redirect is occurring */}
        {(!mounted || isRedirecting) && (
          <motion.div 
            key="app-loader"
            exit={{ opacity: 0, filter: "blur(10px)" }} // Premium smooth exit
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-[2147483647] flex justify-center items-center ${initialTheme ? 'bg-[#161616]' : 'bg-neutral-50'}`}
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative w-28 md:w-36"
              >
                <img 
                  src="/logo.svg" 
                  alt="Edvara" 
                  className={`w-full h-auto object-contain transition-all duration-500 ${initialTheme ? 'invert brightness-0' : ''}`} 
                />
              </motion.div>
              <div className={`w-32 h-1 rounded-full overflow-hidden relative ${initialTheme ? 'bg-white/10' : 'bg-gray-300'}`}>
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-[#FE6100] rounded-full" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN APP */}
      {/* We ONLY render the app if mounted is true AND we aren't currently redirecting */}
      {(mounted && !isRedirecting) && (
        <>
          {!isAuthPage && <Navbar />}
          <main className={!isAuthPage ? "pt-0" : ""}>
            {children}
          </main>
          {/* Hides footer on login/register AND any /dashboard route */}
          {!isAuthPage && !isDashboardPage && <Footer />}
        </>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/appSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Local Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Professionally using the environment variable with a fallback
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      dispatch(setAuth(data.user));
      router.push('/classroom'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Cleaned up the outer wrapper: Just a full screen flex container now
    <div className="min-h-screen w-full flex bg-neutral-50">
      
      {/* LEFT SIDE: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 z-10">
        <div className="w-full max-w-md p-8 rounded-xl shadow-[inset_-2px_-3px_22px_rgba(255,206,101,0.20),inset_2px_3px_3px_rgba(255,99,49,0.15)] outline outline-[1px] outline-zinc-200 bg-white flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-stone-950 text-3xl font-libre font-normal leading-tight">
              Welcome back!
            </h1>
            <p className="text-zinc-600 text-base font-helvena">
              Catch up on the course.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-zinc-500 text-sm font-helvena">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sachin@example.com"
                className="w-full h-11 p-3 bg-white rounded-lg outline outline-[1px] outline-zinc-300 focus:outline-[#FE6100] transition-all text-stone-900 font-helvena"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-500 text-sm font-helvena">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 p-3 bg-white rounded-lg outline outline-[1px] outline-zinc-300 focus:outline-[#FE6100] transition-all text-stone-900 font-helvena"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 mt-2 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-lg text-white text-sm font-medium hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex flex-col gap-4">
            <button 
              type="button"
              className="w-full h-11 p-2 bg-white rounded-lg outline outline-1 outline-zinc-300 flex justify-center items-center gap-3 hover:bg-zinc-50 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span className="text-stone-950 text-sm font-medium font-helvena">
                Continue with Google
              </span>
            </button>

            <div className="text-center mt-2">
              <span className="text-zinc-800 text-sm font-helvena">No account? </span>
              <Link href="/register" className="text-[#FE6100] text-sm font-semibold hover:underline">
                Create one
              </Link>
            </div>
          </div>

          <div className="text-center">
            <span className="text-zinc-500 text-xs font-helvena">
              By continuing, you agree to our <span className="font-medium text-zinc-700 cursor-pointer hover:underline">Terms</span> and <span className="font-medium text-zinc-700 cursor-pointer hover:underline">Privacy Policy</span>.
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Big Logo Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#161616] shadow-2xl flex-col justify-center items-center relative z-20">
        <img 
          src="/logo-light-text.svg" 
          alt="Edvara Logo Big" 
          className="w-96 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700"
        />
      </div>

    </div>
  );
}
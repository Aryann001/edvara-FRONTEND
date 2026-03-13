'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAuth } from '@/store/slices/appSlice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Grab the current domain preference from Redux to send to the backend
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI State
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // --- STEP 1: Handle Initial Registration (Sends OTP) ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'user', 
          preferredDomain: isCoding ? 'coding' : 'university' 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success! Backend sent the email. Switch UI to OTP step.
      setShowOtpStep(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: Handle OTP Verification (Logs User In) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Success! User is verified and logged in. Update Redux & Redirect.
      dispatch(setAuth(data.user));
      router.push('/classroom'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-neutral-50">
      
      {/* LEFT SIDE: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 z-10">
        <div className="w-full max-w-md p-8 rounded-xl shadow-[inset_-2px_-3px_22px_rgba(255,206,101,0.20),inset_2px_3px_3px_rgba(255,99,49,0.15)] outline outline-[1px] outline-zinc-200 bg-white flex flex-col gap-8 transition-all duration-500">
          
          {/* Dynamic Headings based on Step */}
          <div className="flex flex-col gap-2">
            <h1 className="text-stone-950 text-3xl font-libre font-normal leading-tight">
              {showOtpStep ? 'Verify your email' : 'Welcome Aboard!'}
            </h1>
            <p className="text-zinc-600 text-base font-helvena">
              {showOtpStep 
                ? `We sent a 6-digit code to ${email}.` 
                : 'Begin your journey today.'}
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-100 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Conditionally Render Step 1 (Register) or Step 2 (OTP) */}
          {!showOtpStep ? (
            <>
              {/* REGISTRATION FORM */}
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-500 text-sm font-helvena">Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sachin Sir"
                    className="w-full h-11 p-3 bg-white rounded-lg outline outline-[1px] outline-zinc-300 focus:outline-[#FE6100] transition-all text-stone-900 font-helvena"
                  />
                </div>

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
                    minLength={6}
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
                  {isLoading ? 'Creating Account...' : 'Get Started'}
                </button>
              </form>

              {/* Divider & Google Auth */}
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

                {/* Login Link */}
                <div className="text-center mt-2">
                  <span className="text-zinc-800 text-sm font-helvena">Already have an account? </span>
                  <Link href="/login" className="text-[#FE6100] text-sm font-semibold hover:underline">
                    Sign In
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* OTP VERIFICATION FORM */}
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-500 text-sm font-helvena">6-Digit OTP</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                    placeholder="123456"
                    className="w-full h-11 p-3 bg-white rounded-lg outline outline-[1px] outline-zinc-300 focus:outline-[#FE6100] transition-all text-stone-900 font-helvena tracking-[0.5em] text-center text-lg"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || otp.length < 6}
                  className="w-full h-11 mt-2 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-lg text-white text-sm font-medium hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setShowOtpStep(false)}
                  className="text-zinc-500 text-sm mt-2 hover:text-stone-900 transition-colors"
                >
                  ← Back to Registration
                </button>
              </form>
            </>
          )}

          {/* Terms and Privacy (Stays at the bottom of the card) */}
          <div className="text-center mt-2">
            <span className="text-zinc-500 text-xs font-helvena">
              By continuing, you agree to our <span className="font-medium text-zinc-700 cursor-pointer hover:underline">Terms</span> and <span className="font-medium text-zinc-700 cursor-pointer hover:underline">Privacy Policy</span>.
            </span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Big Logo Panel (Matches Login Page) */}
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
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/appSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Pencil } from 'lucide-react';
import api from '@/services/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // --- STATE ---
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- HANDLERS ---
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otpValues.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.put('/auth/reset-password', { 
        email, 
        otp: finalOtp, 
        newPassword 
      });

      // Backend logs user in automatically upon reset
      dispatch(setAuth(data.user));
      router.push('/classroom'); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP or failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Logic
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3 } }
  };

  return (
    <div className="fixed inset-0 z-50 w-full flex bg-neutral-100 overflow-hidden font-['Helvena']">
      
      {/* MOBILE LOGO */}
      <div className="absolute top-6 left-6 z-50 lg:hidden">
        <Link href="/">
          <img src="/logo-dark-text.svg" alt="Edvara" className="h-8 transition-opacity hover:opacity-80" />
        </Link>
      </div>

      {/* --- LEFT SIDE: Branding Panel --- */}
      <div className="hidden lg:flex w-[45%] xl:w-[40%] bg-[#FE6100] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-col justify-between items-start pt-14 px-14 relative z-10 overflow-hidden">
        <div className="flex flex-col gap-10 z-20">
          <Link href="/">
            <img src="/whitelogoforbentogrid.svg" alt="Edvara" className="w-32 h-auto hover:opacity-90 transition-opacity" />
          </Link>
          <h2 className="text-white text-5xl xl:text-6xl font-normal font-['Libre_Baskerville'] leading-tight italic">
            Padhai bhi, <br/>placement bhi.
          </h2>
        </div>
        <img 
          src="/sachinHero.png" 
          alt="Mentor" 
          className="w-full max-w-[600px] xl:max-w-[750px] object-contain object-bottom self-center mt-auto z-10"
        />
      </div>

      {/* --- RIGHT SIDE: Form Container --- */}
      <div className="flex-1 flex flex-col p-5 sm:p-10 relative z-20 h-full overflow-y-auto no-scrollbar">
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[500px] mx-auto mt-16 lg:mt-0 pb-10 lg:pb-0">
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                variants={slideVariants}
                initial="hidden" animate="visible" exit="exit"
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="flex flex-col justify-center items-center w-full mb-2">
                  <h2 className="text-center text-[#FE6100] text-xl sm:text-3xl font-normal font-['Libre_Baskerville'] italic leading-tight">
                    Recover Account
                  </h2>
                  <h1 className="text-center text-neutral-950 text-2xl sm:text-4xl font-medium font-['Helvena']">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-500 text-sm mt-2 text-center">
                    Enter your email address and we'll send you a 6-digit OTP to reset your password.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center">
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRequestOTP} className="w-full flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-black text-sm font-medium">Email</label>
                    <input 
                      type="email" required disabled={isLoading}
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@edvara.com"
                      className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                    />
                  </div>

                  <button 
                    type="submit" disabled={isLoading}
                    className="w-full h-12 mt-2 bg-neutral-950 rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-70 group"
                  >
                    <span className="text-white text-sm font-medium leading-5">
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                
                <Link href="/login" className="text-neutral-500 text-sm font-medium hover:text-neutral-900 transition-colors">
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                variants={slideVariants}
                initial="hidden" animate="visible" exit="exit"
                className="w-full flex flex-col items-center gap-8"
              >
                <div className="w-full flex flex-col justify-center items-center gap-2 text-center">
                  <h1 className="text-black text-3xl sm:text-4xl font-medium">Reset Password</h1>
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    <span className="text-gray-600 text-sm sm:text-base font-normal">
                      Enter the OTP sent to <span className="font-semibold text-neutral-900">{email}</span>
                    </span>
                    <button 
                      onClick={() => setStep(1)}
                      className="p-1.5 rounded-md transition-colors group hover:bg-orange-50"
                      title="Edit Email"
                    >
                      <Pencil className="w-4 h-4 text-[#FE6100] group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center">
                      {error}
                    </motion.div>
                  )}
                  {message && !error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="w-full p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg font-medium text-center">
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleResetPassword} className="w-full flex flex-col items-center gap-8">
                  {/* OTP Inputs */}
                  <div className="w-full flex justify-center items-center gap-2 sm:gap-4">
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text" inputMode="numeric" maxLength={1}
                        value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)} disabled={isLoading}
                        className={`w-12 h-14 sm:w-16 sm:h-16 rounded-lg bg-white outline outline-1 flex justify-center items-center text-center text-xl font-semibold shadow-sm transition-all focus:outline-2 ${
                          digit ? 'outline-[#FE6100] text-[#FE6100]' : 'outline-neutral-300 text-gray-900 focus:outline-[#FE6100]'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="w-full max-w-sm flex flex-col gap-4">
                    {/* New Password Input */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 text-left">
                      <label className="text-black text-sm font-medium">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          required disabled={isLoading} minLength={6}
                          value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 pl-3 pr-10 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                        />
                        <button 
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={isLoading || otpValues.join('').length < 6}
                      className="w-full h-12 bg-neutral-950 rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-70 group mt-2"
                    >
                      <span className="text-white text-sm font-medium leading-5">
                        {isLoading ? 'Updating...' : 'Set Password & Login'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
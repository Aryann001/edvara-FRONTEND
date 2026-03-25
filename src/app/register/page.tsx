'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Pencil, Phone } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/appSlice';
import api from '@/services/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // <-- NEW

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // --- FORM STATE ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- OTP STATE ---
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- UI STATE ---
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [showPhoneStep, setShowPhoneStep] = useState(false); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- ANIMATION VARIANTS ---
  const slideVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1, 
      transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } 
    },
    exit: { 
      opacity: 0, 
      x: -30, 
      scale: 0.98, 
      transition: { duration: 0.3, ease: 'easeInOut' as const } 
    }
  };

  // --- HANDLERS ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const { data } = await api.post('/auth/register', { 
        name: fullName, email, phone, password, role: 'user', preferredDomain: 'university' 
      });

      if (!data) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success! Backend sent the email. Switch UI to OTP step.
      setShowOtpStep(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: GOOGLE SUCCESS HANDLER ---
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    
    try {
      // Send the secure Google ID Token to your Node.js backend
      const { data } = await api.post('/auth/google', {
        tokenId: credentialResponse.credential,
        preferredDomain: 'university'
      });

      if (!data) throw new Error('Google authentication failed');

      // Update Redux with logged in user
      dispatch(setAuth(data.user));
      
      // UX Note: Currently your backend doesn't return the `phone` field in `sendTokenResponse`.
      // If you update your backend to return it, you can check `if (!data.user.phone)` here.
      // For now, we will smoothly push them to the classroom.
      router.push('/classroom');

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Google Auth Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/update-phone', { phone });

      if (!data) {
        throw new Error(data.message || 'Failed to update phone number');
      }

      dispatch(setAuth(data.user));
      router.push('/classroom');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otpValues.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/verify-email', { email, otp: finalOtp });

      if (!data) {
        throw new Error(data.message || 'Invalid OTP');
      }

      dispatch(setAuth(data.user));
      router.push('/classroom'); 
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="fixed inset-0 z-50 w-full flex bg-neutral-100 overflow-hidden font-['Helvena']">

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

        {/* --- RIGHT SIDE: Interactive Form Container --- */}
        <div className="flex-1 flex flex-col p-5 sm:p-10 relative z-20 h-full overflow-y-auto no-scrollbar">
          
          {/* MOBILE LOGO */}
          <div className="w-full flex justify-start lg:hidden shrink-0 pt-2 pb-6">
            <Link href="/">
              <img src="/logo-dark-text.svg" alt="Edvara" className="h-8" />
            </Link>
          </div>

          {/* Form Wrapper */}
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[500px] mx-auto py-10 lg:py-0">
            
            <AnimatePresence mode="wait">
              {showPhoneStep ? (

                /* --- STEP 3: PHONE COLLECTION --- */
                <motion.div 
                  key="phone-form"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full flex flex-col items-center gap-6 py-10"
                >
                  <div className="w-full flex flex-col justify-center items-center gap-2 text-center mb-4">
                    <h2 className="text-center text-[#FE6100] text-xl sm:text-2xl font-normal font-['Libre_Baskerville'] italic leading-tight">
                      Almost there!
                    </h2>
                    <h1 className="text-black text-3xl sm:text-4xl font-medium font-['Helvena']">
                      Complete Your Profile
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base font-normal mt-2">
                      Please provide your phone number to secure your account.
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-black text-sm font-medium font-['Helvena']">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="tel" 
                          required disabled={isLoading}
                          value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full h-11 pl-10 pr-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading || phone.length < 10}
                      className="w-full h-12 mt-2 bg-neutral-950 rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-70 group"
                    >
                      <span className="text-white text-sm font-medium font-['Helvena'] leading-5">
                        {isLoading ? 'Saving...' : 'Complete Registration'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </motion.div>

              ) : !showOtpStep ? (
                
                /* --- STEP 1: REGISTRATION FORM --- */
                <motion.div 
                  key="register-form"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full flex flex-col items-center gap-6"
                >
                  <div className="flex flex-col justify-center items-center mb-2 w-full">
                    <h2 className="text-center text-[#FE6100] text-xl sm:text-3xl font-normal font-['Libre_Baskerville'] italic leading-tight">
                      Welcome Aboard!
                    </h2>
                    <h1 className="text-center text-neutral-950 text-2xl sm:text-4xl font-medium font-['Helvena']">
                      Create Your Account
                    </h1>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleRegister} className="w-full flex flex-col gap-4 sm:gap-5">
                    <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-5">
                      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
                        <label className="text-black text-sm font-medium font-['Helvena']">First Name</label>
                        <input 
                          type="text" 
                          required disabled={isLoading}
                          value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Sachin"
                          className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
                        <label className="text-black text-sm font-medium font-['Helvena']">Last Name</label>
                        <input 
                          type="text" 
                          required disabled={isLoading}
                          value={lastName} onChange={(e) => setLastName(e.target.value)}
                          placeholder="Dwivedi"
                          className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <label className="text-black text-sm font-medium font-['Helvena']">Phone Number</label>
                      <input 
                        type="tel" 
                        required disabled={isLoading}
                        value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <label className="text-black text-sm font-medium font-['Helvena']">Email</label>
                      <input 
                        type="email" 
                        required disabled={isLoading}
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@edvara.com"
                        className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <label className="text-black text-sm font-medium font-['Helvena']">Password</label>
                      <input 
                        type="password" 
                        required minLength={6} disabled={isLoading}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 mt-2 bg-neutral-950 rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-70 group"
                    >
                      <span className="text-white text-sm font-medium font-['Helvena'] leading-5">
                        {isLoading ? 'Registering...' : 'Register Now'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>

                  <div className="w-full flex justify-center items-center gap-6 mt-1 sm:mt-2">
                    <div className="flex-1 h-[1px] bg-gray-300"></div>
                    <span className="text-black text-base font-medium font-['Helvena']">or</span>
                    <div className="flex-1 h-[1px] bg-gray-300"></div>
                  </div>

                  {/* OFFICIAL GOOGLE LOGIN COMPONENT */}
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google popup was closed or failed.')}
                      useOneTap
                      theme="outline"
                      size="large"
                      width="100%"
                      text="signup_with"
                      shape="rectangular"
                    />
                  </div>

                  <div className="text-center mt-2">
                    <span className="text-neutral-950 text-sm font-medium font-['Inter']">Already have an account? </span>
                    <Link href="/login" className="text-[#FE6100] text-sm font-bold font-['Helvena'] hover:underline">
                      Sign In
                    </Link>
                  </div>
                </motion.div>

              ) : (

                /* --- STEP 2: OTP VERIFICATION --- */
                <motion.div 
                  key="otp-form"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full flex flex-col items-center gap-8 py-10"
                >
                  <div className="w-full flex flex-col justify-center items-center gap-2 text-center">
                    <h1 className="text-black text-3xl sm:text-4xl font-medium font-['Helvena']">OTP Verification</h1>
                    <div className="flex justify-center items-center gap-2 flex-wrap">
                      <span className="text-gray-600 text-sm sm:text-base font-normal font-['Helvena']">
                        Enter the OTP sent to <span className="font-semibold text-neutral-900">{email}</span>
                      </span>
                      <button 
                        onClick={() => setShowOtpStep(false)}
                        className="p-1.5 rounded-md transition-colors group hover:bg-orange-50"
                        title="Edit Email"
                      >
                        <Pencil className="w-4 h-4 text-[#FE6100] group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="w-full max-w-sm p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center gap-8">
                    <div className="w-full flex justify-center items-center gap-2 sm:gap-4">
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          disabled={isLoading}
                          className={`w-12 h-14 sm:w-16 sm:h-16 rounded-lg bg-white outline outline-1 flex justify-center items-center text-center text-xl font-semibold font-['Inter'] shadow-sm transition-all focus:outline-2 ${
                            digit ? 'outline-[#FE6100] text-[#FE6100]' : 'outline-neutral-300 text-gray-900 focus:outline-[#FE6100]'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="w-full max-w-sm flex flex-col gap-4">
                      <button 
                        type="submit" 
                        disabled={isLoading || otpValues.join('').length < 6}
                        className="w-full h-12 bg-neutral-950 rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-70 group"
                      >
                        <span className="text-white text-sm font-medium font-['Helvena'] leading-5">
                          {isLoading ? 'Verifying...' : 'Verify & Continue'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        type="button" 
                        disabled={isLoading}
                        onClick={handleRegister} 
                        className="text-center text-[#FE6100] text-sm font-medium font-['Inter'] hover:underline disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </GoogleOAuthProvider>
  );
}
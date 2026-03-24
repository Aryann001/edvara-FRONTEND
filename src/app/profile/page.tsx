'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/appSlice';
import api from '@/services/api';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  
  // Read state from Redux for dynamic theming and user data
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const user = useAppSelector((state: any) => state.app.user); 

  // Local state for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // State and ref for the file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Populate local state when user data loads
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // --- THE UPLOAD HANDLER ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB on the frontend)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max size is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file); 

    setIsUploading(true);
    try {
      const { data } = await api.put('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update Redux state with the new avatar URL so the UI updates instantly
      dispatch(setAuth({ ...user, avatar: data.data.url }));
      
    } catch (error: any) {
      console.error('Failed to upload image', error);
      alert(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  // --- THEME CONSTANTS ---
  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-white/70" : "text-gray-600";
  const sectionTitleColor = isCoding ? "text-white" : "text-black";
  
  // Card & Input themes
  const cardBg = isCoding ? "bg-stone-950 outline-neutral-800" : "bg-white outline-gray-200";
  const inputBg = isCoding ? "bg-stone-950 outline-slate-800" : "bg-white outline-neutral-200";
  const btnBg = isCoding ? "bg-stone-950 outline-neutral-800 hover:bg-white/5" : "bg-white outline-neutral-200 hover:bg-neutral-50";

  return (
    <div className={`min-h-screen w-full pt-[100px] lg:pt-[140px] pb-14 flex justify-center ${bgTheme} font-['Helvena'] transition-colors duration-500`}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[900px] mx-auto px-5 sm:px-8 md:px-12 flex flex-col justify-start items-center gap-8 md:gap-10"
      >
        
        {/* Header - Left Aligned inside the centered container */}
        <div className="w-full flex justify-start">
          <h1 className={`${textMain} text-2xl md:text-3xl font-bold`}>
            My Profile
          </h1>
        </div>

        <div className="w-full flex flex-col justify-start items-start gap-8 md:gap-10">
          
          {/* ========================================== */}
          {/* SECTION 1: PROFILE PHOTO */}
          {/* ========================================== */}
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <h2 className={`${sectionTitleColor} text-base font-medium font-['Geist'] leading-6`}>
              Profile Photo
            </h2>
            
            <div className={`w-full p-5 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col justify-center items-start gap-5 transition-colors ${cardBg}`}>
              <div className="w-full flex flex-col sm:flex-row justify-start items-start sm:items-end gap-5">
                
                {/* Avatar Image */}
                {user?.avatar ? (
                  <img className="w-24 h-24 rounded-xl object-cover shadow-sm shrink-0" src={user.avatar} alt="Profile" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-orange-600 flex justify-center items-center shadow-sm shrink-0">
                    <span className="text-white text-4xl font-medium">
                      {firstName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                {/* Upload Actions */}
                <div className="flex flex-col justify-end items-start gap-2">
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`px-5 py-2 rounded-lg outline outline-1 outline-offset-[-1px] inline-flex justify-center items-center gap-2 overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btnBg}`}
                  >
                    <Camera className={`w-4 h-4 ${sectionTitleColor}`} />
                    <span className={`justify-center ${sectionTitleColor} text-sm font-medium`}>
                      {isUploading ? 'Uploading...' : 'Update Photo'}
                    </span>
                  </button>
                  <p className={`justify-start text-sm font-normal font-['Geist'] ${textSub}`}>
                    Accepted formats: JPG, PNG (max 5 MB).
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* SECTION 2: PERSONAL INFORMATION */}
          {/* ========================================== */}
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <h2 className={`${sectionTitleColor} text-base font-medium font-['Geist'] leading-6`}>
              Personal Information
            </h2>

            <div className={`w-full p-5 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col gap-5 transition-colors ${cardBg}`}>
              
              {/* Row 1: Name (Responsive Grid) */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-[#FE6100] ${inputBg} ${textSub} text-sm font-normal`}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-[#FE6100] ${inputBg} ${textSub} text-sm font-normal`}
                  />
                </div>
              </div>

              {/* Row 2: Contact (Responsive Grid) */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-[#FE6100] ${inputBg} ${textSub} text-sm font-normal`}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-[#FE6100] ${inputBg} ${textSub} text-sm font-normal`}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ========================================== */}
          {/* SECTION 3: YOUR LEARNING */}
          {/* ========================================== */}
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <h2 className={`${sectionTitleColor} text-base font-medium font-['Geist'] leading-6`}>
              Your Learning
            </h2>

            <div className={`w-full p-5 rounded-xl outline outline-1 outline-offset-[-1px] transition-colors ${cardBg}`}>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div className="flex flex-col justify-start items-start gap-1.5 sm:gap-2">
                  <span className={`${textSub} text-sm font-normal`}>Courses Enrolled</span>
                  <span className={`${sectionTitleColor} text-sm font-medium`}>3</span>
                </div>
                
                <div className="flex flex-col justify-start items-start gap-1.5 sm:gap-2">
                  <span className={`${textSub} text-sm font-normal`}>Currently learning</span>
                  <span className={`${sectionTitleColor} text-sm font-medium`}>JAVA + DSA</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
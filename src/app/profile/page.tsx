'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
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
  const [preferredDomain, setPreferredDomain] = useState('coding');

  // State and ref for the file upload & saving
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Populate local state when user data loads
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.trim().split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setPreferredDomain(user.preferredDomain || 'coding');
    }
  }, [user]);

  // Check if form data differs from Redux state to enable/disable Save button
  const currentFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const hasChanges = 
    currentFullName !== user?.name || 
    email !== user?.email || 
    phone !== (user?.phone || '') ||
    preferredDomain !== (user?.preferredDomain || 'coding');

  // --- THE UPLOAD HANDLER ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB on the frontend)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File is too large. Max size is 5MB.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file); 

    setIsUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.put('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update Redux state with the new avatar URL so the UI updates instantly
      dispatch(setAuth({ ...user, avatar: data.data.url }));
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
    } catch (error: any) {
      console.error('Failed to upload image', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload image.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // --- THE PROFILE SAVE HANDLER ---
  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      let updatedUser = { ...user };

      // 1. Update Name, Email & Domain if changed
      if (currentFullName !== user.name || email !== user.email || preferredDomain !== user.preferredDomain) {
        const { data } = await api.put('/auth/updatedetails', { 
          name: currentFullName, 
          email,
          preferredDomain // Passes to backend 
        });
        updatedUser = { ...updatedUser, ...data.data, preferredDomain };
      }

      // 2. Update Phone if changed
      if (phone !== (user.phone || '')) {
        const { data } = await api.post('/auth/update-phone', { phone });
        updatedUser = { ...updatedUser, ...data.user };
      }

      // Update Redux state
      dispatch(setAuth(updatedUser));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error('Failed to update profile', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile details.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
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
        
        {/* Header */}
        <div className="w-full flex justify-between items-end">
          <h1 className={`text-[#FE6100] text-3xl md:text-4xl font-normal font-['Libre_Baskerville'] italic`}>
            My Profile
          </h1>
        </div>

        {/* Global Notification Banner */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className={`w-full p-4 rounded-xl border flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col justify-start items-start gap-8 md:gap-10">
          
          {/* ========================================== */}
          {/* SECTION 1: PROFILE PHOTO */}
          {/* ========================================== */}
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <h2 className={`${sectionTitleColor} text-xl font-normal font-['Libre_Baskerville'] italic`}>
              Profile Photo
            </h2>
            
            <div className={`w-full p-5 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col justify-center items-start gap-5 transition-colors ${cardBg}`}>
              <div className="w-full flex flex-col sm:flex-row justify-start items-start sm:items-end gap-5">
                
                {/* Avatar Image */}
                {user?.avatar ? (
                  <img className="w-24 h-24 rounded-xl object-cover shadow-sm shrink-0" src={user.avatar.url || user.avatar} alt="Profile" />
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
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`px-5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] inline-flex justify-center items-center gap-2 overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btnBg}`}
                  >
                    {isUploading ? (
                      <Loader2 className={`w-4 h-4 animate-spin ${sectionTitleColor}`} />
                    ) : (
                      <Camera className={`w-4 h-4 ${sectionTitleColor}`} />
                    )}
                    <span className={`justify-center ${sectionTitleColor} text-sm font-medium`}>
                      {isUploading ? 'Uploading...' : 'Update Photo'}
                    </span>
                  </button>
                  <p className={`justify-start text-xs sm:text-sm font-normal font-['Helvena'] ${textSub}`}>
                    Accepted formats: JPG, PNG, WEBP (max 5 MB).
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* SECTION 2: PERSONAL INFORMATION */}
          {/* ========================================== */}
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <h2 className={`${sectionTitleColor} text-xl font-normal font-['Libre_Baskerville'] italic`}>
              Personal Information
            </h2>

            <div className={`w-full p-5 sm:p-6 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col gap-6 transition-colors ${cardBg}`}>
              
              {/* Row 1: Name */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter First Name"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-2 focus:outline-[#FE6100] ${inputBg} ${textMain} text-sm font-medium placeholder:font-normal placeholder:opacity-50`}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter Last Name"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-2 focus:outline-[#FE6100] ${inputBg} ${textMain} text-sm font-medium placeholder:font-normal placeholder:opacity-50`}
                  />
                </div>
              </div>

              {/* Row 2: Contact */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Phone Number"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-2 focus:outline-[#FE6100] ${inputBg} ${textMain} text-sm font-medium placeholder:font-normal placeholder:opacity-50`}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email"
                    className={`w-full h-11 px-3.5 py-1 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center transition-all focus:outline-2 focus:outline-[#FE6100] ${inputBg} ${textMain} text-sm font-medium placeholder:font-normal placeholder:opacity-50`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* SECTION 3: PLATFORM PREFERENCES */}
          {/* ========================================== */}
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <h2 className={`${sectionTitleColor} text-xl font-normal font-['Libre_Baskerville'] italic`}>
              Account Details
            </h2>

            <div className={`w-full p-5 sm:p-6 rounded-xl outline outline-1 outline-offset-[-1px] transition-colors ${cardBg}`}>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                
                {/* Account Role (Read Only) */}
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Account Role</label>
                  <input 
                    type="text" 
                    value={user?.role || 'user'}
                    disabled
                    className={`w-full h-11 px-3.5 rounded-lg outline outline-1 outline-offset-[-1px] transition-all ${inputBg} ${textMain} opacity-60 text-sm font-medium capitalize cursor-not-allowed`}
                  />
                </div>
                
                {/* Preferred Domain (Editable) */}
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <label className={`${sectionTitleColor} text-sm font-medium`}>Preferred Domain</label>
                  <div className="relative w-full">
                    <select
                      value={preferredDomain}
                      onChange={(e) => setPreferredDomain(e.target.value)}
                      className={`w-full h-11 px-3.5 rounded-lg outline outline-1 outline-offset-[-1px] transition-all focus:outline-2 focus:outline-[#FE6100] ${inputBg} ${textMain} text-sm font-medium appearance-none cursor-pointer`}
                    >
                      <option value="coding">Coding</option>
                      <option value="university">University</option>
                    </select>
                    <div className={`absolute inset-y-0 right-4 flex items-center pointer-events-none ${textSub}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* GLOBAL SAVE ACTION */}
          {/* ========================================== */}
          <div className="w-full flex justify-end">
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving || !firstName || !email}
              className={`h-12 px-8 rounded-lg font-medium text-sm inline-flex items-center gap-2 transition-all active:scale-95 ${
                hasChanges && !isSaving && firstName && email
                  ? 'bg-[#FE6100] hover:bg-[#e05600] cursor-pointer text-white shadow-[0_4px_14px_rgba(254,97,0,0.3)]'
                  : `${inputBg} ${textSub} cursor-not-allowed`
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/appSlice';
import { User, Lock, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const currentUser = useAppSelector((state) => state.app.user);

  // Profile Form State
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Pre-fill profile data if Redux has it
  useEffect(() => {
    if (currentUser) {
      setProfileData({ name: currentUser.name || '', email: currentUser.email || '' });
    }
  }, [currentUser]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsUpdatingProfile(true);

    try {
      // Assuming your backend has an /auth/updatedetails route
      const res = await fetch(`${apiUrl}/auth/updatedetails`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setProfileSuccess('Profile updated successfully!');
      dispatch(setAuth(data.data)); // Update Redux state with new name/email
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setIsUpdatingPassword(true);

    try {
      // Assuming your backend has an /auth/updatepassword route
      const res = await fetch(`${apiUrl}/auth/updatepassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Theming Variables
  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';

  const containerVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-4xl mx-auto flex flex-col gap-8 pb-24">
      
      {/* Header */}
      <div>
        <h1 className={`text-4xl font-libre ${textColor}`}>Admin Settings</h1>
        <p className={`text-base font-helvena mt-2 ${subTextColor}`}>Manage your profile and security preferences.</p>
      </div>

      {/* Profile Section */}
      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm overflow-hidden transition-colors duration-500 ${cardBg}`}>
        <div className={`p-6 border-b ${borderColor} flex items-center gap-3`}>
          <User className={textColor} size={20} />
          <h2 className={`text-lg font-bold font-helvena ${textColor}`}>Profile Information</h2>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-6">
          {profileError && <div className="p-3 bg-red-100/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{profileError}</div>}
          {profileSuccess && <div className="p-3 bg-green-100/10 border border-green-500/50 text-green-500 rounded-lg text-sm flex items-center gap-2"><CheckCircle2 size={16}/> {profileSuccess}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Full Name</label>
              <input type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Email Address</label>
              <input type="email" required value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isUpdatingProfile} className="h-11 px-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {isUpdatingProfile ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm overflow-hidden transition-colors duration-500 ${cardBg}`}>
        <div className={`p-6 border-b ${borderColor} flex items-center gap-3`}>
          <Lock className={textColor} size={20} />
          <h2 className={`text-lg font-bold font-helvena ${textColor}`}>Change Password</h2>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="p-6 flex flex-col gap-6">
          {passwordError && <div className="p-3 bg-red-100/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="p-3 bg-green-100/10 border border-green-500/50 text-green-500 rounded-lg text-sm flex items-center gap-2"><CheckCircle2 size={16}/> {passwordSuccess}</div>}

          <div className="flex flex-col gap-2">
            <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Current Password</label>
            <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className={`w-full max-w-md h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>New Password</label>
            <input type="password" required minLength={6} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className={`w-full max-w-md h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
          </div>

          <div className="flex justify-start">
            <button type="submit" disabled={isUpdatingPassword} className="h-11 px-6 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black rounded-xl text-sm font-medium hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
              {isUpdatingPassword ? 'Updating...' : <><Shield size={16} /> Update Password</>}
            </button>
          </div>
        </form>
      </div>

    </motion.div>
  );
}
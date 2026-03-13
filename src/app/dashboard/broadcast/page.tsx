'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { Megaphone, Mail, MessageCircle, Users, Target, Send, CheckCircle2 } from 'lucide-react';

export default function BroadcastPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  // Form State
  const [target, setTarget] = useState<'all' | 'course' | 'specific'>('all');
  const [courseId, setCourseId] = useState('');
  const [specificUserId, setSpecificUserId] = useState('');
  
  const [channels, setChannels] = useState<{ email: boolean; whatsapp: boolean }>({
    email: true,
    whatsapp: false,
  });

  const [subject, setSubject] = useState('');
  const [htmlMessage, setHtmlMessage] = useState('');
  const [textMessage, setTextMessage] = useState('');

  // UI State
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const toggleChannel = (channel: 'email' | 'whatsapp') => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!channels.email && !channels.whatsapp) {
      return setErrorMsg('You must select at least one communication channel.');
    }
    if (channels.email && (!subject || !htmlMessage)) {
      return setErrorMsg('Subject and HTML Message are required for Email.');
    }
    if (channels.whatsapp && !textMessage) {
      return setErrorMsg('Text Message is required for WhatsApp.');
    }

    setIsSending(true);

    const activeChannels = [];
    if (channels.email) activeChannels.push('email');
    if (channels.whatsapp) activeChannels.push('whatsapp');

    try {
      const res = await fetch(`${apiUrl}/admin/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          target,
          courseId: target === 'course' ? courseId : undefined,
          specificUserId: target === 'specific' ? specificUserId : undefined,
          subject,
          htmlMessage,
          textMessage,
          channels: activeChannels,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to queue broadcast');

      setSuccessMsg(data.message);
      
      // Reset content fields after successful queue
      setSubject('');
      setHtmlMessage('');
      setTextMessage('');
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Theming variables
  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';

  const containerVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-6xl mx-auto flex flex-col gap-8 pb-24">
      
      {/* Header */}
      <div>
        <h1 className={`text-4xl font-libre ${textColor} flex items-center gap-3`}>
          <Megaphone size={32} className="text-[#FE6100]" /> Communication Center
        </h1>
        <p className={`text-base font-helvena mt-2 ${subTextColor}`}>Queue emails and WhatsApp messages to your students via Redis.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100/10 border border-red-500/50 text-red-500 rounded-xl text-sm font-medium backdrop-blur-md">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-100/10 border border-green-500/50 text-green-500 rounded-xl text-sm font-medium backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleBroadcast} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Configuration (Takes 4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Target Audience Segment */}
          <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col gap-4 transition-colors duration-500 ${cardBg}`}>
            <h2 className={`text-lg font-bold font-helvena flex items-center gap-2 ${textColor}`}>
              <Target size={18} /> Audience Target
            </h2>
            
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${target === 'all' ? 'border-[#FE6100] bg-[#FE6100]/5' : `${borderColor} hover:border-zinc-400 ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}`}>
                <input type="radio" name="target" checked={target === 'all'} onChange={() => setTarget('all')} className="accent-[#FE6100]" />
                <span className={`text-sm font-medium ${textColor}`}>All Students</span>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${target === 'course' ? 'border-[#FE6100] bg-[#FE6100]/5' : `${borderColor} hover:border-zinc-400 ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}`}>
                <input type="radio" name="target" checked={target === 'course'} onChange={() => setTarget('course')} className="accent-[#FE6100]" />
                <span className={`text-sm font-medium ${textColor}`}>Specific Course</span>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${target === 'specific' ? 'border-[#FE6100] bg-[#FE6100]/5' : `${borderColor} hover:border-zinc-400 ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}`}>
                <input type="radio" name="target" checked={target === 'specific'} onChange={() => setTarget('specific')} className="accent-[#FE6100]" />
                <span className={`text-sm font-medium ${textColor}`}>Specific User</span>
              </label>
            </div>

            {/* Dynamic Inputs based on Target */}
            <AnimatePresence mode="wait">
              {target === 'course' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 mt-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Course ID</label>
                  <input type="text" required value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Paste Course ID..." className={`w-full h-10 px-3 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                </motion.div>
              )}
              {target === 'specific' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 mt-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>User ID</label>
                  <input type="text" required value={specificUserId} onChange={(e) => setSpecificUserId(e.target.value)} placeholder="Paste User ID..." className={`w-full h-10 px-3 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Delivery Channels */}
          <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col gap-4 transition-colors duration-500 ${cardBg}`}>
            <h2 className={`text-lg font-bold font-helvena flex items-center gap-2 ${textColor}`}>
              <Users size={18} /> Delivery Channels
            </h2>
            
            <div className="flex flex-col gap-3">
              <div onClick={() => toggleChannel('email')} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${channels.email ? 'border-blue-500 bg-blue-500/5' : `${borderColor} hover:border-zinc-400 ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${channels.email ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}><Mail size={16} /></div>
                  <span className={`text-sm font-medium ${textColor}`}>Email Blast</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channels.email ? 'border-blue-500 bg-blue-500' : 'border-zinc-400'}`}>
                  {channels.email && <CheckCircle2 size={12} className="text-white" />}
                </div>
              </div>

              <div onClick={() => toggleChannel('whatsapp')} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${channels.whatsapp ? 'border-green-500 bg-green-500/5' : `${borderColor} hover:border-zinc-400 ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${channels.whatsapp ? 'bg-green-500/20 text-green-500' : 'bg-zinc-500/10 text-zinc-500'}`}><MessageCircle size={16} /></div>
                  <span className={`text-sm font-medium ${textColor}`}>WhatsApp Alert</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channels.whatsapp ? 'border-green-500 bg-green-500' : 'border-zinc-400'}`}>
                  {channels.whatsapp && <CheckCircle2 size={12} className="text-white" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Message Content (Takes 8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <div className={`p-8 rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col gap-6 transition-colors duration-500 ${cardBg}`}>
            
            {channels.email && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 pb-6 border-b border-zinc-500/20">
                <h2 className={`text-xl font-bold font-helvena flex items-center gap-2 ${textColor}`}>
                  <Mail className="text-blue-500" size={20} /> Compose Email
                </h2>
                
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Subject Line</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Important Update Regarding Your Course" className={`w-full h-12 px-4 rounded-xl border outline-none font-helvena text-base ${inputBg}`} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>HTML Message Body</label>
                  <textarea rows={8} value={htmlMessage} onChange={(e) => setHtmlMessage(e.target.value)} placeholder="<p>Write your raw HTML email template here...</p>" className={`w-full p-4 rounded-xl border outline-none font-mono text-sm resize-none ${inputBg}`} />
                  <p className={`text-xs ${subTextColor}`}>Input raw HTML. Inline styles are supported.</p>
                </div>
              </motion.div>
            )}

            {channels.whatsapp && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 pt-2">
                <h2 className={`text-xl font-bold font-helvena flex items-center gap-2 ${textColor}`}>
                  <MessageCircle className="text-green-500" size={20} /> Compose WhatsApp
                </h2>
                
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Plain Text Message</label>
                  <textarea rows={5} value={textMessage} onChange={(e) => setTextMessage(e.target.value)} placeholder="Write your WhatsApp alert here..." className={`w-full p-4 rounded-xl border outline-none font-helvena text-base resize-none ${inputBg}`} />
                </div>
              </motion.div>
            )}

            {!channels.email && !channels.whatsapp && (
              <div className={`py-12 text-center font-helvena ${subTextColor}`}>
                Please select at least one delivery channel from the left menu to compose a message.
              </div>
            )}
          </div>
        </div>

      </form>

      {/* Floating Action Bar */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl p-4 rounded-2xl border shadow-2xl flex justify-between items-center backdrop-blur-2xl z-50 transition-colors duration-500 ${cardBg}`}
      >
        <p className={`text-sm font-medium ${subTextColor}`}>Double-check your target audience before sending.</p>
        <button 
          onClick={handleBroadcast}
          disabled={isSending || (!channels.email && !channels.whatsapp)}
          className="h-12 px-8 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-bold tracking-wide hover:shadow-[0_0_15px_rgba(254,97,0,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
        >
          {isSending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Queueing Jobs...</> : <><Send size={18} /> Launch Broadcast</>}
        </button>
      </motion.div>

    </motion.div>
  );
}
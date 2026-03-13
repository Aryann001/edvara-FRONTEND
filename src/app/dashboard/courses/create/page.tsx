'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, FileText, IndianRupee, Calendar, Type, CheckCircle2, User as UserIcon, UploadCloud } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // Form State mapped to Course.js schema
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'coding', 
    price: '',
    validityInDays: '',
    mentorName: '',
    mentorDescription: '',
    // Coding specific
    category: '',
    level: 'beginner',
    // University specific
    universityName: '',
    semester: '',
    branch: '',
  });
  
  // NEW: Thumbnail state
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDomainSelect = (selectedDomain: 'coding' | 'university') => {
    setFormData({ ...formData, domain: selectedDomain });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // CRITICAL: We MUST use FormData to send a physical file alongside text data
    const payload = new FormData();
    
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('domain', formData.domain);
    payload.append('price', String(Number(formData.price) || 0));
    payload.append('validityInDays', String(formData.validityInDays ? Number(formData.validityInDays) : 0));
    payload.append('mentorName', formData.mentorName);
    payload.append('mentorDescription', formData.mentorDescription);

    if (formData.domain === 'coding') {
      payload.append('category', formData.category);
      payload.append('level', formData.level);
    } else {
      payload.append('universityName', formData.universityName);
      payload.append('semester', String(Number(formData.semester)));
      payload.append('branch', formData.branch);
    }

    // Append the thumbnail if the admin selected one
    if (thumbnail) {
      payload.append('thumbnail', thumbnail);
    }

    try {
      const res = await fetch(`${apiUrl}/courses`, {
        method: 'POST',
        // DO NOT set 'Content-Type': 'application/json' here!
        // The browser will automatically set the correct multipart/form-data boundary.
        credentials: 'include',
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course');

      router.push(`/dashboard/courses/${data.data._id}`); 
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-stone-900';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto flex flex-col gap-8 pb-32">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/courses" className={`flex items-center gap-2 text-sm w-fit hover:text-[#FE6100] transition-colors ${subTextColor}`}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div>
          <h1 className={`text-4xl font-libre ${textColor}`}>Create New Course</h1>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100/10 border border-red-500/50 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

      <form id="create-course-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className={`p-8 rounded-2xl border flex flex-col gap-6 ${cardBg}`}>
            <h2 className={`text-xl font-bold font-helvena ${textColor}`}>General Information</h2>
            
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${subTextColor}`}><Type size={16} className="inline mr-2"/> Course Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className={`h-12 px-4 rounded-xl border outline-none font-helvena text-base ${inputBg}`} />
            </div>

            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${subTextColor}`}><FileText size={16} className="inline mr-2"/> Description</label>
              <textarea name="description" required rows={4} value={formData.description} onChange={handleInputChange} className={`p-4 rounded-xl border outline-none font-helvena text-base resize-none ${inputBg}`} />
            </div>
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col gap-6 ${cardBg}`}>
            <h2 className={`text-xl font-bold font-helvena ${textColor}`}>Target Domain</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => handleDomainSelect('coding')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.domain === 'coding' ? 'border-blue-500 bg-blue-500/5' : `${borderColor}`}`}>
                <h3 className={`font-bold font-helvena ${textColor}`}>Coding</h3>
              </div>
              <div onClick={() => handleDomainSelect('university')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.domain === 'university' ? 'border-green-500 bg-green-500/5' : `${borderColor}`}`}>
                <h3 className={`font-bold font-helvena ${textColor}`}>University</h3>
              </div>
            </div>

            {/* DYNAMIC FIELDS BASED ON DOMAIN */}
            <AnimatePresence mode="wait">
              {formData.domain === 'coding' ? (
                <motion.div key="coding" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className={`text-xs uppercase tracking-wider ${subTextColor}`}>Category</label>
                    <input type="text" name="category" required placeholder="e.g. Web Dev" value={formData.category} onChange={handleInputChange} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={`text-xs uppercase tracking-wider ${subTextColor}`}>Level</label>
                    <select name="level" value={formData.level} onChange={handleInputChange} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="uni" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-3 gap-4 mt-2">
                  <div className="flex flex-col gap-2 col-span-3">
                    <label className={`text-xs uppercase tracking-wider ${subTextColor}`}>University Name</label>
                    <input type="text" name="universityName" required placeholder="e.g. RGPV" value={formData.universityName} onChange={handleInputChange} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className={`text-xs uppercase tracking-wider ${subTextColor}`}>Branch</label>
                    <input type="text" name="branch" required placeholder="e.g. CSE" value={formData.branch} onChange={handleInputChange} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={`text-xs uppercase tracking-wider ${subTextColor}`}>Semester</label>
                    <input type="number" name="semester" required min="1" max="8" value={formData.semester} onChange={handleInputChange} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-8">
          
          {/* NEW: Course Thumbnail Box */}
          <div className={`p-8 rounded-2xl border flex flex-col gap-6 ${cardBg}`}>
            <h2 className={`text-xl font-bold font-helvena ${textColor}`}>Course Thumbnail</h2>
            <div className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-500/5 transition-colors ${thumbnail ? 'border-[#FE6100]' : borderColor}`}>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              
              <div className={`p-3 rounded-full ${thumbnail ? 'bg-[#FE6100]/10 text-[#FE6100]' : 'bg-zinc-500/10 text-zinc-400'}`}>
                <UploadCloud size={24} />
              </div>
              <div className="text-center px-4">
                <p className={`text-sm font-medium ${thumbnail ? 'text-[#FE6100]' : textColor}`}>
                  {thumbnail ? thumbnail.name : 'Click or drag image to upload'}
                </p>
                {!thumbnail && <p className={`text-xs mt-1 ${subTextColor}`}>SVG, PNG, JPG (max. 2MB)</p>}
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col gap-6 ${cardBg}`}>
            <h2 className={`text-xl font-bold font-helvena ${textColor}`}>Pricing</h2>
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${subTextColor}`}><IndianRupee size={16} className="inline mr-2"/> Price (INR)</label>
              <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} className={`h-12 px-4 rounded-xl border outline-none font-helvena text-base ${inputBg}`} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${subTextColor}`}><Calendar size={16} className="inline mr-2"/> Validity (Days)</label>
              <input type="number" name="validityInDays" min="0" value={formData.validityInDays} onChange={handleInputChange} placeholder="0 for lifetime" className={`h-12 px-4 rounded-xl border outline-none font-helvena text-base ${inputBg}`} />
            </div>
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col gap-6 ${cardBg}`}>
            <h2 className={`text-xl font-bold font-helvena ${textColor}`}>Mentor Info</h2>
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${subTextColor}`}><UserIcon size={16} className="inline mr-2"/> Mentor Name</label>
              <input type="text" name="mentorName" required value={formData.mentorName} onChange={handleInputChange} className={`h-12 px-4 rounded-xl border outline-none font-helvena text-base ${inputBg}`} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${subTextColor}`}>Mentor Title/Bio</label>
              <textarea name="mentorDescription" rows={3} value={formData.mentorDescription} onChange={handleInputChange} className={`p-4 rounded-xl border outline-none font-helvena text-sm resize-none ${inputBg}`} />
            </div>
          </div>
        </div>
      </form>

      {/* Floating Action Bar */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl p-4 rounded-2xl border shadow-2xl flex justify-between items-center backdrop-blur-2xl z-50 ${cardBg}`}>
        <p className={`text-sm font-medium ${subTextColor}`}>Check domain-specific fields before publishing.</p>
        <button form="create-course-form" type="submit" disabled={isSubmitting} className="h-12 px-8 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-bold tracking-wide hover:scale-105 transition-all disabled:opacity-50">
          {isSubmitting ? 'Publishing...' : 'Publish Course'}
        </button>
      </motion.div>
    </motion.div>
  );
}
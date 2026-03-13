'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, Video, Plus, Trash2, UploadCloud, PlayCircle, Eye, EyeOff } from 'lucide-react';

export default function CourseManagerPage() {
  const { id: courseId } = useParams();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lecture Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    sequence: '',
    isFree: false,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // 1. Fetch Course & Populated Lectures
  const fetchCourse = async () => {
    try {
      const res = await fetch(`${apiUrl}/courses/${courseId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCourse(data.data);
    } catch (error) {
      console.error("Failed to fetch course details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId, apiUrl]);

  // 2. Handle Lecture Upload (Multipart Form Data)
  const handleUploadLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return alert("Please select a video file.");
    
    setIsUploading(true);

    // We must use FormData because we are sending a physical file
    const formData = new FormData();
    formData.append('title', lectureForm.title);
    formData.append('description', lectureForm.description);
    formData.append('sequence', lectureForm.sequence);
    formData.append('isFree', String(lectureForm.isFree));
    formData.append('video', videoFile); // The key 'video' must match multer upload.single('video')

    try {
      const res = await fetch(`${apiUrl}/courses/${courseId}/lectures`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // Browser automatically sets multipart boundary
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      // Success! Close modal and refresh the syllabus
      setIsModalOpen(false);
      setLectureForm({ title: '', description: '', sequence: '', isFree: false });
      setVideoFile(null);
      fetchCourse(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Handle Lecture Deletion
  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Delete this lecture permanently?')) return;
    try {
      await fetch(`${apiUrl}/lectures/${lectureId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchCourse(); // Refresh syllabus
    } catch (error) {
      console.error(error);
    }
  };

  // Theming Variables
  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-stone-900';
  const modalBg = isCoding ? 'bg-[#161616] border-zinc-800' : 'bg-white border-zinc-200';

  if (isLoading) return <div className="p-8 text-center text-[#FE6100]">Loading Course Data...</div>;
  if (!course) return <div className="p-8 text-center text-red-500">Course not found.</div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-24 relative">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/courses" className={`flex items-center gap-2 text-sm w-fit hover:text-[#FE6100] transition-colors ${subTextColor}`}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-3 inline-block ${course.preferredDomain === 'coding' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
              {course.preferredDomain}
            </span>
            <h1 className={`text-4xl font-libre ${textColor}`}>{course.title}</h1>
            <p className={`text-sm font-helvena mt-2 ${subTextColor}`}>₹{course.price} • {course.lectures?.length || 0} Lectures</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus size={18} /> Add Lecture
          </button>
        </div>
      </div>

      {/* Syllabus Manager Container */}
      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        <div className={`p-6 border-b ${borderColor} flex items-center gap-3`}>
          <Video className={textColor} size={20} />
          <h2 className={`text-lg font-bold font-helvena ${textColor}`}>Course Syllabus</h2>
        </div>

        <div className="flex flex-col">
          {(!course.lectures || course.lectures.length === 0) ? (
            <div className={`p-12 text-center font-helvena ${subTextColor}`}>
              No lectures uploaded yet. Click "Add Lecture" to build your syllabus.
            </div>
          ) : (
            course.lectures
              .sort((a: any, b: any) => a.sequence - b.sequence)
              .map((lecture: any, index: number) => (
              <div key={lecture._id} className={`p-6 border-b last:border-0 flex justify-between items-center group hover:bg-zinc-500/5 transition-colors ${borderColor}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isCoding ? 'bg-black/50 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                    {lecture.sequence || index + 1}
                  </div>
                  <div>
                    <h3 className={`font-medium font-helvena flex items-center gap-2 ${textColor}`}>
                      {lecture.title} 
                      {lecture.isFree && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-green-500/10 text-green-500">Free Preview</span>}
                    </h3>
                    <p className={`text-xs mt-1 max-w-xl truncate ${subTextColor}`}>{lecture.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium ${subTextColor}`}>{lecture.duration} mins</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteLecture(lecture._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: Upload Lecture */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isUploading && setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg p-8 rounded-2xl border shadow-2xl z-50 flex flex-col gap-6 ${modalBg}`}>
              
              <h2 className={`text-2xl font-libre ${textColor}`}>Upload Lecture</h2>
              
              <form onSubmit={handleUploadLecture} className="flex flex-col gap-4">
                
                {/* Title & Sequence */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Lecture Title</label>
                    <input type="text" required value={lectureForm.title} onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                  </div>
                  <div className="w-24 flex flex-col gap-1">
                    <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Sequence</label>
                    <input type="number" required value={lectureForm.sequence} onChange={(e) => setLectureForm({...lectureForm, sequence: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm text-center ${inputBg}`} />
                  </div>
                </div>

                {/* NEW: Folder/Unit Grouping */}
                <div className="flex flex-col gap-1">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Folder / Unit Name</label>
                  <input type="text" required placeholder="e.g. Unit 1: Introduction" value={(lectureForm as any).folderName || 'General'} onChange={(e) => setLectureForm({...lectureForm, folderName: e.target.value} as any)} className={`h-11 px-4 rounded-lg border outline-none font-helvena text-sm ${inputBg}`} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Description</label>
                  <textarea rows={2} required value={lectureForm.description} onChange={(e) => setLectureForm({...lectureForm, description: e.target.value})} className={`p-4 rounded-lg border outline-none font-helvena text-sm resize-none ${inputBg}`} />
                </div>

                {/* NEW: Resource Type Toggle */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Resource Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="resourceType" value="video" checked={(lectureForm as any).resourceType !== 'pdf'} onChange={() => setLectureForm({...lectureForm, resourceType: 'video'} as any)} className="accent-[#FE6100]" />
                      <span className={`text-sm ${textColor}`}>Video File</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="resourceType" value="pdf" checked={(lectureForm as any).resourceType === 'pdf'} onChange={() => setLectureForm({...lectureForm, resourceType: 'pdf'} as any)} className="accent-[#FE6100]" />
                      <span className={`text-sm ${textColor}`}>PDF Document</span>
                    </label>
                  </div>
                </div>

                {/* File Upload (Dynamically updates based on Resource Type) */}
                <div className="flex flex-col gap-1">
                  <div className={`relative w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-500/5 transition-colors ${videoFile ? 'border-[#FE6100]' : borderColor}`}>
                    <input 
                      type="file" 
                      accept={(lectureForm as any).resourceType === 'pdf' ? "application/pdf" : "video/*"} 
                      required 
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <UploadCloud className={videoFile ? 'text-[#FE6100]' : subTextColor} size={24} />
                    <span className={`text-sm mt-2 font-medium ${videoFile ? 'text-[#FE6100]' : textColor}`}>
                      {videoFile ? videoFile.name : `Upload ${(lectureForm as any).resourceType === 'pdf' ? 'PDF' : 'Video'}`}
                    </span>
                  </div>
                </div>

                {/* Free Preview Toggle */}
                <div className={`p-4 rounded-lg border flex justify-between items-center mt-2 ${inputBg}`}>
                  <div>
                    <h4 className={`text-sm font-medium ${textColor} flex items-center gap-2`}>
                      {lectureForm.isFree ? <Eye size={16} className="text-green-500"/> : <EyeOff size={16}/>} Free Preview
                    </h4>
                  </div>
                  <button type="button" onClick={() => setLectureForm({...lectureForm, isFree: !lectureForm.isFree})} className={`w-12 h-6 rounded-full p-1 transition-colors ${lectureForm.isFree ? 'bg-green-500' : 'bg-zinc-500'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${lectureForm.isFree ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className={`px-6 h-11 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-500/10 ${textColor}`}>Cancel</button>
                  <button type="submit" disabled={isUploading} className="px-6 h-11 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-lg text-white text-sm font-medium hover:opacity-90 flex items-center gap-2">
                    {isUploading ? 'Uploading...' : 'Save Resource'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, Video, Plus, Trash2, UploadCloud, Search, CheckCircle2, AlertCircle, FileText, Settings, Tag, MessageCircle } from 'lucide-react';
import api from '@/services/api';

export default function CourseManagerPage() {
  const params = useParams() as { id: string };
  const courseId = params.id;
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  // View State
  const [activeTab, setActiveTab] = useState<'lectures' | 'resources' | 'settings'>('lectures');

  // Modal States
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Lecture Form
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'reuse'>('upload');
  const [lectureForm, setLectureForm] = useState({ title: '', description: '', sequence: '', folderName: 'General', isFree: false, reuseVideoUrl: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Resource Form (Notes/PYQs)
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'notes' }); // 'notes' or 'pyqs'
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  // Quick Edit Form (Settings Tab)
  const [editForm, setEditForm] = useState({ mrp: '', tags: '', features: '', newFaqQ: '', newFaqA: '' });

  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');

  const fetchCourse = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      if (data.success) {
        setCourse(data.data);
        setEditForm({ 
          ...editForm, 
          mrp: data.data.mrp || '', 
          tags: data.data.tags?.join(', ') || '', 
          features: data.data.features?.join(', ') || '' 
        });
      }
    } catch (error: any) {
      setPageError(error.response?.data?.message || 'Course not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (courseId) fetchCourse(); }, [courseId]);

  // --- LECTURE HANDLER ---
  const handleUploadLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMethod === 'upload' && !videoFile) return alert("Select a video.");
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', lectureForm.title);
    formData.append('description', lectureForm.description);
    formData.append('sequence', lectureForm.sequence);
    formData.append('folderName', lectureForm.folderName);
    formData.append('resourceType', 'video');
    formData.append('isFree', String(lectureForm.isFree));
    
    if (uploadMethod === 'upload' && videoFile) formData.append('video', videoFile); 
    else if (uploadMethod === 'reuse') formData.append('reuseVideoUrl', lectureForm.reuseVideoUrl);

    try {
      const { data } = await api.post(`/courses/${courseId}/lectures`, formData);
      if (data.success) {
        setIsLectureModalOpen(false);
        setLectureForm({ title: '', description: '', sequence: '', folderName: 'General', isFree: false, reuseVideoUrl: '' });
        setVideoFile(null);
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // --- RESOURCE HANDLER (NOTES & PYQS) ---
  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceFile) return alert("Please select a PDF file.");
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', resourceForm.title);
    formData.append('type', resourceForm.type); // 'notes' or 'pyqs'
    formData.append('document', resourceFile); // Backend expects 'document'

    try {
      const { data } = await api.post(`/courses/${courseId}/resources`, formData);
      if (data.success) {
        setIsResourceModalOpen(false);
        setResourceForm({ title: '', type: 'notes' });
        setResourceFile(null);
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // --- SETTINGS HANDLER (Tags, Features, FAQs) ---
  const handleUpdateSettings = async () => {
    setIsUploading(true);
    try {
      const tagsArray = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const featuresArray = editForm.features.split(',').map(f => f.trim()).filter(Boolean);
      
      const payload: any = { mrp: Number(editForm.mrp), tags: tagsArray, features: featuresArray };

      // Append new FAQ if fields are filled
      if (editForm.newFaqQ && editForm.newFaqA) {
        payload.faqs = [...(course.faqs || []), { question: editForm.newFaqQ, answer: editForm.newFaqA }];
      }

      await api.put(`/courses/${courseId}`, payload);
      setEditForm({ ...editForm, newFaqQ: '', newFaqA: '' });
      alert('Course updated successfully!');
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (type: 'lecture' | 'faq', idStr: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      if (type === 'lecture') {
        await api.delete(`/lectures/${idStr}`);
      } else if (type === 'faq') {
        const newFaqs = course.faqs.filter((f: any) => f._id !== idStr);
        await api.put(`/courses/${courseId}`, { faqs: newFaqs });
      }
      fetchCourse(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // THEME CONSTANTS
  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-stone-900';
  const modalBg = isCoding ? 'bg-[#161616] border-zinc-800' : 'bg-white border-zinc-200';

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#FE6100] border-t-transparent rounded-full animate-spin" /></div>;
  if (pageError || !course) return <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-4"><AlertCircle className="w-16 h-16 text-red-500" /><h2 className={`text-2xl font-bold ${textColor}`}>{pageError}</h2></div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-24 relative font-['Helvena']">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/courses" className={`flex items-center gap-2 text-sm w-fit hover:text-[#FE6100] transition-colors ${subTextColor}`}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className={`text-3xl sm:text-4xl font-['Libre_Baskerville'] italic ${textColor}`}>{course.title}</h1>
            <p className={`text-sm mt-2 ${subTextColor}`}>₹{course.price} {course.mrp > course.price && `(MRP: ₹${course.mrp})`}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-zinc-500/20 pb-2">
        <button onClick={() => setActiveTab('lectures')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'lectures' ? 'bg-[#FE6100]/10 text-[#FE6100] border-b-2 border-[#FE6100]' : `${subTextColor} hover:bg-zinc-500/10`}`}>Video Lectures</button>
        <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'resources' ? 'bg-[#FE6100]/10 text-[#FE6100] border-b-2 border-[#FE6100]' : `${subTextColor} hover:bg-zinc-500/10`}`}>Study Materials (PDFs)</button>
        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'settings' ? 'bg-[#FE6100]/10 text-[#FE6100] border-b-2 border-[#FE6100]' : `${subTextColor} hover:bg-zinc-500/10`}`}>Settings & FAQs</button>
      </div>

      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        
        {/* --- TAB 1: LECTURES --- */}
        {activeTab === 'lectures' && (
          <>
            <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center gap-3`}>
              <div className="flex items-center gap-2"><Video className={textColor} size={20} /> <h2 className={`text-lg font-bold ${textColor}`}>Course Syllabus</h2></div>
              <button onClick={() => setIsLectureModalOpen(true)} className="h-10 px-4 bg-[#FE6100] rounded-lg text-white text-sm font-medium flex items-center gap-2"><Plus size={16}/> Add Lecture</button>
            </div>
            <div className="flex flex-col">
              {(!course.lectures || course.lectures.length === 0) ? (
                <div className={`p-12 text-center ${subTextColor}`}>No lectures uploaded yet.</div>
              ) : (
                course.lectures.sort((a: any, b: any) => a.sequence - b.sequence).map((lecture: any) => (
                  <div key={lecture._id} className={`p-4 sm:p-6 border-b last:border-0 flex justify-between items-center group hover:bg-zinc-500/5 ${borderColor}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-[#FE6100]/10 text-[#FE6100]`}>{lecture.sequence}</div>
                      <div>
                        <h3 className={`font-medium ${textColor}`}>{lecture.title}</h3>
                        <p className={`text-xs ${subTextColor}`}>Folder: {lecture.folderName}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteItem('lecture', lecture._id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- TAB 2: RESOURCES (Notes/PYQs) --- */}
        {activeTab === 'resources' && (
          <>
            <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center gap-3`}>
              <div className="flex items-center gap-2"><FileText className={textColor} size={20} /> <h2 className={`text-lg font-bold ${textColor}`}>Study Materials</h2></div>
              <button onClick={() => setIsResourceModalOpen(true)} className="h-10 px-4 bg-blue-600 rounded-lg text-white text-sm font-medium flex items-center gap-2"><UploadCloud size={16}/> Upload PDF</button>
            </div>
            
            <div className="p-6">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textColor}`}>Course Notes</h3>
              {course.notes?.length > 0 ? course.notes.map((note: any) => (
                <div key={note._id} className={`p-4 mb-2 rounded-lg border ${borderColor} flex justify-between items-center`}>
                  <div className="flex items-center gap-3"><FileText size={16} className="text-blue-500"/><span className={textColor}>{note.title}</span><span className={`text-xs ${subTextColor}`}>({note.fileSize})</span></div>
                </div>
              )) : <p className={`text-sm mb-6 ${subTextColor}`}>No notes uploaded.</p>}

              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 mt-8 ${textColor}`}>Previous Year Questions (PYQs)</h3>
              {course.pyqs?.length > 0 ? course.pyqs.map((pyq: any) => (
                <div key={pyq._id} className={`p-4 mb-2 rounded-lg border ${borderColor} flex justify-between items-center`}>
                  <div className="flex items-center gap-3"><FileText size={16} className="text-purple-500"/><span className={textColor}>{pyq.title}</span><span className={`text-xs ${subTextColor}`}>({pyq.fileSize})</span></div>
                </div>
              )) : <p className={`text-sm ${subTextColor}`}>No PYQs uploaded.</p>}
            </div>
          </>
        )}

        {/* --- TAB 3: SETTINGS & FAQs --- */}
        {activeTab === 'settings' && (
          <div className="p-6 flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className={`text-xs uppercase ${subTextColor}`}>MRP (Original Price)</label>
                <input type="number" value={editForm.mrp} onChange={e => setEditForm({...editForm, mrp: e.target.value})} className={`h-10 px-3 rounded-md border outline-none ${inputBg}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs uppercase ${subTextColor}`}>Tags (Comma separated)</label>
                <input type="text" placeholder="Job Ready, MERN Stack" value={editForm.tags} onChange={e => setEditForm({...editForm, tags: e.target.value})} className={`h-10 px-3 rounded-md border outline-none ${inputBg}`} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className={`text-xs uppercase ${subTextColor}`}>Features (Comma separated)</label>
                <input type="text" placeholder="100% Syllabus Covered, Doubt Support" value={editForm.features} onChange={e => setEditForm({...editForm, features: e.target.value})} className={`h-10 px-3 rounded-md border outline-none ${inputBg}`} />
              </div>
            </div>

            <div className={`border-t ${borderColor} pt-6`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${textColor}`}><MessageCircle size={18}/> Manage FAQs</h3>
              
              {course.faqs?.map((faq: any) => (
                <div key={faq._id} className={`p-4 rounded-lg border mb-3 flex justify-between items-start ${borderColor}`}>
                  <div className="flex flex-col gap-1">
                    <p className={`font-semibold ${textColor}`}>Q: {faq.question}</p>
                    <p className={`text-sm ${subTextColor}`}>A: {faq.answer}</p>
                  </div>
                  <button onClick={() => handleDeleteItem('faq', faq._id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}

              <div className={`p-4 rounded-lg border mt-4 ${borderColor} ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${textColor}`}>Add New FAQ</h4>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Question..." value={editForm.newFaqQ} onChange={e => setEditForm({...editForm, newFaqQ: e.target.value})} className={`h-10 px-3 rounded-md border outline-none ${inputBg}`} />
                  <textarea placeholder="Answer..." rows={2} value={editForm.newFaqA} onChange={e => setEditForm({...editForm, newFaqA: e.target.value})} className={`p-3 rounded-md border outline-none resize-none ${inputBg}`} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleUpdateSettings} disabled={isUploading} className="px-6 h-11 bg-green-600 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50">
                {isUploading ? 'Saving...' : 'Save Settings & FAQs'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: LECTURE UPLOAD */}
      <AnimatePresence>
        {isLectureModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isUploading && setIsLectureModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed top-[5%] sm:top-[10%] left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-2xl p-6 rounded-2xl border shadow-2xl z-50 flex flex-col gap-6 max-h-[90vh] overflow-y-auto ${modalBg}`}>
              <h2 className={`text-2xl font-libre ${textColor}`}>Add Video Lecture</h2>
              <form onSubmit={handleUploadLecture} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1"><label className={`text-xs uppercase ${subTextColor}`}>Title</label><input type="text" required value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title: e.target.value})} className={`h-11 px-4 rounded-lg border ${inputBg}`} /></div>
                  <div className="w-24 flex flex-col gap-1"><label className={`text-xs uppercase ${subTextColor}`}>Seq #</label><input type="number" required value={lectureForm.sequence} onChange={e => setLectureForm({...lectureForm, sequence: e.target.value})} className={`h-11 px-4 rounded-lg border text-center ${inputBg}`} /></div>
                </div>
                <div className="flex flex-col gap-1"><label className={`text-xs uppercase ${subTextColor}`}>Folder Name</label><input type="text" required placeholder="e.g. Unit 1" value={lectureForm.folderName} onChange={e => setLectureForm({...lectureForm, folderName: e.target.value})} className={`h-11 px-4 rounded-lg border ${inputBg}`} /></div>
                <div className="flex flex-col gap-1"><label className={`text-xs uppercase ${subTextColor}`}>Description</label><textarea rows={2} required value={lectureForm.description} onChange={e => setLectureForm({...lectureForm, description: e.target.value})} className={`p-3 rounded-lg border resize-none ${inputBg}`} /></div>
                
                <div className={`p-4 rounded-xl border flex flex-col gap-4 ${isCoding ? 'bg-black/30' : 'bg-zinc-50'}`}>
                  <div className="flex gap-2 p-1 bg-zinc-500/10 rounded-lg w-fit mx-auto">
                    <button type="button" onClick={() => setUploadMethod('upload')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${uploadMethod === 'upload' ? 'bg-[#FE6100] text-white' : subTextColor}`}>Upload New File</button>
                  </div>
                  <div className={`relative w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-500/5 ${videoFile ? 'border-[#FE6100]' : borderColor}`}>
                    <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <UploadCloud className={videoFile ? 'text-[#FE6100]' : subTextColor} size={24} />
                    <span className={`text-sm mt-2 font-medium ${videoFile ? 'text-[#FE6100]' : textColor}`}>{videoFile ? videoFile.name : 'Select Video to Upload'}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setIsLectureModalOpen(false)} disabled={isUploading} className={`px-6 h-11 rounded-lg text-sm font-medium ${textColor}`}>Cancel</button>
                  <button type="submit" disabled={isUploading} className="px-6 h-11 bg-[#FE6100] rounded-lg text-white text-sm font-medium disabled:opacity-50">{isUploading ? 'Uploading...' : 'Save Video'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL: RESOURCE UPLOAD (PDFs) */}
      <AnimatePresence>
        {isResourceModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isUploading && setIsResourceModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed top-[5%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-lg p-6 rounded-2xl border shadow-2xl z-50 flex flex-col gap-6 ${modalBg}`}>
              <h2 className={`text-2xl font-libre ${textColor}`}>Upload PDF Material</h2>
              <form onSubmit={handleUploadResource} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1"><label className={`text-xs uppercase ${subTextColor}`}>Document Title</label><input type="text" required value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className={`h-11 px-4 rounded-lg border ${inputBg}`} /></div>
                <div className="flex flex-col gap-1"><label className={`text-xs uppercase ${subTextColor}`}>Category</label>
                  <select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})} className={`h-11 px-4 rounded-lg border ${inputBg}`}>
                    <option value="notes">Course Notes</option>
                    <option value="pyqs">Previous Year Questions (PYQs)</option>
                  </select>
                </div>
                <div className={`relative w-full h-24 mt-2 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-500/5 ${resourceFile ? 'border-blue-500' : borderColor}`}>
                  <input type="file" accept="application/pdf" onChange={e => setResourceFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <FileText className={resourceFile ? 'text-blue-500' : subTextColor} size={24} />
                  <span className={`text-sm mt-2 font-medium ${resourceFile ? 'text-blue-500' : textColor}`}>{resourceFile ? resourceFile.name : 'Select PDF File'}</span>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsResourceModalOpen(false)} disabled={isUploading} className={`px-6 h-11 rounded-lg text-sm font-medium ${textColor}`}>Cancel</button>
                  <button type="submit" disabled={isUploading} className="px-6 h-11 bg-blue-600 rounded-lg text-white text-sm font-medium disabled:opacity-50">{isUploading ? 'Uploading...' : 'Upload PDF'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
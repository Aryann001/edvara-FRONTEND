'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import axios from 'axios'; // <-- ADDED FOR DIRECT CLOUDFLARE UPLOAD
import { 
  ArrowLeft, Video, Plus, Trash2, UploadCloud, Search, 
  CheckCircle2, AlertCircle, FileText, Settings, Tag, 
  MessageCircle, Eye, EyeOff, Loader2, Save 
} from 'lucide-react';
import api from '@/services/api';

export default function CourseManagerPage() {
  const params = useParams() as { id: string };
  const courseId = params.id;
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  
  const [activeTab, setActiveTab] = useState<'lectures' | 'resources' | 'settings'>('lectures');
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean, type: 'lecture' | 'faq' | 'resource' | null, idStr: string, resourceType?: 'notes' | 'pyqs' }>({
    isOpen: false, type: null, idStr: ''
  });

  const [uploadMethod, setUploadMethod] = useState<'upload' | 'reuse'>('upload');
  const [lectureForm, setLectureForm] = useState({ title: '', description: '', sequence: '', isFree: false, reuseVideoUrl: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [existingFolders, setExistingFolders] = useState<string[]>(['General']);
  const [selectedFolder, setSelectedFolder] = useState('General');

  const [resourceForm, setResourceForm] = useState({ title: '', type: 'notes' }); 
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  const [editForm, setEditForm] = useState({ 
    title: '', description: '', price: '', mrp: '', validityInDays: '', 
    mentorName: '', mentorDescription: '', tags: '', features: '', 
    newFaqQ: '', newFaqA: '', category: '', level: '', semester: '', branch: ''
  });

  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchCourse = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      if (data.success) {
        const c = data.data;
        setCourse(c);
        setEditForm({ 
          title: c.title || '', description: c.description || '',
          price: c.price?.toString() || '0', mrp: c.mrp?.toString() || '0',
          validityInDays: c.validityInDays?.toString() || '365',
          mentorName: c.mentorName || '', mentorDescription: c.mentorDescription || '',
          tags: c.tags?.join(', ') || '', features: c.features?.join(', ') || '',
          newFaqQ: '', newFaqA: '', category: c.category || '', level: c.level || '',
          semester: c.semester?.toString() || '', branch: c.branch || ''
        });

        if (c.lectures && c.lectures.length > 0) {
          const folders = new Set(c.lectures.map((l: any) => l.folderName || 'General'));
          const folderArray = Array.from(folders) as string[];
          setExistingFolders(folderArray);
          
          setSelectedFolder((prev) => {
            if (isNewFolder) return prev; 
            if (prev && folderArray.includes(prev)) return prev; 
            return folderArray[folderArray.length - 1] || 'General'; 
          });
        } else {
          setExistingFolders(['General']);
          if (!isNewFolder) setSelectedFolder('General');
        }
      }
    } catch (error: any) {
      setPageError(error.response?.data?.message || 'Course not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (courseId) fetchCourse(); }, [courseId]);

  useEffect(() => {
    if (uploadMethod === 'reuse' && mediaLibrary.length === 0) {
      const fetchLibrary = async () => {
        try {
          const { data } = await api.get('/lectures/library');
          if (data.success) setMediaLibrary(data.data);
        } catch (error) {
          console.error("Failed to fetch library", error);
        }
      };
      fetchLibrary();
    }
  }, [uploadMethod, mediaLibrary.length]);

  // --- UPGRADED: DIRECT CLOUDFLARE UPLOAD LOGIC ---
  const handleUploadLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMethod === 'upload' && !videoFile) return showToast("Please select a video file.", "error");
    if (uploadMethod === 'reuse' && !lectureForm.reuseVideoUrl) return showToast("Please select a video from the library.", "error");
    
    const finalFolderName = selectedFolder.trim() || 'General';
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalUid = '';

      if (uploadMethod === 'upload' && videoFile) {
        // 1. Get Secure Upload Ticket from Backend
        const { data: ticketData } = await api.post('/lectures/upload-url');
        const { uploadUrl, uid } = ticketData.data;
        finalUid = uid;

        // 2. Upload directly to Cloudflare, completely bypassing Render server
        const cfFormData = new FormData();
        cfFormData.append('file', videoFile);

        await axios.post(uploadUrl, cfFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        });
      } else {
        // Reuse existing UID
        finalUid = lectureForm.reuseVideoUrl;
      }

      // 3. Save purely lightweight JSON Metadata to our Backend
      const isLegacyHttp = finalUid.startsWith('http');
      const payload: any = {
        title: lectureForm.title,
        description: lectureForm.description,
        sequence: lectureForm.sequence,
        folderName: finalFolderName,
        resourceType: 'video',
        isFree: lectureForm.isFree,
      };

      if (uploadMethod === 'upload') {
        payload.cloudflareUid = finalUid;
      } else {
        if (isLegacyHttp) payload.videoUrl = finalUid; // Old Cloudinary fallback
        else payload.reuseCloudflareUid = finalUid; // New Cloudflare logic
      }

      const { data } = await api.post(`/courses/${courseId}/lectures`, payload);

      if (data.success) {
        setIsLectureModalOpen(false);
        showToast("Lecture added successfully!");

        if (!existingFolders.includes(finalFolderName)) {
          setExistingFolders(prev => [...prev, finalFolderName]);
        }

        setLectureForm({ title: '', description: '', sequence: '', isFree: false, reuseVideoUrl: '' });
        setVideoFile(null);
        setUploadMethod('upload');
        setIsNewFolder(false);
        setSelectedFolder(finalFolderName); 
        
        fetchCourse(); 
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Video upload failed.', "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceFile) return showToast("Please select a PDF file.", "error");
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', resourceForm.title);
    formData.append('type', resourceForm.type); 
    formData.append('document', resourceFile); 

    try {
      const { data } = await api.post(`/courses/${courseId}/resources`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      if (data.success) {
        setIsResourceModalOpen(false);
        setResourceForm({ title: '', type: 'notes' });
        setResourceFile(null);
        showToast("Document uploaded successfully!");
        fetchCourse();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Document upload failed.', "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateSettings = async () => {
    setIsUploading(true);
    try {
      const tagsArray = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const featuresArray = editForm.features.split(',').map(f => f.trim()).filter(Boolean);
      
      const payload: any = { 
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        mrp: Number(editForm.mrp), 
        validityInDays: Number(editForm.validityInDays),
        mentorName: editForm.mentorName,
        mentorDescription: editForm.mentorDescription,
        tags: tagsArray, 
        features: featuresArray 
      };

      if (course.domain === 'university') {
        payload.semester = Number(editForm.semester);
        payload.branch = editForm.branch;
      } else {
        payload.category = editForm.category;
        payload.level = editForm.level;
      }

      if (editForm.newFaqQ && editForm.newFaqA) {
        payload.faqs = [...(course.faqs || []), { question: editForm.newFaqQ, answer: editForm.newFaqA }];
      }

      await api.put(`/courses/${courseId}`, payload);
      setEditForm({ ...editForm, newFaqQ: '', newFaqA: '' });
      showToast("Course details updated successfully!");
      fetchCourse();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update course details.', "error");
    } finally {
      setIsUploading(false);
    }
  };

  const openDeleteModal = (type: 'lecture' | 'faq' | 'resource', idStr: string, resourceType?: 'notes' | 'pyqs') => {
    setDeleteConfig({ isOpen: true, type, idStr, resourceType });
  };

  const confirmDelete = async () => {
    const { type, idStr, resourceType } = deleteConfig;
    if (!type || !idStr) return;

    setIsUploading(true);
    try {
      if (type === 'lecture') {
        await api.delete(`/lectures/${idStr}`);
      } else if (type === 'faq') {
        const newFaqs = course.faqs.filter((f: any) => f._id !== idStr);
        await api.put(`/courses/${courseId}`, { faqs: newFaqs });
      } else if (type === 'resource' && resourceType) {
        await api.delete(`/courses/${courseId}/resources/${idStr}?type=${resourceType}`);
      }
      
      showToast(`${type} deleted successfully.`);
      setDeleteConfig({ isOpen: false, type: null, idStr: '' });
      fetchCourse(); 
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete item.', "error");
    } finally {
      setIsUploading(false);
    }
  };

  const groupedLectures = course?.lectures?.reduce((acc: any, lecture: any) => {
    const folder = lecture.folderName || 'General';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(lecture);
    return acc;
  }, {}) || {};

  const filteredLibrary = mediaLibrary.filter(item => 
    item.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
    (item.course?.title && item.course.title.toLowerCase().includes(librarySearch.toLowerCase()))
  );

  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';
  const modalBg = isCoding ? 'bg-[#161616] border-zinc-800' : 'bg-white border-zinc-200';

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#FE6100] border-t-transparent rounded-full animate-spin" /></div>;
  if (pageError || !course) return <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-4"><AlertCircle className="w-16 h-16 text-red-500" /><h2 className={`text-2xl font-bold ${textColor}`}>{pageError}</h2></div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-24 relative font-['Helvena']">
      
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfig.isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" 
              onClick={() => !isUploading && setDeleteConfig({ isOpen: false, type: null, idStr: '' })} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md p-6 rounded-2xl border shadow-2xl z-[160] flex flex-col gap-4 ${modalBg}`}
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Confirm Deletion</h3>
              </div>
              <p className={`text-sm ${subTextColor}`}>Are you sure you want to delete this {deleteConfig.type}? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  disabled={isUploading} 
                  onClick={() => setDeleteConfig({ isOpen: false, type: null, idStr: '' })} 
                  className={`px-4 py-2 h-10 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-500/10 ${textColor}`}
                >
                  Cancel
                </button>
                <button 
                  disabled={isUploading} 
                  onClick={confirmDelete} 
                  className="px-5 py-2 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} 
                  {isUploading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        <Link href="/dashboard/courses" className={`flex items-center gap-2 text-sm w-fit hover:text-[#FE6100] transition-colors ${subTextColor}`}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${course.domain === 'coding' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {course.domain}
              </span>
              {course.domain === 'university' && (
                <span className={`text-xs font-semibold ${subTextColor}`}>{course.university?.name || course.universityName} • Sem {course.semester} • {course.branch}</span>
              )}
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-zinc-500/10 ${subTextColor}`}>
                ID: {courseId}
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-['Libre_Baskerville'] italic ${textColor}`}>{course.title}</h1>
            <p className={`text-sm mt-2 ${subTextColor}`}>₹{course.price} {course.mrp > course.price && `(MRP: ₹${course.mrp})`}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-500/20 pb-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('lectures')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'lectures' ? 'bg-[#FE6100]/10 text-[#FE6100] border-b-2 border-[#FE6100]' : `${subTextColor} hover:bg-zinc-500/10`}`}>Video Lectures</button>
        <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'resources' ? 'bg-[#FE6100]/10 text-[#FE6100] border-b-2 border-[#FE6100]' : `${subTextColor} hover:bg-zinc-500/10`}`}>Study Materials (PDFs)</button>
        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#FE6100]/10 text-[#FE6100] border-b-2 border-[#FE6100]' : `${subTextColor} hover:bg-zinc-500/10`}`}>Course Settings</button>
      </div>

      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        
        {activeTab === 'lectures' && (
          <>
            <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center gap-3`}>
              <div className="flex items-center gap-2"><Video className={textColor} size={20} /> <h2 className={`text-lg font-bold ${textColor}`}>Course Syllabus</h2></div>
              <button onClick={() => setIsLectureModalOpen(true)} className="h-10 px-4 bg-[#FE6100] rounded-lg text-white text-sm font-medium flex items-center gap-2"><Plus size={16}/> Add Lecture</button>
            </div>
            
            <div className="flex flex-col">
              {Object.keys(groupedLectures).length === 0 ? (
                <div className={`p-12 text-center ${subTextColor}`}>No lectures uploaded yet. Click "Add Lecture" to build your syllabus.</div>
              ) : (
                Object.keys(groupedLectures).map((folderName) => (
                  <div key={folderName} className={`border-b last:border-0 ${borderColor}`}>
                    <div className={`px-6 py-3 bg-zinc-500/5 text-sm font-bold tracking-wider uppercase ${subTextColor}`}>
                      {folderName}
                    </div>
                    {groupedLectures[folderName].sort((a: any, b: any) => a.sequence - b.sequence).map((lecture: any) => (
                      <div key={lecture._id} className={`p-4 sm:p-6 border-b last:border-0 flex justify-between items-center group hover:bg-zinc-500/5 ${borderColor}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-[#FE6100]/10 text-[#FE6100]`}>{lecture.sequence}</div>
                          <div>
                            <h3 className={`font-medium ${textColor}`}>{lecture.title}</h3>
                            <p className={`text-xs mt-0.5 ${subTextColor} line-clamp-1`}>{lecture.description}</p>
                          </div>
                        </div>
                        <button onClick={() => openDeleteModal('lecture', lecture._id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'resources' && (
          <>
            <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center gap-3`}>
              <div className="flex items-center gap-2"><FileText className={textColor} size={20} /> <h2 className={`text-lg font-bold ${textColor}`}>Study Materials</h2></div>
              <button onClick={() => setIsResourceModalOpen(true)} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg text-white text-sm font-medium flex items-center gap-2"><UploadCloud size={16}/> Upload PDF</button>
            </div>
            
            <div className="p-6">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textColor}`}>Course Notes</h3>
              {course.notes?.length > 0 ? course.notes.map((note: any) => (
                <div key={note._id} className={`p-4 mb-2 rounded-lg border ${borderColor} flex justify-between items-center group hover:bg-zinc-500/5 transition-colors`}>
                  <div className="flex items-center gap-3"><FileText size={16} className="text-blue-500"/><span className={textColor}>{note.title}</span><span className={`text-xs ${subTextColor}`}>({note.fileSize})</span></div>
                  <button onClick={() => openDeleteModal('resource', note._id, 'notes')} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              )) : <p className={`text-sm mb-6 ${subTextColor}`}>No notes uploaded.</p>}

              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 mt-8 ${textColor}`}>Previous Year Questions (PYQs)</h3>
              {course.pyqs?.length > 0 ? course.pyqs.map((pyq: any) => (
                <div key={pyq._id} className={`p-4 mb-2 rounded-lg border ${borderColor} flex justify-between items-center group hover:bg-zinc-500/5 transition-colors`}>
                  <div className="flex items-center gap-3"><FileText size={16} className="text-purple-500"/><span className={textColor}>{pyq.title}</span><span className={`text-xs ${subTextColor}`}>({pyq.fileSize})</span></div>
                  <button onClick={() => openDeleteModal('resource', pyq._id, 'pyqs')} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              )) : <p className={`text-sm ${subTextColor}`}>No PYQs uploaded.</p>}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 flex flex-col gap-8">
            
            <div className={`p-5 rounded-xl border flex flex-col gap-5 ${borderColor}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>Basic Information</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${subTextColor}`}>Course Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${subTextColor}`}>Description</label>
                <textarea rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className={`p-3 rounded-lg border outline-none resize-none transition-all ${inputBg}`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${subTextColor}`}>Price (INR)</label>
                  <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${subTextColor}`}>MRP (Original Price)</label>
                  <input type="number" value={editForm.mrp} onChange={e => setEditForm({...editForm, mrp: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border flex flex-col gap-5 ${borderColor}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>Domain Specifics ({course.domain})</h3>
              
              {course.domain === 'university' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${subTextColor}`}>Semester</label>
                    <select value={editForm.semester} onChange={e => setEditForm({...editForm, semester: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`}>
                      {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${subTextColor}`}>Branch</label>
                    <input type="text" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${subTextColor}`}>Category</label>
                    <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${subTextColor}`}>Level</label>
                    <select value={editForm.level} onChange={e => setEditForm({...editForm, level: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-5 rounded-xl border flex flex-col gap-5 ${borderColor}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>Features & Meta</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${subTextColor}`}>Tags (Comma separated)</label>
                <input type="text" placeholder="Job Ready, MERN Stack" value={editForm.tags} onChange={e => setEditForm({...editForm, tags: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${subTextColor}`}>Features (Comma separated)</label>
                <input type="text" placeholder="100% Syllabus Covered, Doubt Support" value={editForm.features} onChange={e => setEditForm({...editForm, features: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${subTextColor}`}>Mentor Name</label>
                  <input type="text" value={editForm.mentorName} onChange={e => setEditForm({...editForm, mentorName: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${subTextColor}`}>Mentor Bio</label>
                  <input type="text" value={editForm.mentorDescription} onChange={e => setEditForm({...editForm, mentorDescription: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} />
                </div>
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
                  <button onClick={() => openDeleteModal('faq', faq._id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}

              <div className={`p-5 rounded-xl border mt-4 ${borderColor} ${isCoding ? 'bg-black/20' : 'bg-zinc-50'}`}>
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textColor}`}>Add New FAQ</h4>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Question..." value={editForm.newFaqQ} onChange={e => setEditForm({...editForm, newFaqQ: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all focus:border-[#FE6100] ${inputBg}`} />
                  <textarea placeholder="Answer..." rows={2} value={editForm.newFaqA} onChange={e => setEditForm({...editForm, newFaqA: e.target.value})} className={`p-4 rounded-lg border outline-none resize-none transition-all focus:border-[#FE6100] ${inputBg}`} />
                </div>
              </div>
            </div>

            <div className="flex justify-end sticky bottom-0 py-4 bg-inherit z-10">
              <button onClick={handleUpdateSettings} disabled={isUploading} className="px-8 h-12 bg-[#FE6100] hover:bg-orange-700 transition-colors rounded-xl text-white font-medium shadow-lg disabled:opacity-50 flex items-center gap-2">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isUploading ? 'Saving...' : 'Save All Changes'}
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed top-[5%] sm:top-[10%] left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-2xl p-6 sm:p-8 rounded-2xl border shadow-2xl z-50 flex flex-col gap-6 max-h-[90vh] overflow-y-auto ${modalBg}`}>
              <h2 className={`text-2xl font-['Libre_Baskerville'] italic ${textColor}`}>Add Video Lecture</h2>
              <form onSubmit={handleUploadLecture} className="flex flex-col gap-4">
                
                {/* --- SMART FOLDER SELECTION --- */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Folder Assignment</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsNewFolder(!isNewFolder);
                        setSelectedFolder(!isNewFolder ? '' : (existingFolders[0] || 'General'));
                      }} 
                      className="text-xs text-[#FE6100] hover:underline"
                    >
                      {isNewFolder ? 'Select Existing Folder' : '+ Create New Folder'}
                    </button>
                  </div>
                  
                  {isNewFolder ? (
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Unit 1: Advanced Topics" 
                      value={selectedFolder} 
                      onChange={e => setSelectedFolder(e.target.value)} 
                      className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} 
                    />
                  ) : (
                    <select 
                      required
                      value={selectedFolder} 
                      onChange={e => setSelectedFolder(e.target.value)} 
                      className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`}
                    >
                      {existingFolders.map(folder => (
                        <option key={folder} value={folder}>{folder}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1"><label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Title</label><input type="text" required value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} /></div>
                  <div className="w-24 flex flex-col gap-1"><label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Seq #</label><input type="number" required value={lectureForm.sequence} onChange={e => setLectureForm({...lectureForm, sequence: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none text-center transition-all ${inputBg}`} /></div>
                </div>
                <div className="flex flex-col gap-1"><label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Description</label><textarea rows={2} required value={lectureForm.description} onChange={e => setLectureForm({...lectureForm, description: e.target.value})} className={`p-3 rounded-lg border outline-none resize-none transition-all ${inputBg}`} /></div>
                
                <div className={`p-4 rounded-xl border flex flex-col gap-4 ${isCoding ? 'bg-black/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex gap-2 p-1 bg-zinc-500/10 rounded-lg w-fit mx-auto">
                    <button type="button" onClick={() => setUploadMethod('upload')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMethod === 'upload' ? 'bg-[#FE6100] text-white shadow' : `${subTextColor} hover:text-stone-900 dark:hover:text-white`}`}>Upload New File</button>
                    <button type="button" onClick={() => setUploadMethod('reuse')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMethod === 'reuse' ? 'bg-[#FE6100] text-white shadow' : `${subTextColor} hover:text-stone-900 dark:hover:text-white`}`}>Select From Library</button>
                  </div>

                  {uploadMethod === 'upload' ? (
                    <div className={`relative w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-500/5 transition-colors ${videoFile ? 'border-[#FE6100]' : borderColor}`}>
                      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <UploadCloud className={videoFile ? 'text-[#FE6100]' : subTextColor} size={24} />
                      <span className={`text-sm mt-2 font-medium truncate px-4 ${videoFile ? 'text-[#FE6100]' : textColor}`}>{videoFile ? videoFile.name : 'Select Video to Upload'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={16} />
                        <input type="text" placeholder="Search previous uploads..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} className={`w-full h-10 pl-9 pr-4 rounded-lg border outline-none text-sm transition-all ${inputBg}`} />
                      </div>
                      <div className={`h-40 overflow-y-auto rounded-lg border p-2 flex flex-col gap-2 ${isCoding ? 'bg-black/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        {filteredLibrary.length === 0 ? (
                          <div className={`flex justify-center items-center h-full text-xs font-medium ${subTextColor}`}>No past uploads found.</div>
                        ) : (
                          filteredLibrary.map((item, idx) => {
                            const uidToUse = item.cloudflareUid || item.videoUrl;
                            const isSelected = lectureForm.reuseVideoUrl === uidToUse;
                            return (
                              <div key={idx} onClick={() => setLectureForm({...lectureForm, reuseVideoUrl: uidToUse})} className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-[#FE6100] bg-[#FE6100]/10' : isCoding ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-200 hover:border-zinc-300'}`}>
                                <div className="flex flex-col truncate pr-4">
                                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-[#FE6100]' : textColor}`}>{item.title}</span>
                                  <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${subTextColor}`}>From: {item.course?.title || 'Unknown Course'}</span>
                                </div>
                                {isSelected && <CheckCircle2 className="text-[#FE6100] shrink-0" size={18} />}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-lg border flex justify-between items-center ${inputBg}`}>
                  <div>
                    <h4 className={`text-sm font-medium ${textColor} flex items-center gap-2`}>
                      {lectureForm.isFree ? <Eye size={16} className="text-green-500"/> : <EyeOff size={16}/>} Free Preview
                    </h4>
                  </div>
                  <button type="button" onClick={() => setLectureForm({...lectureForm, isFree: !lectureForm.isFree})} className={`w-12 h-6 rounded-full p-1 transition-colors ${lectureForm.isFree ? 'bg-green-500' : 'bg-zinc-500'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${lectureForm.isFree ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  {isUploading && uploadMethod === 'upload' && (
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={textColor}>{uploadProgress < 100 ? 'Uploading direct to Cloudflare...' : 'Finalizing metadata...'}</span>
                        <span className="text-[#FE6100]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className={`h-full rounded-full ${uploadProgress === 100 ? 'bg-emerald-500' : 'bg-[#FE6100]'}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button type="button" onClick={() => setIsLectureModalOpen(false)} disabled={isUploading} className={`w-full sm:w-auto px-6 h-11 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-500/10 disabled:opacity-50 ${textColor}`}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-lg text-white text-sm font-medium hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-50">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" /> 
                          {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                        </>
                      ) : 'Save Video'}
                    </button>
                  </div>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed top-[5%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-lg p-6 sm:p-8 rounded-2xl border shadow-2xl z-50 flex flex-col gap-6 ${modalBg}`}>
              <h2 className={`text-2xl font-['Libre_Baskerville'] italic ${textColor}`}>Upload PDF Material</h2>
              <form onSubmit={handleUploadResource} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1"><label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Document Title</label><input type="text" required value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`} /></div>
                <div className="flex flex-col gap-1"><label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Category</label>
                  <select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})} className={`h-11 px-4 rounded-lg border outline-none transition-all ${inputBg}`}>
                    <option value="notes">Course Notes</option>
                    <option value="pyqs">Previous Year Questions (PYQs)</option>
                  </select>
                </div>
                <div className={`relative w-full h-24 mt-2 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-500/5 transition-colors ${resourceFile ? 'border-blue-500' : borderColor}`}>
                  <input type="file" accept="application/pdf" onChange={e => setResourceFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <FileText className={resourceFile ? 'text-blue-500' : subTextColor} size={24} />
                  <span className={`text-sm mt-2 font-medium truncate px-4 w-full text-center ${resourceFile ? 'text-blue-500' : textColor}`}>{resourceFile ? resourceFile.name : 'Select PDF File'}</span>
                </div>
                
                <div className="flex flex-col gap-3 mt-4">
                  {isUploading && (
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={textColor}>{uploadProgress < 100 ? 'Uploading PDF...' : 'Finalizing...'}</span>
                        <span className="text-blue-500">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className={`h-full rounded-full ${uploadProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button type="button" onClick={() => setIsResourceModalOpen(false)} disabled={isUploading} className={`w-full sm:w-auto px-6 h-11 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-500/10 disabled:opacity-50 ${textColor}`}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-6 h-11 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg text-white text-sm font-medium flex justify-center items-center gap-2 disabled:opacity-50">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" /> 
                          {uploadProgress < 100 ? 'Uploading...' : 'Finalizing...'}
                        </>
                      ) : 'Upload PDF'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
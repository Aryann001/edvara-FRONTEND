'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit2, Trash2, Loader2, AlertCircle, 
  CheckCircle2, X, UploadCloud, Building2, MapPin, Users, BookOpen, Layers
} from 'lucide-react';

export default function UniversitiesDashboard() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // --- Theme Variables ---
  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const cardBg = isCoding ? "bg-[#1C1C1C] border-white/10" : "bg-white border-gray-200";
  const inputBg = isCoding ? "bg-black/50 border-white/10 text-white focus:border-[#FE6100]" : "bg-neutral-50 border-gray-200 text-stone-900 focus:border-[#FE6100]";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-500";
  const tableHeader = isCoding ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500";
  const tableBorder = isCoding ? "border-white/5" : "border-gray-100";

  // --- State ---
  const [universities, setUniversities] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{name: string, location: string, state: string, branches: string[]}>({
    name: '',
    location: '',
    state: '',
    branches: []
  });
  const [branchInput, setBranchInput] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- Fetch Data ---
  const fetchUniversities = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      let url = `/universities?page=${page}&limit=10`;
      if (search) url += `&search=${search}`;
      
      const { data } = await api.get(url);
      setUniversities(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to fetch universities", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUniversities(1, searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- Handlers ---
  const openCreatePanel = () => {
    setEditingUni(null);
    setFormData({ name: '', location: '', state: '', branches: [] });
    setBranchInput('');
    setLogoFile(null);
    setLogoPreview(null);
    setIsPanelOpen(true);
  };

  const openEditPanel = (uni: any) => {
    setEditingUni(uni);
    setFormData({
      name: uni.name,
      location: uni.location,
      state: uni.state || '',
      branches: uni.branches || []
    });
    setBranchInput('');
    setLogoFile(null);
    setLogoPreview(uni.logo?.url || null);
    setIsPanelOpen(true);
  };

  const handleAddBranch = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      const newBranch = branchInput.trim().toUpperCase();
      if (newBranch && !formData.branches.includes(newBranch)) {
        setFormData({ ...formData, branches: [...formData.branches, newBranch] });
        setBranchInput('');
      }
    }
  };

  const removeBranch = (branchToRemove: string) => {
    setFormData({
      ...formData,
      branches: formData.branches.filter(b => b !== branchToRemove)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      return showToast("Name and location are required", "error");
    }
    if (!editingUni && !logoFile) {
      return showToast("Logo is required for new universities", "error");
    }

    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('location', formData.location);
    if (formData.state) submitData.append('state', formData.state);
    submitData.append('branches', JSON.stringify(formData.branches));
    if (logoFile) submitData.append('logo', logoFile);

    try {
      if (editingUni) {
        // FIXED: Added headers for multipart/form-data
        await api.put(`/universities/${editingUni._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("University updated successfully");
      } else {
        // FIXED: Added headers for multipart/form-data
        await api.post('/universities', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("University created successfully");
      }
      setIsPanelOpen(false);
      fetchUniversities(currentPage, searchQuery); 
    } catch (error: any) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Toggle Status Handler ---
  const handleToggleStatus = async (uniId: string) => {
    try {
      const { data } = await api.patch(`/universities/${uniId}/status`);
      // Optimistically update the UI without doing a full refetch
      setUniversities(prev => prev.map(uni => 
        uni._id === uniId ? { ...uni, isReady: data.data.isReady } : uni
      ));
      showToast(data.message);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this university?")) return;
    try {
      await api.delete(`/universities/${id}`);
      showToast("University deleted successfully");
      fetchUniversities(currentPage, searchQuery);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* TOAST */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`${textMain} text-2xl font-bold`}>Universities</h1>
          <p className={`${textSub} text-sm mt-1`}>Manage academic institutions and their details.</p>
        </div>
        <button 
          onClick={openCreatePanel}
          className="h-10 px-4 bg-[#FE6100] hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Add University
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className={`w-full p-4 rounded-xl border ${cardBg} flex justify-between items-center gap-4`}>
        <div className={`flex-1 max-w-md h-10 px-3 rounded-lg border flex items-center gap-2 transition-colors ${inputBg}`}>
          <Search size={18} className={textSub} />
          <input 
            type="text" 
            placeholder="Search universities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={textSub}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className={`w-full rounded-xl border ${cardBg} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${tableHeader} text-xs uppercase tracking-wider`}>
                <th className={`p-4 font-semibold border-b ${tableBorder}`}>University</th>
                <th className={`p-4 font-semibold border-b ${tableBorder}`}>Location</th>
                <th className={`p-4 font-semibold border-b ${tableBorder}`}>Stats</th>
                <th className={`p-4 font-semibold border-b ${tableBorder}`}>Status</th>
                <th className={`p-4 font-semibold border-b ${tableBorder} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // SKELETON ROWS
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={`border-b ${tableBorder} animate-pulse`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${isCoding ? 'bg-white/5' : 'bg-gray-200'}`} />
                        <div className={`w-32 h-4 rounded ${isCoding ? 'bg-white/5' : 'bg-gray-200'}`} />
                      </div>
                    </td>
                    <td className="p-4"><div className={`w-24 h-4 rounded ${isCoding ? 'bg-white/5' : 'bg-gray-200'}`} /></td>
                    <td className="p-4"><div className={`w-16 h-4 rounded ${isCoding ? 'bg-white/5' : 'bg-gray-200'}`} /></td>
                    <td className="p-4"><div className={`w-12 h-6 rounded-full ${isCoding ? 'bg-white/5' : 'bg-gray-200'}`} /></td>
                    <td className="p-4 text-right"><div className={`w-8 h-8 rounded ml-auto ${isCoding ? 'bg-white/5' : 'bg-gray-200'}`} /></td>
                  </tr>
                ))
              ) : universities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Building2 className={`w-12 h-12 mx-auto mb-3 opacity-20 ${textMain}`} />
                    <p className={`${textMain} font-medium`}>No universities found</p>
                    <p className={`${textSub} text-sm mt-1`}>Try adjusting your search or add a new one.</p>
                  </td>
                </tr>
              ) : (
                universities.map((uni) => (
                  <tr key={uni._id} className={`border-b ${tableBorder} hover:${isCoding ? 'bg-white/5' : 'bg-gray-50'} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border ${isCoding ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-gray-50'} flex items-center justify-center`}>
                          {uni.logo?.url ? (
                            <img src={uni.logo.url} alt={uni.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className={`${textMain} font-medium`}>{uni.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className={`${textSub} text-sm`}>{uni.location}{uni.state ? `, ${uni.state}` : ''}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`${textSub} text-xs flex items-center gap-1.5`}>
                          <Layers className="w-3.5 h-3.5" /> 
                          {uni.branches?.length || uni.streamsCount || 0} Branches
                        </span>
                        <span className={`${textSub} text-xs flex items-center gap-1.5`}>
                          <BookOpen className="w-3.5 h-3.5" /> 
                          {uni.coursesCount || ((uni.branches?.length || uni.streamsCount || 0) * 8)} Total Courses
                        </span>
                      </div>
                    </td>
                    
                    {/* NEW: STATUS TOGGLE COLUMN */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(uni._id)} 
                          className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            uni.isReady ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                            uni.isReady ? 'translate-x-5 shadow-sm' : 'translate-x-0'
                          }`} />
                        </button>
                        <span className={`text-xs font-medium ${uni.isReady ? 'text-emerald-500' : textSub}`}>
                          {uni.isReady ? 'Ready' : 'Draft'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditPanel(uni)} className={`p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors`} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(uni._id)} className={`p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors`} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {pagination && (pagination.next || pagination.prev) && (
          <div className={`p-4 border-t ${tableBorder} flex justify-between items-center`}>
            <button 
              disabled={!pagination.prev} 
              onClick={() => fetchUniversities(currentPage - 1, searchQuery)}
              className={`text-sm font-medium ${pagination.prev ? 'text-[#FE6100] hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
            >
              Previous
            </button>
            <span className={`${textSub} text-sm`}>Page {currentPage}</span>
            <button 
              disabled={!pagination.next} 
              onClick={() => fetchUniversities(currentPage + 1, searchQuery)}
              className={`text-sm font-medium ${pagination.next ? 'text-[#FE6100] hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* SLIDE-OVER PANEL FOR CREATE/EDIT */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-md z-[110] border-l flex flex-col shadow-2xl ${isCoding ? 'bg-[#1C1C1C] border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-5 flex justify-between items-center border-b ${tableBorder}`}>
                <h2 className={`${textMain} text-lg font-bold`}>{editingUni ? 'Edit University' : 'Add University'}</h2>
                <button onClick={() => setIsPanelOpen(false)} className={`p-1.5 rounded-md hover:bg-gray-500/10 ${textSub}`}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <form id="uni-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  
                  {/* Logo Upload */}
                  <div className="flex flex-col gap-2">
                    <label className={`text-xs uppercase tracking-wider font-semibold ${textSub}`}>University Logo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col justify-center items-center gap-2 cursor-pointer transition-colors ${
                        logoPreview ? 'border-transparent bg-black/10' : `${isCoding ? 'border-white/20 hover:border-[#FE6100] bg-white/5' : 'border-gray-300 hover:border-[#FE6100] bg-gray-50'}`
                      }`}
                    >
                      {logoPreview ? (
                        <div className="w-full h-full p-2 relative group">
                          <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white text-xs font-medium">Change Logo</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-gray-400" />
                          <span className={`${textSub} text-xs`}>Click to upload logo</span>
                        </>
                      )}
                      <input 
                        type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs uppercase tracking-wider font-semibold ${textSub}`}>University Name *</label>
                    <input 
                      type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. RGPV Bhopal" className={`h-11 px-4 rounded-lg border outline-none text-sm transition-all ${inputBg}`} 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs uppercase tracking-wider font-semibold ${textSub}`}>Location (City) *</label>
                    <input 
                      type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Bhopal" className={`h-11 px-4 rounded-lg border outline-none text-sm transition-all ${inputBg}`} 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs uppercase tracking-wider font-semibold ${textSub}`}>State (Optional)</label>
                    <input 
                      type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="e.g. Madhya Pradesh" className={`h-11 px-4 rounded-lg border outline-none text-sm transition-all ${inputBg}`} 
                    />
                  </div>

                  {/* BRANCHES TAG INPUT */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <label className={`text-xs uppercase tracking-wider font-semibold ${textSub}`}>Branches / Streams</label>
                      <span className={`text-[10px] ${textSub}`}>Press Enter to add</span>
                    </div>
                    <div className={`w-full min-h-11 p-2 rounded-lg border transition-all ${inputBg} flex flex-wrap gap-2 items-center`}>
                      {formData.branches.map((branch) => (
                        <div key={branch} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FE6100]/10 text-[#FE6100] border border-[#FE6100]/20">
                          <span className="text-xs font-bold tracking-wide">{branch}</span>
                          <button type="button" onClick={() => removeBranch(branch)} className="hover:text-red-500 transition-colors focus:outline-none">
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      <input 
                        type="text" 
                        value={branchInput} 
                        onChange={(e) => setBranchInput(e.target.value)}
                        onKeyDown={handleAddBranch}
                        placeholder={formData.branches.length === 0 ? "e.g. CSE, ECE, ME..." : ""}
                        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm px-1 py-1"
                      />
                    </div>
                    {formData.branches.length > 0 && (
                      <p className={`text-xs font-medium text-emerald-500 mt-1`}>
                        <CheckCircle2 className="inline w-3 h-3 mr-1" />
                        Will generate {formData.branches.length * 8} total semester courses.
                      </p>
                    )}
                  </div>

                </form>
              </div>

              <div className={`p-5 border-t ${tableBorder} flex justify-end gap-3`}>
                <button 
                  type="button" onClick={() => setIsPanelOpen(false)} disabled={isSubmitting}
                  className={`h-11 px-5 rounded-lg font-medium text-sm transition-colors ${isCoding ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" form="uni-form" disabled={isSubmitting}
                  className="h-11 px-6 bg-[#FE6100] hover:bg-orange-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save University'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
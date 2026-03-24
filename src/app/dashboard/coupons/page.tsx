'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { Plus, Ticket, Trash2, Calendar, Percent, Search, X } from 'lucide-react';
import api from '@/services/api';

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  applicableCourses: string[];
  createdAt: string;
}

export default function ManageCouponsPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    expiryDate: '',
    applicableCourses: '' 
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/coupons');
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
    } catch (error: any) {
      console.error("Failed to delete coupon:", error);
      alert(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const coursesArray = formData.applicableCourses
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      const { data } = await api.post('/coupons', {
        code: formData.code,
        discountPercentage: Number(formData.discountPercentage),
        expiryDate: formData.expiryDate,
        applicableCourses: coursesArray,
      });

      if (data.success) {
        setIsModalOpen(false);
        setFormData({ code: '', discountPercentage: '', expiryDate: '', applicableCourses: '' });
        fetchCoupons(); 
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create coupon. Make sure the code is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const tableHeaderBg = isCoding ? 'bg-zinc-800/50' : 'bg-zinc-100/50';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';
  const modalBg = isCoding ? 'bg-[#161616] border-zinc-800' : 'bg-white border-zinc-200';

  const containerVars: Variants = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } } 
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-8 relative pb-24 font-['Helvena']">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-['Libre_Baskerville'] italic ${textColor}`}>Discount Coupons</h1>
          <p className={`text-sm sm:text-base mt-2 ${subTextColor}`}>Generate promotional codes to drive sales and enrollments.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg hover:opacity-90 transition-all"
        >
          <Plus size={18} /> Generate Coupon
        </button>
      </div>

      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        
        <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center`}>
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={18} />
            <input 
              type="text" 
              placeholder="Search coupons by code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-11 pl-10 pr-4 rounded-lg border outline-none transition-all text-sm ${inputBg}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`${tableHeaderBg} ${subTextColor} text-xs uppercase tracking-wider font-semibold border-b ${borderColor}`}>
                <th className="p-4 sm:p-6">Code</th>
                <th className="p-4 sm:p-6">Discount</th>
                <th className="p-4 sm:p-6">Status</th>
                <th className="p-4 sm:p-6">Expiry Date</th>
                <th className="p-4 sm:p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors duration-500" style={{ borderColor: isCoding ? '#27272a' : '#e4e4e7' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#FE6100] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`p-8 text-center ${subTextColor}`}>No coupons found.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  
                  return (
                    <tr key={coupon._id} className={`group hover:bg-zinc-500/5 transition-colors duration-200`}>
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCoding ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                            <Ticket size={18} className={textColor} />
                          </div>
                          <div className={`font-bold tracking-wider ${textColor}`}>{coupon.code}</div>
                        </div>
                      </td>
                      <td className={`p-4 sm:p-6 font-medium ${textColor}`}>
                        {coupon.discountPercentage}% OFF
                        {coupon.applicableCourses.length > 0 && <span className={`block text-xs mt-1 ${subTextColor}`}>Specific Courses</span>}
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                          isExpired ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className={`p-4 sm:p-6 ${subTextColor}`}>
                        {new Date(coupon.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 sm:p-6 text-right">
                        <button 
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100" 
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Generate Coupon */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed top-[10%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-2xl z-50 flex flex-col gap-6 max-h-[85vh] overflow-y-auto ${modalBg}`}>
              
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-['Libre_Baskerville'] italic ${textColor}`}>New Coupon</h2>
                <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full hover:bg-zinc-500/20 ${subTextColor} transition-colors`}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateCoupon} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Coupon Code</label>
                  <div className="relative">
                    <Ticket className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={16} />
                    <input 
                      type="text" required maxLength={15}
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})} 
                      placeholder="EARLYBIRD2026" 
                      className={`w-full h-11 pl-10 pr-4 rounded-lg border outline-none tracking-widest font-bold text-sm transition-all ${inputBg}`} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Discount Percentage</label>
                  <div className="relative">
                    <Percent className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={16} />
                    <input 
                      type="number" required min="1" max="100"
                      value={formData.discountPercentage} 
                      onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})} 
                      placeholder="e.g. 25" 
                      className={`w-full h-11 pl-10 pr-4 rounded-lg border outline-none text-sm transition-all ${inputBg}`} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Expiry Date</label>
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={16} />
                    <input 
                      type="date" required 
                      value={formData.expiryDate} 
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
                      className={`w-full h-11 pl-10 pr-4 rounded-lg border outline-none text-sm transition-all ${inputBg} [color-scheme:dark]`} 
                      style={{ colorScheme: isCoding ? 'dark' : 'light' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium uppercase tracking-wider ${subTextColor}`}>Restrict to Courses (Optional)</label>
                  <textarea 
                    rows={2}
                    value={formData.applicableCourses} 
                    onChange={(e) => setFormData({...formData, applicableCourses: e.target.value})} 
                    placeholder="Paste Course IDs separated by commas. Leave blank for all courses." 
                    className={`p-3 rounded-lg border outline-none text-xs resize-none transition-all ${inputBg}`} 
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="h-12 mt-2 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-bold tracking-wide hover:shadow-[0_0_15px_rgba(254,97,0,0.5)] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                  {isSubmitting ? 'Generating...' : 'Generate Coupon'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
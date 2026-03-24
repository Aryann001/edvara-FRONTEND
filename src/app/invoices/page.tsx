'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Receipt, Download, Loader2, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import api from '@/services/api';

export default function MyInvoicesPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/payment/myinvoices');
        if (data.success) {
          setInvoices(data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load invoices.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const cardBg = isCoding ? "bg-[#1C1C1C] border border-white/10" : "bg-white border border-gray-200 shadow-sm";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-500";
  const iconBg = isCoding ? "bg-white/5" : "bg-neutral-100";

  // EXPLICIT VARIANTS TYPING
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center pt-[100px] lg:pt-[140px] pb-14 px-5 ${bgTheme} font-['Helvena'] transition-colors duration-500`}>
      <div className="w-full max-w-[1000px] flex flex-col gap-8 lg:gap-10">
        
        <div className="flex flex-col gap-2">
          <h1 className={`${textMain} text-3xl md:text-4xl font-['Libre_Baskerville'] italic`}>
            Payment History
          </h1>
          <p className={`${textSub} text-sm md:text-base`}>
            View and download your tax invoices for all enrolled courses.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100/10 border border-red-500/50 text-red-500 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#FE6100] animate-spin" />
            </motion.div>
          ) : invoices.length === 0 ? (
            <motion.div 
              key="empty"
              variants={itemVars} initial="hidden" animate="show"
              className={`w-full p-10 md:p-16 rounded-2xl flex flex-col items-center justify-center text-center gap-5 ${cardBg}`}
            >
              <div className={`w-16 h-16 rounded-full flex justify-center items-center ${iconBg}`}>
                <Receipt className={`w-8 h-8 ${textSub}`} />
              </div>
              <div>
                <h3 className={`${textMain} text-xl font-semibold mb-2`}>No invoices found</h3>
                <p className={`${textSub} text-sm max-w-md`}>You haven't made any purchases yet. Once you enroll in a course, your tax invoices will appear here.</p>
              </div>
              <Link href="/courses">
                <button className="mt-4 px-6 h-11 bg-[#FE6100] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-md">
                  Explore Courses <ArrowRight size={18} />
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="list" variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-4">
              {invoices.map((invoice) => (
                <motion.div 
                  key={invoice._id} 
                  variants={itemVars}
                  className={`w-full p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 ${cardBg} hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                    <div className={`w-12 h-12 shrink-0 rounded-full justify-center items-center hidden sm:flex ${iconBg}`}>
                      <Receipt className={`w-6 h-6 ${isCoding ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <h3 className={`${textMain} text-lg font-semibold line-clamp-1`}>
                        {invoice.course?.title || 'Unknown Course'}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-green-500/10 text-green-500 border border-green-500/20">Paid</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs ${textSub} font-mono`}>
                          <span className="opacity-60">ID:</span> {invoice.razorpay_payment_id}
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs ${textSub}`}>
                          <Clock size={14} />
                          {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-6 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200 dark:border-white/10">
                    <div className="flex flex-col md:items-end">
                      <span className={`text-[10px] uppercase tracking-wider ${textSub}`}>Amount</span>
                      <div className={`flex items-center font-bold text-lg ${textMain}`}>
                        <IndianRupee size={16} className="mr-0.5" />
                        {invoice.amount?.toLocaleString()}
                      </div>
                    </div>

                    {invoice.invoiceUrl ? (
                      <a 
                        href={invoice.invoiceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`h-10 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                          isCoding 
                            ? 'bg-white/5 hover:bg-white/10 text-white outline outline-1 outline-white/20' 
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 outline outline-1 outline-neutral-200'
                        }`}
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    ) : (
                      <button 
                        disabled
                        className={`h-10 px-4 rounded-lg flex items-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed ${
                          isCoding ? 'bg-white/5 text-gray-400' : 'bg-neutral-100 text-gray-400'
                        }`}
                      >
                        <Loader2 size={16} className="animate-spin" />
                        <span className="hidden sm:inline">Processing</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, CheckCircle2, Users, GraduationCap, Heart, Play, Lock, 
  FileText, FileDown, Check, Plus, Minus, ArrowRight, Ticket, X, Loader2, AlertCircle, Tag, Send
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import PaymentFailedPopup from '@/components/PaymentFailedPopup';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CourseDetail({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const user = useAppSelector((state: any) => state.app.user);

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'reviews'>('overview');
  const [openUnits, setOpenUnits] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Payment & Coupon States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isFailedPopupOpen, setIsFailedPopupOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, percentage: number} | null>(null);

  // --- NEW: REVIEW STATES ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', text: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  // Optional: You might want an API to check real enrollment. For now, checking user existence.
  // In a real app, `course.isEnrolled` should come from the backend.
  const isEnrolled = !!user; 

  useEffect(() => {
    const fetchCourseAndReviews = async () => {
      setIsLoading(true);
      try {
        // Fetch Course Data
        const { data: courseData } = await api.get(`/courses/${params.courseId}`);
        setCourse(courseData.data);
        
        if (courseData.data.lectures && courseData.data.lectures.length > 0) {
           const firstFolder = courseData.data.lectures[0].folderName || 'General';
           setOpenUnits([firstFolder]);
        }

        // Fetch Reviews Data
        const { data: reviewsData } = await api.get(`/courses/${params.courseId}/reviews`);
        if (reviewsData.success) {
          setReviews(reviewsData.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndReviews();
  }, [params.courseId]);

  const toggleUnit = (folderName: string) => {
    setOpenUnits(prev => prev.includes(folderName) ? prev.filter(u => u !== folderName) : [...prev, folderName]);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponInput.trim().toUpperCase(),
        courseId: params.courseId
      });

      if (data.success) {
        setAppliedCoupon({
          code: data.code,
          percentage: data.discount
        });
        setIsCouponModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid or expired coupon code');
      setCouponInput('');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const handlePayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setIsProcessingPayment(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your connection.');
        setIsProcessingPayment(false);
        return;
      }

      const { data: orderData } = await api.post(`/payment/checkout/${params.courseId}`, {
        couponCode: appliedCoupon?.code || null
      });

      if (!orderData.success) throw new Error('Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Edvara',
        description: `Enrollment: ${course.title}`,
        image: '/logo-dark-text.svg', 
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            const { data: verifyData } = await api.post('/payment/paymentverification', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              router.push(`/payment-success?courseId=${params.courseId}&tx=${response.razorpay_payment_id}`);
            }
          } catch (err) {
            setIsFailedPopupOpen(true);
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: '#FE6100' },
        modal: { ondismiss: function() { setIsProcessingPayment(false); } }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function () {
        setIsFailedPopupOpen(true);
      });
      paymentObject.open();

    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // --- NEW: REVIEW SUBMISSION ---
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.title || !reviewForm.text) return alert("Please fill out all fields.");
    
    setIsSubmittingReview(true);
    try {
      const { data } = await api.post(`/courses/${params.courseId}/reviews`, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        text: reviewForm.text
      });

      if (data.success) {
        setReviews([data.data, ...reviews]); // Add to top of list
        setIsReviewFormOpen(false);
        setReviewForm({ rating: 5, title: '', text: '' });
        alert("Review submitted successfully!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review. You may have already reviewed this course.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id as any);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'content', 'reviews'];
      let currentActive = 'overview';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.getBoundingClientRect().top <= 350) currentActive = section;
      }
      setActiveTab(currentActive as any);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const cardBg = isCoding ? "bg-stone-950" : "bg-white";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-white/70" : "text-gray-600";
  const borderTheme = isCoding ? "border-white/10" : "border-gray-200";
  const dividerTheme = isCoding ? "border-slate-800" : "border-gray-300";
  const inputBg = isCoding ? "bg-black/50 border-white/10 text-white focus:border-[#FE6100]" : "bg-neutral-50 border-gray-200 text-stone-900 focus:border-[#FE6100]";
  const tagClass = isCoding ? "bg-white/10 text-white border-transparent" : "bg-orange-50 text-orange-600 border-orange-100";

  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex justify-center items-center ${bgTheme}`}>
        <Loader2 className="w-12 h-12 text-[#FE6100] animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`min-h-screen w-full flex flex-col justify-center items-center gap-4 ${bgTheme}`}>
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className={`${textMain} text-2xl font-semibold`}>Course Not Found</h2>
        <p className={textSub}>{error}</p>
        <button onClick={() => router.push('/courses')} className="px-6 py-2 mt-4 bg-[#FE6100] text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const groupedLectures = course.lectures?.reduce((acc: any, lecture: any) => {
    const folder = lecture.folderName || 'General';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(lecture);
    return acc;
  }, {}) || {};

  const basePrice = course.price || 0;
  const discountAmount = appliedCoupon ? (basePrice * (appliedCoupon.percentage / 100)) : 0;
  const currentPrice = Math.max(0, basePrice - discountAmount);
  
  const totalDiscountPercent = course.mrp > currentPrice 
    ? Math.round(((course.mrp - currentPrice) / course.mrp) * 100) 
    : 0;

  return (
    <div className={`w-full ${bgTheme} flex flex-col items-center overflow-clip font-['Helvena'] transition-colors duration-500 relative pb-[160px] lg:pb-0`}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`w-[600px] h-[600px] absolute -left-[200px] top-[20%] bg-[#FE6100] ${isCoding ? 'opacity-10' : 'opacity-5'} rounded-full blur-[120px] transition-opacity duration-500`} />
        <div className={`w-[500px] h-[500px] absolute right-[-100px] top-[60%] bg-[#FE6100] ${isCoding ? 'opacity-10' : 'opacity-5'} rounded-full blur-[120px] transition-opacity duration-500`} />
      </div>

      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 pt-[100px] lg:pt-[140px] pb-10 lg:py-14 flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col justify-start items-start gap-8 lg:gap-10 w-full relative">
          <div className="w-full lg:hidden h-56 rounded-xl overflow-hidden bg-[#2A2A2A] mb-2 relative">
            <img className="w-full h-full object-cover mix-blend-overlay opacity-90" src={course.thumbnail?.url || "https://placehold.co/390x220"} alt={course.title} />
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            <div className="flex flex-wrap justify-start items-start gap-3">
              {course.features?.map((feature: string, idx: number) => (
                <div key={idx} className={`px-3 py-1 rounded-[100px] flex justify-center items-center gap-1.5 border ${tagClass}`}>
                  <CheckCircle2 className={`w-4 h-4 ${isCoding ? 'text-[#FE6100]' : 'text-orange-600'}`} />
                  <div className="text-xs md:text-sm font-normal font-['Helvena'] capitalize">{feature}</div>
                </div>
              ))}
            </div>
            
            <div className="self-stretch flex flex-col justify-start items-start gap-4 lg:gap-6">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <h1 className={`${textMain} text-2xl lg:text-4xl font-bold font-['Helvena'] leading-tight`}>{course.title}</h1>
                {course.description && <p className={`${textMain} text-sm lg:text-lg font-normal font-['Helvena']`}>{course.description.substring(0, 150)}...</p>}
              </div>
              <div className="self-stretch flex flex-wrap justify-start items-center gap-3 lg:gap-5">
                <div className="flex justify-start items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className={`${textMain} text-xs lg:text-sm font-semibold font-['Inter']`}>{course.averageRating ? course.averageRating.toFixed(1) : '4.5'}</span>
                </div>
                <div className="flex justify-start items-center gap-1.5">
                  <GraduationCap className={`w-4 h-4 ${textSub}`} />
                  <span className={`${textSub} text-xs lg:text-sm font-normal font-['Helvena']`}>{course.domain === 'university' ? `Semester ${course.semester} • ${course.universityName}` : course.category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`sticky top-[60px] lg:top-[90px] z-40 w-full ${bgTheme} pt-4 pb-0 transition-colors backdrop-blur-md bg-transparent duration-500`}>
            <LayoutGroup>
              <div className={`border-b ${isCoding ? 'border-white/10' : 'border-gray-300'} w-full flex justify-start items-start gap-8 relative`}>
                {['overview', 'content', 'reviews'].map((id) => (
                  <button key={id} onClick={() => scrollToSection(id)} className="pb-3 relative flex flex-col items-start outline-none">
                    <span className={`${activeTab === id ? 'text-[#FE6100]' : `${textSub}`} text-xs lg:text-base font-medium font-['Helvena'] capitalize transition-colors z-10 relative`}>{id}</span>
                    {activeTab === id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#FE6100] z-20" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    )}
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>
          
          <div className="w-full flex flex-col gap-14 lg:gap-20">
            {/* OVERVIEW */}
            <div id="overview" className="flex flex-col gap-10 scroll-mt-[180px]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <h3 className={`${textMain} text-lg lg:text-xl font-semibold font-['Helvena']`}>Course Overview</h3>
                  <p className={`${textSub} text-sm lg:text-base font-medium font-['Helvena'] leading-6 whitespace-pre-line`}>{course.description}</p>
                </div>
                <div className={`self-stretch p-3 lg:p-4 ${isCoding ? 'bg-white/5' : 'bg-orange-50'} rounded-lg flex flex-col gap-4 border ${isCoding ? 'border-white/10' : 'border-orange-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className={`${textMain} text-base font-semibold font-['Helvena']`}>{course.mentorName}</span>
                      <span className={`${textSub} text-sm font-normal font-['Helvena']`}>Course Instructor</span>
                    </div>
                  </div>
                  <p className="text-indigo-700 text-sm font-medium font-['Helvena'] italic">"{course.mentorDescription || 'Dedicated to your success.'}"</p>
                </div>
              </div>
              {(course.notes?.length > 0 || course.pyqs?.length > 0) && (
                <div className="flex flex-col gap-5">
                  <h3 className={`${textMain} text-lg lg:text-xl font-semibold font-['Helvena']`}>Study Resources included</h3>
                  <div className={`p-4 lg:p-5 ${cardBg} rounded-lg flex flex-col gap-3 border ${borderTheme} shadow-sm`}>
                    {course.notes?.map((res: any) => (
                      <div key={res._id} className={`p-3 rounded-md outline outline-1 outline-offset-[-1px] ${isCoding ? 'outline-white/10' : 'outline-neutral-950/10'} flex justify-between items-center`}>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#FE6100]" />
                          <span className={`${textMain} text-sm font-medium font-['Helvena']`}>{res.title}</span>
                        </div>
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div id="content" className="flex flex-col gap-5 scroll-mt-[180px]">
              <h3 className={`${textMain} text-lg lg:text-xl font-semibold font-['Helvena']`}>Course Content</h3>
              <div className={`rounded-md flex flex-col overflow-hidden border ${borderTheme} ${cardBg}`}>
                {Object.keys(groupedLectures).map((folderName) => {
                  const lectures = groupedLectures[folderName];
                  return (
                    <div key={folderName} className={`border-b ${borderTheme} flex flex-col last:border-b-0`}>
                      <button onClick={() => toggleUnit(folderName)} className={`p-4 flex justify-between items-center transition-colors outline-none`}>
                        <div className="flex items-center gap-3">
                          {openUnits.includes(folderName) ? <Minus className={`w-4 h-4 ${textMain}`} /> : <Plus className={`w-4 h-4 ${textMain}`} />}
                          <span className={`${textMain} text-sm lg:text-base font-medium font-['Helvena']`}>{folderName}</span>
                        </div>
                        <span className={`${textSub} text-xs font-normal font-['Helvena']`}>{lectures.length} Lectures</span>
                      </button>
                      <AnimatePresence>
                        {openUnits.includes(folderName) && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-gray-50/10">
                            {lectures.map((lec: any) => (
                              <div key={lec._id} className="pl-10 pr-4 py-3 flex justify-between items-center border-t border-white/5">
                                <div className="flex items-center gap-3">
                                  <Play className={`w-4 h-4 ${lec.isFree ? 'text-[#FE6100]' : 'text-gray-400'}`} />
                                  <span className={`text-sm font-medium font-['Helvena'] ${lec.isFree ? textMain : textSub}`}>{lec.title}</span>
                                </div>
                                {lec.isFree ? <span className="text-[#FE6100] text-xs font-medium font-['Helvena']">Watch Free</span> : <Lock className="w-4 h-4 text-gray-400" />}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- REVIEWS SECTION --- */}
            <div id="reviews" className="flex flex-col gap-6 scroll-mt-[180px]">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`${textMain} text-lg lg:text-xl font-semibold font-['Helvena']`}>Student Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className={`${textMain} font-bold text-lg`}>{course.averageRating ? course.averageRating.toFixed(1) : '4.5'}</span>
                    <span className={`${textSub} text-sm`}>({reviews.length} reviews)</span>
                  </div>
                </div>
                
                {isEnrolled && !isReviewFormOpen && (
                  <button 
                    onClick={() => setIsReviewFormOpen(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium outline outline-1 outline-offset-[-1px] transition-colors ${
                      isCoding ? 'bg-white/5 outline-white/20 text-white hover:bg-white/10' : 'bg-white outline-gray-300 text-stone-900 hover:bg-gray-50'
                    }`}
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {/* REVIEW FORM */}
              <AnimatePresence>
                {isReviewFormOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={`p-5 sm:p-6 rounded-xl border ${borderTheme} ${cardBg} flex flex-col gap-4 overflow-hidden`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className={`${textMain} font-semibold`}>Rate this course</h4>
                      <button onClick={() => setIsReviewFormOpen(false)} className={textSub}><X size={20}/></button>
                    </div>
                    
                    <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                      {/* Rating Selector */}
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} type="button" 
                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                            className="focus:outline-none"
                          >
                            <Star className={`w-8 h-8 transition-colors ${star <= reviewForm.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={`text-xs uppercase tracking-wider ${textSub}`}>Review Title</label>
                        <input 
                          type="text" required maxLength={100}
                          value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})}
                          placeholder="Summarize your experience..." 
                          className={`h-11 px-4 rounded-lg border outline-none text-sm transition-all ${inputBg}`} 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={`text-xs uppercase tracking-wider ${textSub}`}>Detailed Review</label>
                        <textarea 
                          required rows={3}
                          value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
                          placeholder="What did you like about the course? Did it help you?" 
                          className={`p-4 rounded-lg border outline-none text-sm resize-none transition-all ${inputBg}`} 
                        />
                      </div>

                      <button 
                        type="submit" disabled={isSubmittingReview} 
                        className="h-11 mt-2 bg-gradient-to-r from-[#FE6100] to-[#FC3500] text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
                      >
                        {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                        Submit Review
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* REVIEW LIST */}
              <div className={`p-1 sm:p-6 ${cardBg} rounded-xl border ${borderTheme} flex flex-col gap-6 sm:gap-8`}>
                {reviews.length === 0 ? (
                  <p className={`text-center py-4 ${textSub}`}>No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.slice(0, visibleReviewsCount).map((review: any) => (
                    <div key={review._id} className="flex flex-col gap-3.5 border-b last:border-0 pb-6 last:pb-0 border-white/5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {review.user?.avatar?.url ? (
                            <img className="w-11 h-11 rounded-full object-cover" src={review.user.avatar.url} alt={review.user.name} />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#FE6100] flex justify-center items-center text-white font-bold">
                              {review.user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className={`${textMain} text-sm sm:text-base font-medium font-['Helvena']`}>{review.user?.name || 'Anonymous User'}</span>
                            <span className={`${textSub} text-xs font-normal font-['Helvena']`}>
                              {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${j < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`${textMain} text-sm font-bold mb-1`}>{review.title}</h4>
                        <p className={`${textSub} text-sm font-normal font-['Helvena'] leading-6`}>{review.text}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* LOAD MORE BUTTON */}
                {visibleReviewsCount < reviews.length && (
                  <button 
                    onClick={() => setVisibleReviewsCount(prev => prev + 4)}
                    className={`self-center w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium outline outline-1 outline-offset-[-1px] transition-colors ${
                      isCoding ? 'bg-white/5 outline-white/20 text-white hover:bg-white/10' : 'bg-white outline-gray-300 text-stone-900 hover:bg-gray-50'
                    }`}
                  >
                    Show more reviews
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Pricing Card */}
        <div className="hidden lg:block w-full lg:w-[400px] shrink-0 z-20">
          <div className={`w-full ${cardBg} rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col justify-center items-start overflow-hidden border ${borderTheme} relative`}>
            <div className={`w-40 h-40 absolute -bottom-10 -right-10 bg-[#FE6100] ${isCoding ? 'opacity-30' : 'opacity-15'} rounded-full blur-[70px] pointer-events-none z-0`} />
            <div className="w-full aspect-[16/10] bg-[#2A2A2A] overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <img className="w-full h-full object-cover mix-blend-overlay opacity-90" src={course.thumbnail?.url || "https://placehold.co/400x225"} alt={course.title} />
            </div>
            
            <div className={`self-stretch p-5 md:p-6 flex flex-col justify-start items-start gap-5 relative z-10 ${cardBg} bg-opacity-90 backdrop-blur-sm`}>
              <div className="self-stretch flex flex-col justify-start items-start gap-5">
                <div className="flex flex-col justify-center items-start gap-1.5">
                  <div className={`${textMain} text-3xl font-medium font-sans`}>₹{currentPrice}</div>
                  {course.mrp > currentPrice && (
                    <div className="flex items-center flex-wrap gap-2 font-['Helvena']">
                      <span className={`${textSub} text-base font-normal line-through leading-5`}>MRP ₹{course.mrp}</span>
                      <span className="text-orange-600 text-base font-normal leading-5">({totalDiscountPercent}% off)</span>
                    </div>
                  )}
                </div>
                
                <div className="self-stretch flex flex-col gap-2">
                  <motion.button 
                    onClick={handlePayment} disabled={isProcessingPayment}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full h-11 bg-[#FE6100] text-white rounded-lg flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <span className="text-base font-medium font-['Helvena']">{isProcessingPayment ? 'Processing...' : 'Enroll Now'}</span>
                    {!isProcessingPayment && <ArrowRight className="w-5 h-5" strokeWidth={2.5} />}
                  </motion.button>
                  <p className="text-center text-[#FE6100] text-sm font-medium font-['Helvena'] tracking-wide">Don’t wait till exams. Start preparing today.</p>
                </div>
              </div>
              
              <div className={`self-stretch h-[1px] ${borderTheme}`} />
              
              {/* Coupon Section */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className={`${textSub} text-xs font-medium leading-5`}>Apply coupon to save more</div>
                {appliedCoupon ? (
                  <div className={`w-full flex items-center justify-between p-3 rounded-md outline outline-1 outline-offset-[-1px] ${isCoding ? 'bg-emerald-500/10 outline-emerald-500/30' : 'bg-emerald-50 outline-emerald-200'}`}>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 text-sm font-medium">'{appliedCoupon.code}' Applied!</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-500 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="self-stretch flex items-start gap-2">
                    <div className={`flex-1 h-10 px-3 rounded-md outline outline-1 outline-offset-[-1px] flex justify-start items-center ${isCoding ? 'bg-white/5 outline-white/10' : 'bg-neutral-100 outline-gray-300'}`}>
                      <input 
                        type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="ENTER COUPON" disabled={isApplyingCoupon}
                        className={`w-full bg-transparent outline-none text-sm font-medium uppercase placeholder:text-gray-400 disabled:opacity-50 ${textMain}`} 
                      />
                    </div>
                    <button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponInput.trim()} className={`h-10 px-4 rounded-md outline outline-1 outline-offset-[-1px] flex justify-center items-center transition-colors active:scale-95 disabled:opacity-50 ${isCoding ? 'bg-white/5 outline-white/20 text-orange-500 hover:bg-white/10' : 'bg-white outline-gray-300 text-orange-600 hover:bg-neutral-50'}`}>
                      {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-sm font-medium">Apply</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM CTA */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden ${isCoding ? 'bg-[#1C1C1C] border-t border-white/10 shadow-[0px_-4px_32px_rgba(0,0,0,0.5)]' : 'bg-white shadow-[0px_-4px_32px_rgba(0,0,0,0.12)]'} flex flex-col justify-center items-center`}>
        <div className="w-full px-5 py-4 flex flex-col gap-3 max-w-md mx-auto">
          <div className="self-stretch flex justify-between items-center">
            {appliedCoupon ? (
               <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-50 text-emerald-600">
                 <Tag className="w-3 h-3" />
                 <span className="text-xs font-medium">'{appliedCoupon.code}' Applied!</span>
               </div>
            ) : (
              <>
                <div className="flex justify-start items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  <div className={`${textMain} text-sm font-normal font-['Helvena']`}>Apply coupon to save more</div>
                </div>
                <button onClick={() => setIsCouponModalOpen(true)} className="text-orange-600 text-sm font-medium font-['Helvena'] active:scale-95 transition-transform">Apply Now</button>
              </>
            )}
          </div>
          <div className={`self-stretch h-[1px] ${borderTheme}`}></div>
          <div className="self-stretch flex justify-between items-center gap-5">
            <div className="flex flex-col justify-center items-start gap-0.5">
              <div className={`${textMain} text-xl font-medium font-['Helvetica_Neue']`}>₹{currentPrice}</div>
              {course.mrp > currentPrice && (
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className={`${textSub} text-xs font-normal font-['Helvena'] line-through`}>MRP ₹{course.mrp}</span>
                  <span className="text-orange-600 text-xs font-bold font-['Helvena']">({totalDiscountPercent}% off)</span>
                </div>
              )}
            </div>
            <button onClick={handlePayment} disabled={isProcessingPayment} className="flex-1 max-w-[220px] h-11 bg-[#FE6100] text-white rounded-lg flex justify-center items-center gap-2 font-['Helvena'] text-base font-medium shadow-lg hover:bg-orange-700 transition-colors active:scale-95 disabled:opacity-50">
              {isProcessingPayment ? 'Processing...' : 'Enroll Now'}
              {!isProcessingPayment && <ArrowRight className="w-5 h-5" strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE COUPON MODAL */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCouponModalOpen(false)} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-5 font-['Helvena'] lg:hidden">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className={`w-full max-w-[420px] p-6 rounded-t-2xl sm:rounded-xl flex flex-col gap-6 ${cardBg}`}>
              <div className="w-full flex justify-between items-center">
                <h2 className={`${textMain} text-lg font-semibold`}>Apply Coupon</h2>
                <button onClick={() => setIsCouponModalOpen(false)} className={`p-1 rounded-md transition-colors ${isCoding ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-black hover:bg-black/5'}`}><X className="w-5 h-5" /></button>
              </div>
              <div className="w-full flex items-center gap-2">
                <div className={`flex-1 h-12 px-3 rounded-md outline outline-1 outline-offset-[-1px] flex justify-start items-center ${isCoding ? 'bg-white/5 outline-white/10' : 'bg-neutral-100 outline-gray-300'}`}>
                  <input 
                    type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} disabled={isApplyingCoupon}
                    placeholder="ENTER COUPON" className={`w-full bg-transparent outline-none text-base font-medium uppercase placeholder:text-gray-400 disabled:opacity-50 ${textMain}`} 
                  />
                </div>
                <button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponInput.trim()} className={`h-12 px-5 rounded-md outline outline-1 outline-offset-[-1px] flex justify-center items-center transition-colors active:scale-95 disabled:opacity-50 ${isCoding ? 'bg-[#FE6100] outline-[#FE6100] text-white shadow-md' : 'bg-[#FE6100] outline-[#FE6100] text-white shadow-md'}`}>
                  {isApplyingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-base font-medium">Apply</span>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full h-0 border-t ${dividerTheme} relative z-10`} />

      {/* --- FAQ SECTION --- */}
      {course.faqs && course.faqs.length > 0 && (
        <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 py-14 lg:py-24 flex flex-col justify-center items-center gap-10 lg:gap-14 relative z-10">
          <div className="self-stretch flex flex-col justify-center items-center">
            <h2 className="text-center text-[#FE6100] text-2xl lg:text-4xl font-normal font-['Libre_Baskerville'] italic">Frequently</h2>
            <h3 className={`text-center ${textMain} text-3xl lg:text-5xl font-medium font-['Helvena'] leading-tight`}>Asked Question</h3>
          </div>
          <div className="w-full max-w-[900px] flex flex-col justify-start items-start gap-4 lg:gap-6">
            {course.faqs.map((faq: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`w-full p-4 lg:p-6 ${cardBg} rounded-xl transition-all duration-500 ease-in-out border ${isOpen ? 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-transparent' : `${borderTheme} hover:${isCoding ? 'border-white/20' : 'border-gray-300'}`}`}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} className="w-full flex justify-between items-center gap-4 text-left outline-none group">
                    <span className={`flex-1 ${textMain} text-base lg:text-xl font-medium font-['Helvena'] leading-tight lg:leading-8`}>{faq.question}</span>
                    <div className="w-6 h-6 bg-[#FE6100] rounded flex justify-center items-center shrink-0 relative transition-transform duration-300 group-hover:scale-105">
                      <div className="w-3 h-[1.5px] bg-white rounded-full" />
                      <motion.div initial={false} animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }} transition={{ duration: 0.3 }} className="w-[1.5px] h-3 bg-white rounded-full absolute" />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden">
                        <p className={`${textSub} text-sm lg:text-base font-normal font-['Helvena'] leading-relaxed pt-4 max-w-[95%]`}>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PaymentFailedPopup isOpen={isFailedPopupOpen} onClose={() => setIsFailedPopupOpen(false)} onRetry={() => { setIsFailedPopupOpen(false); handlePayment(); }} />
    </div>
  );
}
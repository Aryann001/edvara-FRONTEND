'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, IndianRupee, TrendingUp, GraduationCap, Award } from 'lucide-react';

export default function DashboardOverview() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  
  // Data States
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalRevenue: 0 });
  const [trends, setTrends] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [topUniversities, setTopUniversities] = useState<any[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Helper to merge Revenue and Enrollment arrays into one timeline for Recharts
  const formatChartData = (enrollments: any[], revenue: any[]) => {
    const dataMap = new Map();

    // Map enrollments
    enrollments.forEach(e => {
      dataMap.set(e._id, { date: e._id, enrollments: e.count, revenue: 0 });
    });

    // Map revenue (and merge if date exists)
    revenue.forEach(r => {
      if (dataMap.has(r._id)) {
        dataMap.get(r._id).revenue = r.total;
      } else {
        dataMap.set(r._id, { date: r._id, enrollments: 0, revenue: r.total });
      }
    });

    // Convert map to array and sort chronologically
    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, trendsRes, coursesRes, uniRes] = await Promise.all([
          fetch(`${apiUrl}/analytics/overview`, { credentials: 'include' }),
          fetch(`${apiUrl}/analytics/trends?days=${daysFilter}`, { credentials: 'include' }),
          fetch(`${apiUrl}/analytics/courses`, { credentials: 'include' }),
          fetch(`${apiUrl}/analytics/universities`, { credentials: 'include' })
        ]);

        const overviewData = await overviewRes.json();
        const trendsData = await trendsRes.json();
        const coursesData = await coursesRes.json();
        const uniData = await uniRes.json();

        if (overviewData.success) setStats(overviewData.data);
        if (coursesData.success) setTopCourses(coursesData.data.slice(0, 5)); // Take top 5
        if (uniData.success) setTopUniversities(uniData.data.slice(0, 5)); // Take top 5
        
        if (trendsData.success) {
          const mergedData = formatChartData(trendsData.enrollments, trendsData.revenue);
          setTrends(mergedData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAnalytics();
  }, [apiUrl, daysFilter]);

  // Theming variables
  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } } };

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#FE6100] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-8 pb-24 relative z-10">
      
      {/* Header & Filters */}
      <motion.div variants={itemVars} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className={`text-4xl font-libre ${textColor}`}>Dashboard Overview</h1>
          <p className={`text-base font-helvena mt-2 ${subTextColor}`}>Monitor your platform's financial and enrollment health.</p>
        </div>
        <div className={`p-1 rounded-xl border flex ${cardBg}`}>
          {[7, 30, 90].map(days => (
            <button 
              key={days}
              onClick={() => setDaysFilter(days)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${daysFilter === days ? 'bg-[#FE6100] text-white shadow-md' : `hover:bg-zinc-500/10 ${subTextColor}`}`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex items-center justify-between transition-colors duration-500 ${cardBg}`}>
          <div>
            <p className={`text-sm font-medium ${subTextColor}`}>Total Revenue</p>
            <h3 className={`text-3xl font-bold font-helvena mt-1 ${textColor}`}>₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><IndianRupee size={24} /></div>
        </div>

        <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex items-center justify-between transition-colors duration-500 ${cardBg}`}>
          <div>
            <p className={`text-sm font-medium ${subTextColor}`}>Active Students</p>
            <h3 className={`text-3xl font-bold font-helvena mt-1 ${textColor}`}>{stats.totalStudents.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={24} /></div>
        </div>

        <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex items-center justify-between transition-colors duration-500 ${cardBg}`}>
          <div>
            <p className={`text-sm font-medium ${subTextColor}`}>Total Courses</p>
            <h3 className={`text-3xl font-bold font-helvena mt-1 ${textColor}`}>{stats.totalCourses.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#FE6100]/10 flex items-center justify-center text-[#FE6100]"><BookOpen size={24} /></div>
        </div>
      </motion.div>

      {/* Main Trends Chart */}
      <motion.div variants={itemVars} className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${cardBg}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-bold font-helvena flex items-center gap-2 ${textColor}`}><TrendingUp size={18} className="text-[#FE6100]"/> Revenue & Enrollments</h3>
        </div>
        
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isCoding ? '#333' : '#eee'} vertical={false} />
              <XAxis dataKey="date" stroke={isCoding ? '#888' : '#aaa'} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
              
              {/* Dual Y-Axes to handle completely different scales (Currency vs Headcount) */}
              <YAxis yAxisId="left" stroke={isCoding ? '#888' : '#aaa'} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
              <YAxis yAxisId="right" orientation="right" stroke={isCoding ? '#888' : '#aaa'} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: isCoding ? '#161616' : '#fff', borderRadius: '12px', border: `1px solid ${isCoding ? '#333' : '#eee'}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: isCoding ? '#aaa' : '#666', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area yAxisId="left" type="monotone" name="Revenue (₹)" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area yAxisId="right" type="monotone" name="New Enrollments" dataKey="enrollments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollments)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Grid: Top Courses & Universities */}
      <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Courses List */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col transition-colors duration-500 ${cardBg}`}>
          <h3 className={`text-lg font-bold font-helvena mb-4 flex items-center gap-2 ${textColor}`}>
            <Award size={18} className="text-yellow-500" /> Top Grossing Courses
          </h3>
          <div className="flex flex-col gap-4">
            {topCourses.map((course, idx) => (
              <div key={course._id} className={`p-4 rounded-xl border flex justify-between items-center ${isCoding ? 'bg-black/20 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-600' : isCoding ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${textColor}`}>{course.courseName}</h4>
                    <p className={`text-xs ${subTextColor}`}>{course.category || course.university}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className={`text-sm font-bold text-green-500`}>₹{course.revenue.toLocaleString()}</h4>
                  <p className={`text-xs ${subTextColor}`}>{course.students} Students</p>
                </div>
              </div>
            ))}
            {topCourses.length === 0 && <p className={`text-sm text-center py-4 ${subTextColor}`}>No sales data yet.</p>}
          </div>
        </div>

        {/* Top Universities List */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col transition-colors duration-500 ${cardBg}`}>
          <h3 className={`text-lg font-bold font-helvena mb-4 flex items-center gap-2 ${textColor}`}>
            <GraduationCap size={18} className="text-blue-500" /> Top Universities (Revenue)
          </h3>
          <div className="flex flex-col gap-4">
            {topUniversities.map((uni, idx) => (
              <div key={uni._id} className={`p-4 rounded-xl border flex justify-between items-center ${isCoding ? 'bg-black/20 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-600' : isCoding ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500'}`}>
                    #{idx + 1}
                  </div>
                  <h4 className={`text-sm font-bold ${textColor}`}>{uni._id}</h4>
                </div>
                <div className="text-right">
                  <h4 className={`text-sm font-bold text-green-500`}>₹{uni.revenue.toLocaleString()}</h4>
                  <p className={`text-xs ${subTextColor}`}>{uni.students} Enrollments</p>
                </div>
              </div>
            ))}
            {topUniversities.length === 0 && <p className={`text-sm text-center py-4 ${subTextColor}`}>No university sales yet.</p>}
          </div>
        </div>

      </motion.div>

    </motion.div>
  );
}
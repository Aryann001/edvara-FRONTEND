'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { Plus, Search, Edit3, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import api from '@/services/api';

interface Course {
  _id: string;
  title: string;
  preferredDomain: 'coding' | 'university';
  price: number;
  instructor?: { name: string; email: string };
  createdAt: string;
}

export default function ManageCoursesPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/courses');
        if (data.success) {
          setCourses(data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch courses:", err);
        setError(err.response?.data?.message || 'Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will cascade delete all lectures.')) return;
    
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(course => course._id !== id));
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const tableHeaderBg = isCoding ? 'bg-zinc-800/50' : 'bg-zinc-100/50';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';

  const containerVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-8 pb-24">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-['Libre_Baskerville'] italic ${textColor}`}>Course Management</h1>
          <p className={`text-sm sm:text-base font-['Helvena'] mt-2 ${subTextColor}`}>Create, update, and manage your educational content.</p>
        </div>
        
        <Link href="/dashboard/courses/create">
          <button className="h-11 px-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg hover:opacity-90 transition-all font-['Helvena']">
            <Plus size={18} />
            Create Course
          </button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100/10 border border-red-500/50 text-red-500 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        
        <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center`}>
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={18} />
            <input 
              type="text" 
              placeholder="Search courses by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-11 pl-10 pr-4 rounded-lg border outline-none transition-all font-['Helvena'] text-sm ${inputBg}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`${tableHeaderBg} ${subTextColor} text-xs uppercase tracking-wider font-semibold border-b ${borderColor}`}>
                <th className="p-4 sm:p-6 font-['Helvena']">Course Title</th>
                <th className="p-4 sm:p-6 font-['Helvena']">Domain</th>
                <th className="p-4 sm:p-6 font-['Helvena']">Price</th>
                <th className="p-4 sm:p-6 font-['Helvena']">Instructor</th>
                <th className="p-4 sm:p-6 font-['Helvena'] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors duration-500" style={{ borderColor: isCoding ? '#27272a' : '#e4e4e7' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#FE6100] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`p-8 text-center font-['Helvena'] ${subTextColor}`}>
                    No courses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className={`group hover:bg-zinc-500/5 transition-colors duration-200`}>
                    <td className="p-4 sm:p-6">
                      <div className={`font-medium font-['Helvena'] truncate max-w-[200px] sm:max-w-xs ${textColor}`}>{course.title}</div>
                      <div className={`text-xs mt-1 font-mono ${subTextColor}`}>ID: {course._id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        course.preferredDomain === 'coding' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {course.preferredDomain}
                      </span>
                    </td>
                    <td className={`p-4 sm:p-6 font-['Helvena'] ${textColor}`}>
                      ₹{course.price.toLocaleString()}
                    </td>
                    <td className={`p-4 sm:p-6 font-['Helvena'] ${subTextColor}`}>
                      {course.instructor?.name || 'Admin'}
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <div className="flex justify-end items-center gap-2 sm:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                        
                        <Link href={`/dashboard/courses/${course._id}`}>
                          <button className="p-2 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-blue-500 transition-colors tooltip-trigger" title="Manage Syllabus">
                            <ExternalLink size={16} />
                          </button>
                        </Link>
                        
                        <Link href={`/dashboard/courses/${course._id}`}>
                          <button className="p-2 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-[#FE6100] transition-colors tooltip-trigger" title="Edit Course">
                            <Edit3 size={16} />
                          </button>
                        </Link>

                        <button 
                          onClick={() => handleDelete(course._id)}
                          className="p-2 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-red-500 transition-colors tooltip-trigger" 
                          title="Delete Course"
                        >
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
        
        <div className={`p-4 border-t ${borderColor} flex justify-between items-center text-sm font-['Helvena'] ${subTextColor}`}>
          <span>Showing {filteredCourses.length} courses</span>
        </div>

      </div>
    </motion.div>
  );
}
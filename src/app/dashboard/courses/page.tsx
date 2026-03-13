'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // <-- Added Link import
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { Plus, Search, Edit3, Trash2, ExternalLink } from 'lucide-react';

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${apiUrl}/courses`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [apiUrl]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will cascade delete all lectures.')) return;
    
    try {
      await fetch(`${apiUrl}/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setCourses(courses.filter(course => course._id !== id));
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const tableHeaderBg = isCoding ? 'bg-zinc-800/50' : 'bg-zinc-100/50';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';

  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-4xl font-libre ${textColor}`}>Course Management</h1>
          <p className={`text-base font-helvena mt-2 ${subTextColor}`}>Create, update, and manage your educational content.</p>
        </div>
        
        {/* WIRED UP: Create Course Link */}
        <Link href="/dashboard/courses/create">
          <button className="h-11 px-6 bg-gradient-to-r from-[#FE6100] to-[#FC3500] rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg hover:opacity-90 transition-all">
            <Plus size={18} />
            Create Course
          </button>
        </Link>
      </div>

      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        
        <div className={`p-6 border-b ${borderColor} flex justify-between items-center`}>
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={18} />
            <input 
              type="text" 
              placeholder="Search courses by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-11 pl-10 pr-4 rounded-lg border outline-none transition-all font-helvena text-sm ${inputBg}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${tableHeaderBg} ${subTextColor} text-xs uppercase tracking-wider font-semibold border-b ${borderColor}`}>
                <th className="p-6 font-helvena">Course Title</th>
                <th className="p-6 font-helvena">Domain</th>
                <th className="p-6 font-helvena">Price</th>
                <th className="p-6 font-helvena">Instructor</th>
                <th className="p-6 font-helvena text-right">Actions</th>
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
                  <td colSpan={5} className={`p-8 text-center font-helvena ${subTextColor}`}>
                    No courses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className={`group hover:bg-zinc-500/5 transition-colors duration-200`}>
                    <td className="p-6">
                      <div className={`font-medium font-helvena ${textColor}`}>{course.title}</div>
                      <div className={`text-xs mt-1 ${subTextColor}`}>ID: {course._id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        course.preferredDomain === 'coding' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {course.preferredDomain}
                      </span>
                    </td>
                    <td className={`p-6 font-helvena ${textColor}`}>
                      ₹{course.price.toLocaleString()}
                    </td>
                    <td className={`p-6 font-helvena ${subTextColor}`}>
                      {course.instructor?.name || 'Admin'}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        
                        {/* WIRED UP: View Syllabus / Manage Course */}
                        <Link href={`/dashboard/courses/${course._id}`}>
                          <button className="p-2 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-blue-500 transition-colors tooltip-trigger" title="Manage Syllabus">
                            <ExternalLink size={16} />
                          </button>
                        </Link>
                        
                        {/* Edit and View point to the same manager for now to keep it clean */}
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
        
        <div className={`p-4 border-t ${borderColor} flex justify-between items-center text-sm font-helvena ${subTextColor}`}>
          <span>Showing {filteredCourses.length} courses</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border hover:bg-zinc-500/10 disabled:opacity-50 transition-colors" style={{ borderColor: isCoding ? '#27272a' : '#e4e4e7' }}>Prev</button>
            <button className="px-3 py-1 rounded border hover:bg-zinc-500/10 disabled:opacity-50 transition-colors" style={{ borderColor: isCoding ? '#27272a' : '#e4e4e7' }}>Next</button>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
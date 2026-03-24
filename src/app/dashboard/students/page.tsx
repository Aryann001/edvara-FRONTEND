'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { Search, GraduationCap, ShieldBan, X, BookOpen, IndianRupee, Download, AlertCircle } from 'lucide-react';
import api from '@/services/api';

interface EnrolledCourse {
  _id: string;
  courseName: string;
  pricePaid: number;
  enrolledAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  preferredDomain: string;
  createdAt: string;
  totalSpent: number;
  enrollments: EnrolledCourse[];
}

export default function ManageStudentsPage() {
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [revokeCourseId, setRevokeCourseId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openManageDrawer = (student: User) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStudent(null), 300); 
  };

  // --- THE EXCEL/CSV EXPORT GENERATOR ---
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Domain', 'Total Courses', 'Lifetime Value (INR)', 'Joined Date'];
    
    const rows = filteredStudents.map(student => [
      `"${student.name}"`, 
      `"${student.email}"`,
      student.preferredDomain || 'N/A',
      student.enrollments?.length || 0,
      student.totalSpent || 0,
      new Date(student.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Edvara_Students_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- WIRED ACTION: MANUAL ENROLLMENT ---
  const handleManualEnroll = async () => {
    if(!enrollCourseId || !selectedStudent) return;
    setActionLoading(true);
    try {
      const { data } = await api.post('/admin/enroll', {
        userId: selectedStudent._id,
        courseId: enrollCourseId.trim()
      });
      if (data.success) {
        alert('Student successfully enrolled!');
        setEnrollCourseId('');
        fetchStudents(); // Refresh to update LTV/Enrollment counts
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- WIRED ACTION: REVOKE ACCESS ---
  const handleRevoke = async () => {
    if(!revokeCourseId || !selectedStudent) return;
    
    if (!confirm('Are you sure you want to instantly revoke access to this course?')) return;
    
    setActionLoading(true);
    try {
      const { data } = await api.put('/admin/revoke', {
        userId: selectedStudent._id,
        courseId: revokeCourseId.trim()
      });
      if (data.success) {
        alert('Student access revoked successfully.');
        setRevokeCourseId('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Revocation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const cardBg = isCoding ? 'bg-zinc-900/50 border-white/5' : 'bg-white/60 border-zinc-200';
  const tableHeaderBg = isCoding ? 'bg-zinc-800/50' : 'bg-zinc-100/50';
  const textColor = isCoding ? 'text-gray-100' : 'text-stone-900';
  const subTextColor = isCoding ? 'text-zinc-400' : 'text-zinc-500';
  const borderColor = isCoding ? 'border-zinc-800' : 'border-zinc-200';
  const inputBg = isCoding ? 'bg-black/50 border-zinc-800 text-white focus:border-[#FE6100]' : 'bg-white border-zinc-300 text-stone-900 focus:border-[#FE6100]';
  const drawerBg = isCoding ? 'bg-[#161616]/95 border-l-white/10' : 'bg-white/95 border-l-zinc-200';

  const containerVars: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const drawerVars: Variants = { hidden: { x: '100%' }, show: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } } };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-8 relative pb-24 font-['Helvena']">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-['Libre_Baskerville'] italic ${textColor}`}>Student Directory</h1>
          <p className={`text-sm sm:text-base mt-2 ${subTextColor}`}>Analyze lifetime value, manage enrollments, and export financial data.</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="h-11 px-6 bg-zinc-800 dark:bg-white text-white dark:text-black rounded-xl font-medium flex items-center gap-2 hover:scale-105 transition-all shadow-md"
        >
          <Download size={18} />
          Export to CSV
        </button>
      </div>

      <div className={`rounded-2xl backdrop-blur-xl border shadow-sm flex flex-col overflow-hidden transition-colors duration-500 ${cardBg}`}>
        
        <div className={`p-5 sm:p-6 border-b ${borderColor} flex justify-between items-center`}>
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
                <th className="p-4 sm:p-6">Student</th>
                <th className="p-4 sm:p-6">Domain</th>
                <th className="p-4 sm:p-6">Enrollments</th>
                <th className="p-4 sm:p-6">LTV (Total Spent)</th>
                <th className="p-4 sm:p-6">Joined Date</th>
                <th className="p-4 sm:p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors duration-500" style={{ borderColor: isCoding ? '#27272a' : '#e4e4e7' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#FE6100] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`p-8 text-center ${subTextColor}`}>No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className={`group hover:bg-zinc-500/5 transition-colors duration-200`}>
                    <td className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FE6100] to-orange-400 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className={`font-medium truncate max-w-[120px] sm:max-w-[150px] ${textColor}`}>{student.name}</div>
                        <div className={`text-xs mt-1 truncate max-w-[120px] sm:max-w-[150px] ${subTextColor}`}>{student.email}</div>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        student.preferredDomain === 'coding' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {student.preferredDomain}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className={`flex items-center gap-2 font-medium ${textColor}`}>
                        <BookOpen size={16} className={subTextColor} />
                        {student.enrollments?.length || 0} Courses
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className={`flex items-center gap-1 font-bold ${student.totalSpent > 0 ? 'text-green-500' : subTextColor}`}>
                        <IndianRupee size={16} />
                        {student.totalSpent?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className={`p-4 sm:p-6 ${subTextColor}`}>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <button 
                        onClick={() => openManageDrawer(student)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border hover:shadow-md transition-all ${isCoding ? 'border-zinc-700 text-gray-300 hover:border-[#FE6100] hover:text-[#FE6100]' : 'border-zinc-300 text-stone-700 hover:border-[#FE6100] hover:text-[#FE6100]'}`}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              variants={drawerVars} initial="hidden" animate="show" exit="hidden"
              className={`fixed top-0 right-0 h-full w-full sm:w-[450px] border-l shadow-2xl z-50 p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 backdrop-blur-2xl overflow-y-auto ${drawerBg}`}
            >
              <div className="flex justify-between items-center shrink-0">
                <h2 className={`text-2xl font-['Libre_Baskerville'] italic ${textColor}`}>Student Profile</h2>
                <button onClick={closeDrawer} className={`p-2 rounded-full hover:bg-zinc-500/20 ${subTextColor} transition-colors`}>
                  <X size={20} />
                </button>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-4 shrink-0 ${isCoding ? 'bg-black/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FE6100] to-orange-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <h3 className={`font-medium truncate ${textColor}`}>{selectedStudent.name}</h3>
                    <p className={`text-sm truncate ${subTextColor}`}>{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-500/20">
                  <div className="flex flex-col">
                    <span className={`text-xs uppercase tracking-wider ${subTextColor}`}>LTV</span>
                    <span className={`font-bold text-green-500 flex items-center`}><IndianRupee size={14}/> {selectedStudent.totalSpent?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={`text-xs uppercase tracking-wider ${subTextColor}`}>Joined</span>
                    <span className={`font-medium ${textColor}`}>{new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <h4 className={`text-sm font-bold uppercase tracking-widest ${subTextColor}`}>Purchase History</h4>
                {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedStudent.enrollments.map((enrollment, index) => (
                      <div key={enrollment._id || index} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${isCoding ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-white'}`}>
                        <div className="flex flex-col truncate pr-4">
                          <span className={`font-medium truncate ${textColor}`}>{enrollment.courseName}</span>
                          <span className={`text-xs ${subTextColor}`}>{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-green-500 shrink-0">₹{enrollment.pricePaid.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border text-center text-sm ${isCoding ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'}`}>
                    No course purchases yet.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-auto shrink-0">
                <h4 className={`text-sm font-bold uppercase tracking-widest ${subTextColor} mb-1`}>Admin Actions</h4>
                
                <div className={`p-4 sm:p-5 rounded-xl border flex flex-col gap-4 transition-colors ${isCoding ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><GraduationCap size={20} /></div>
                    <div>
                      <h4 className={`font-medium ${textColor}`}>Manual Enrollment</h4>
                      <p className={`text-xs ${subTextColor}`}>Bypass payment gateway and grant access.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={enrollCourseId} onChange={(e) => setEnrollCourseId(e.target.value)} placeholder="Paste Course ID..." className={`flex-1 h-10 px-3 rounded-lg border outline-none text-sm ${inputBg}`} />
                    <button onClick={handleManualEnroll} disabled={actionLoading || !enrollCourseId} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">Enroll</button>
                  </div>
                </div>

                <div className={`p-4 sm:p-5 rounded-xl border flex flex-col gap-4 transition-colors ${isCoding ? 'border-red-900/20 bg-red-900/10' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><ShieldBan size={20} /></div>
                    <div>
                      <h4 className={`font-medium ${isCoding ? 'text-red-400' : 'text-red-700'}`}>Revoke Access</h4>
                      <p className={`text-xs ${isCoding ? 'text-red-400/70' : 'text-red-700/70'}`}>Instantly block student from a course.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={revokeCourseId} onChange={(e) => setRevokeCourseId(e.target.value)} placeholder="Paste Course ID..." className={`flex-1 h-10 px-3 rounded-lg border outline-none text-sm ${isCoding ? 'bg-black/50 border-red-900/50 text-white' : 'bg-white border-red-200 text-stone-900'}`} />
                    <button onClick={handleRevoke} disabled={actionLoading || !revokeCourseId} className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">Revoke</button>
                  </div>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
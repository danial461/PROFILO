import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, Course, Payment } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, DollarSign, Plus, Edit2, Trash2, CheckCircle, XCircle, FileText, HelpCircle, Video, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [media, setMedia] = useState<{name: string, url: string, type: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'payments' | 'media'>('courses');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    const loadData = async () => {
      const coursesData = await api.getCourses();
      setCourses(coursesData);
      const paymentsData = await api.getPayments();
      setPayments(paymentsData);
      
      try {
        const mediaResponse = await fetch('/api/media');
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          setMedia(mediaData);
        }
      } catch (error) {
        console.error('Error loading media:', error);
      }
    };
    loadData();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await api.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handlePaymentStatus = async (id: string, status: 'approved' | 'rejected') => {
    await api.updatePaymentStatus(id, status);
    setPayments(payments.map(p => p.id === id ? { ...p, status } : p));
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage courses, users, and analytics.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/course/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">1,248</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Courses</p>
            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-4 px-2 font-medium text-sm transition-colors ${activeTab === 'courses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Manage Courses
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-4 px-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Payment Approvals
          {payments.filter(p => p.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {payments.filter(p => p.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`pb-4 px-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'media' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Media Library
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Tier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-lg object-cover" src={course.thumbnail} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.instructor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.priceTier === 'free' ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Premium</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{course.modules.length} lessons</span>
                        {course.quiz && (
                          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <HelpCircle size={12} /> Includes Quiz
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => navigate(`/admin/course/${course.id}`)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan & Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize font-medium">{payment.tier}</div>
                      <div className="text-xs text-gray-500 capitalize">{payment.method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={payment.receiptImage} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                        <FileText size={16} /> View Receipt
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'pending' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Pending</span>}
                      {payment.status === 'approved' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>}
                      {payment.status === 'rejected' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handlePaymentStatus(payment.id, 'approved')} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handlePaymentStatus(payment.id, 'rejected')} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'media' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">All Uploaded Assets</h2>
            <p className="text-sm text-gray-500">{media.length} files found</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {media.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-3">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {file.type === 'application/pdf' ? (
                    <FileText size={40} className="text-red-500" />
                  ) : (
                    <Video size={40} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-500 truncate">{file.url}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + file.url);
                      alert('Link copied to clipboard!');
                    }}
                    className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
            {media.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No media files uploaded yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

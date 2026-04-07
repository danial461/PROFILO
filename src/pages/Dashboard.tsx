import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, Course, Enrollment } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Award, Clock, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommended, setRecommended] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      const userEnrollments = await api.getEnrollments(user.id);
      setEnrollments(userEnrollments);

      const allCourses = await api.getCourses();
      
      const enrolledCourseIds = userEnrollments.map(e => e.courseId);
      const enrolledCoursesData = allCourses.filter(c => enrolledCourseIds.includes(c.id));
      setCourses(enrolledCoursesData);

      const recommendedData = allCourses.filter(c => !enrolledCourseIds.includes(c.id)).slice(0, 3);
      setRecommended(recommendedData);
    };

    loadData();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-600 mt-2">Track your progress and continue learning.</p>
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map(course => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            const progress = enrollment?.progress || 0;

            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="h-40 bg-gray-200 relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-800 shadow">
                    {progress}% Complete
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
                  
                  <div className="mt-4 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <Link
                      to={`/courses/${course.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg font-medium transition-colors"
                    >
                      <PlayCircle size={18} />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
          <p className="text-gray-500 mt-1 mb-4">Enroll in a course to start your learning journey.</p>
          <Link to="/courses" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Browse Courses
          </Link>
        </div>
      )}

      {/* Recommended Courses */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommended.map(course => (
          <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{course.category}</span>
                {course.priceTier === 'free' ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Free</span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Award size={12} /> Premium
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

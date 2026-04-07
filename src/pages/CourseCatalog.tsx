import React, { useEffect, useState } from 'react';
import { api, Course } from '../lib/api';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, BookOpen, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await api.getCourses();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      setAiRecommendedIds(null);
      return;
    }
    
    setIsAISearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const courseData = courses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category
      }));

      const prompt = `
        You are an AI search engine for a learning platform.
        User query: "${searchQuery}"
        
        Available courses:
        ${JSON.stringify(courseData)}
        
        Return ONLY a raw JSON array of course IDs (strings) that best match the user's intent. Do not include markdown formatting, backticks, or any other text. Just the JSON array.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        try {
          // Clean up potential markdown formatting from the response
          const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const ids = JSON.parse(cleanedText);
          if (Array.isArray(ids)) {
            setAiRecommendedIds(ids);
          }
        } catch (e) {
          console.error("Failed to parse AI response", e);
          setAiRecommendedIds(null); // Fallback to normal search
        }
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      setAiRecommendedIds(null); // Fallback to normal search
    } finally {
      setIsAISearching(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = courses.filter(course => {
    // If AI search is active and returned results, use those
    if (aiRecommendedIds !== null) {
      return aiRecommendedIds.includes(course.id);
    }
    
    // Otherwise fallback to normal text search
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover top-tier courses designed to help you ace your CSS, PMS, and IELTS exams.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow flex shadow-sm rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-l-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search courses or ask AI (e.g. 'I want to improve my essay writing')"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === '') setAiRecommendedIds(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
          />
          <button
            onClick={handleAISearch}
            disabled={isAISearching || !searchQuery.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-r-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70"
          >
            {isAISearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide items-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setAiRecommendedIds(null); // Reset AI search when category changes
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {aiRecommendedIds !== null && (
        <div className="mb-6 flex items-center gap-2 text-indigo-600 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <Sparkles size={20} />
          <span className="font-medium text-sm">Showing AI recommendations for "{searchQuery}"</span>
          <button onClick={() => setAiRecommendedIds(null)} className="ml-auto text-xs underline hover:text-indigo-800">Clear AI Search</button>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {course.category}
                </span>
              </div>
              {course.priceTier === 'premium' && (
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Premium
                  </span>
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {course.instructor.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold text-gray-700">{course.rating}</span>
                  <span className="text-xs text-gray-400">({course.reviewsCount})</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

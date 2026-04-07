import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, Course, CourseModule, Quiz, QuizQuestion, CourseResource } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Save, Plus, Trash2, Video, ArrowLeft, HelpCircle, CheckCircle2, FileText, Upload } from 'lucide-react';

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<Course>({
    id: `c_${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    description: '',
    category: 'CSS',
    instructor: user?.name || '',
    thumbnail: 'https://picsum.photos/seed/new-course/800/600',
    priceTier: 'premium',
    modules: [],
    rating: 0,
    reviewsCount: 0
  });

  useEffect(() => {
    if (id && id !== 'new') {
      const loadCourse = async () => {
        const data = await api.getCourseById(id);
        if (data) setCourse(data);
      };
      loadCourse();
    }
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    await api.saveCourse(course);
    setIsSaving(false);
    navigate('/admin');
  };

  const addModule = () => {
    setCourse({
      ...course,
      modules: [
        ...course.modules,
        {
          id: `m_${Math.random().toString(36).substr(2, 9)}`,
          title: 'New Lecture',
          videoUrl: '',
          duration: '00:00',
          isPremium: course.priceTier === 'premium'
        }
      ]
    });
  };

  const updateModule = (moduleId: string, field: keyof CourseModule, value: any) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => m.id === moduleId ? { ...m, [field]: value } : m)
    });
  };

  const removeModule = (moduleId: string) => {
    setCourse({
      ...course,
      modules: course.modules.filter(m => m.id !== moduleId)
    });
  };

  const [uploadingModules, setUploadingModules] = useState<Record<string, boolean>>({});
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'pdf', moduleId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (moduleId) {
      setUploadingModules(prev => ({ ...prev, [moduleId]: true }));
    } else {
      setIsUploadingResource(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (moduleId) {
        updateModule(moduleId, 'videoUrl', data.url);
      } else {
        const newResource: CourseResource = {
          id: `r_${Math.random().toString(36).substr(2, 9)}`,
          title: file.name,
          url: data.url,
          type: 'pdf'
        };
        setCourse({
          ...course,
          resources: [...(course.resources || []), newResource]
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      if (moduleId) {
        setUploadingModules(prev => ({ ...prev, [moduleId]: false }));
      } else {
        setIsUploadingResource(false);
      }
    }
  };

  const removeResource = (resourceId: string) => {
    setCourse({
      ...course,
      resources: (course.resources || []).filter(r => r.id !== resourceId)
    });
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_${Math.random().toString(36).substr(2, 9)}`,
      question: 'New Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0
    };

    setCourse({
      ...course,
      quiz: {
        id: course.quiz?.id || `quiz_${Math.random().toString(36).substr(2, 9)}`,
        title: course.quiz?.title || `${course.title} Final Quiz`,
        questions: [...(course.quiz?.questions || []), newQuestion]
      }
    });
  };

  const updateQuizQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
    if (!course.quiz) return;
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        questions: course.quiz.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q)
      }
    });
  };

  const updateQuizOption = (questionId: string, optionIndex: number, value: string) => {
    if (!course.quiz) return;
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        questions: course.quiz.questions.map(q => {
          if (q.id === questionId) {
            const newOptions = [...q.options];
            newOptions[optionIndex] = value;
            return { ...q, options: newOptions };
          }
          return q;
        })
      }
    });
  };

  const removeQuizQuestion = (questionId: string) => {
    if (!course.quiz) return;
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        questions: course.quiz.questions.filter(q => q.id !== questionId)
      }
    });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{id === 'new' ? 'Create New Course' : 'Edit Course'}</h1>
            <p className="text-gray-600">Fill in the details and add lectures below.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Course'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={course.title}
                  onChange={e => setCourse({...course, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. CSS Essay Mastery"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={course.category}
                  onChange={e => setCourse({...course, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. CSS, PMS, IELTS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
                <input 
                  type="text" 
                  value={course.instructor}
                  onChange={e => setCourse({...course, instructor: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Tier</label>
                <select 
                  value={course.priceTier}
                  onChange={e => setCourse({...course, priceTier: e.target.value as 'free' | 'premium'})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium (Requires Subscription)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={course.description}
                  onChange={e => setCourse({...course, description: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modules/Lectures */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Lectures & Videos</h2>
              <button 
                onClick={addModule}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors text-sm border border-blue-200"
              >
                <Plus size={16} /> Add Lecture
              </button>
            </div>

            <div className="space-y-4">
              {course.modules.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">No lectures added yet. Click "Add Lecture" to start.</p>
                </div>
              ) : (
                course.modules.map((module, index) => (
                  <div key={module.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative group">
                    <button 
                      onClick={() => removeModule(module.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-gray-900">Lecture Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Lecture Title</label>
                        <input 
                          type="text" 
                          value={module.title}
                          onChange={e => updateModule(module.id, 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Duration (e.g. 15:30)</label>
                        <input 
                          type="text" 
                          value={module.duration}
                          onChange={e => updateModule(module.id, 'duration', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Video Source</label>
                        <div className="flex flex-col gap-2">
                          <input 
                            type="text" 
                            value={module.videoUrl}
                            onChange={e => updateModule(module.id, 'videoUrl', e.target.value)}
                            placeholder="Paste YouTube Embed URL or upload a file below"
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">OR</span>
                            <label className={`cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center gap-1 ${uploadingModules[module.id] ? 'opacity-50 pointer-events-none' : ''}`}>
                              <Video size={14} />
                              {uploadingModules[module.id] ? 'Uploading...' : 'Upload Video File'}
                              <input 
                                type="file" 
                                accept="video/*" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, 'video', module.id)}
                                disabled={uploadingModules[module.id]}
                              />
                            </label>
                          </div>
                          {module.videoUrl.startsWith('/uploads/') && (
                            <p className="text-xs text-green-600 mt-1">
                              Video uploaded successfully.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id={`premium-${module.id}`}
                          checked={module.isPremium}
                          onChange={e => updateModule(module.id, 'isPremium', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`premium-${module.id}`} className="text-sm text-gray-700">
                          Lock this lecture for Premium subscribers only
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resources Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">Resources & PDFs</h2>
              </div>
              <label className={`cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors text-sm ${isUploadingResource ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={16} />
                {isUploadingResource ? 'Uploading...' : 'Upload PDF'}
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                  disabled={isUploadingResource}
                />
              </label>
            </div>

            <div className="space-y-3">
              {(!course.resources || course.resources.length === 0) ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">No resources added yet. Upload PDFs for students to download.</p>
                </div>
              ) : (
                course.resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-red-100 text-red-600 p-2 rounded-lg flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                        <p className="text-xs text-gray-500 truncate">{resource.url}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeResource(resource.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Final Quiz Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-blue-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">Final Quiz</h2>
              </div>
              <button 
                onClick={addQuizQuestion}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors text-sm border border-blue-200"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            <div className="space-y-6">
              {!course.quiz || course.quiz.questions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">No quiz questions added yet. Quizzes help students test their knowledge.</p>
                </div>
              ) : (
                course.quiz.questions.map((question, qIndex) => (
                  <div key={question.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 relative group">
                    <button 
                      onClick={() => removeQuizQuestion(question.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        Q{qIndex + 1}
                      </span>
                      <input 
                        type="text"
                        value={question.question}
                        onChange={e => updateQuizQuestion(question.id, 'question', e.target.value)}
                        className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none font-bold text-gray-900 py-1"
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuizQuestion(question.id, 'correctAnswer', oIndex)}
                            className={`p-1 rounded-full transition-colors ${question.correctAnswer === oIndex ? 'text-green-600 bg-green-100' : 'text-gray-300 hover:text-gray-400'}`}
                            title="Mark as correct answer"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <input 
                            type="text"
                            value={option}
                            onChange={e => updateQuizOption(question.id, oIndex, e.target.value)}
                            className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${question.correctAnswer === oIndex ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Course, Enrollment, Quiz, QuizQuestion, MockExam } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PlayCircle, CheckCircle, Lock, BookOpen, Clock, Award, HelpCircle, ChevronRight, ChevronLeft, Timer, AlertCircle, FileText } from 'lucide-react';

function MockExamPlayer({ exam, onComplete, isCompleted, savedScore }: { exam: MockExam, onComplete: (score: number) => void, isCompleted: boolean, savedScore?: number }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(isCompleted);
  const [score, setScore] = useState(savedScore || 0);
  const [timeLeft, setTimeLeft] = useState(exam.timeLimitMinutes * 60);
  const [isExamStarted, setIsExamStarted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamStarted && !showResults && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isExamStarted, showResults, timeLeft]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    exam.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    onComplete(correctCount);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isExamStarted && !showResults) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 text-blue-600">
          <Timer size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h2>
        <p className="text-gray-600 mb-6">
          This is a timed exam. You have <strong>{exam.timeLimitMinutes} minutes</strong> to complete <strong>{exam.questions.length} questions</strong>.
          Once started, the timer cannot be paused.
        </p>
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertCircle size={18} />
            <p className="text-left">Make sure you have a stable connection before starting.</p>
          </div>
          <button 
            onClick={() => setIsExamStarted(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Mock Exam
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / exam.questions.length) * 100);
    const passed = percentage >= 70; // 70% passing grade for mock exam
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          {passed ? <Award size={40} /> : <AlertCircle size={40} />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? 'Exam Passed!' : 'Exam Not Passed'}
        </h2>
        <p className="text-gray-600 mb-2">
          You scored {score} out of {exam.questions.length} ({percentage}%).
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {passed ? 'Great job! You are well prepared for the actual exam.' : 'We recommend reviewing the course material and trying again.'}
        </p>
        <button 
          onClick={() => {
            setShowResults(false);
            setSelectedAnswers({});
            setCurrentQuestionIndex(0);
            setTimeLeft(exam.timeLimitMinutes * 60);
            setIsExamStarted(false);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Retake Exam
        </button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{exam.title}</h2>
          <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
          <Timer size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">{currentQuestion.question}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion.id, index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-100 hover:border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedAnswers[currentQuestion.id] === index ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        {currentQuestionIndex === exam.questions.length - 1 ? (
          <button
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            Submit Exam
          </button>
        ) : (
          <button
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

function QuizPlayer({ quiz, onComplete, isCompleted }: { quiz: Quiz, onComplete: () => void, isCompleted: boolean }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(isCompleted);
  const [score, setScore] = useState(0);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    if (correctCount === quiz.questions.length) {
      onComplete();
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (showResults) {
    const passed = score === quiz.questions.length;
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          {passed ? <Award size={40} /> : <HelpCircle size={40} />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? 'Congratulations!' : 'Keep Practicing!'}
        </h2>
        <p className="text-gray-600 mb-6">
          You scored {score} out of {quiz.questions.length} correct.
          {passed ? ' You have successfully completed the course quiz.' : ' You need to get all questions right to pass.'}
        </p>
        {!passed && (
          <button 
            onClick={() => {
              setShowResults(false);
              setSelectedAnswers({});
              setCurrentQuestionIndex(0);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">{currentQuestion.question}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion.id, index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-100 hover:border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedAnswers[currentQuestion.id] === index ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      const data = await api.getCourseById(id);
      if (data) {
        setCourse(data);
        setActiveModule(data.modules[0]?.id || null);
      }
    };
    loadCourse();
  }, [id]);

  useEffect(() => {
    const loadEnrollment = async () => {
      if (!user || !id) return;
      const enrollments = await api.getEnrollments(user.id);
      const current = enrollments.find(e => e.courseId === id);
      if (current) {
        setEnrollment(current);
      }
    };
    loadEnrollment();
  }, [user, id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (course?.priceTier === 'premium' && user.subscriptionTier === 'free') {
      navigate('/pricing');
      return;
    }
    if (id) {
      await api.enrollInCourse(user.id, id);
      const enrollments = await api.getEnrollments(user.id);
      setEnrollment(enrollments.find(e => e.courseId === id) || null);
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    if (!user || !id) return;
    await api.updateProgress(user.id, id, moduleId);
    const enrollments = await api.getEnrollments(user.id);
    setEnrollment(enrollments.find(e => e.courseId === id) || null);
  };

  const handleCompleteQuiz = async () => {
    if (!user || !id) return;
    await api.completeQuiz(user.id, id);
    const enrollments = await api.getEnrollments(user.id);
    setEnrollment(enrollments.find(e => e.courseId === id) || null);
  };

  const handleCompleteMockExam = async (score: number) => {
    if (!user || !id) return;
    await api.completeMockExam(user.id, id, score);
    const enrollments = await api.getEnrollments(user.id);
    setEnrollment(enrollments.find(e => e.courseId === id) || null);
  };

  if (!course) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const isEnrolled = !!enrollment;
  const canAccessPremium = user?.subscriptionTier !== 'free' || user?.role === 'admin';
  const currentModule = course.modules.find(m => m.id === activeModule);
  const isQuizActive = activeModule === 'quiz';
  const isMockExamActive = activeModule === 'mock-exam';

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return it
    if (url.includes('youtube.com/embed/')) return url;
    
    // Handle standard watch URLs
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/\s]+)/);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    return url;
  };

  const isLocalVideo = (url: string) => {
    if (!url) return false;
    return url.startsWith('/uploads/') || 
           url.startsWith('blob:') || 
           url.toLowerCase().endsWith('.mp4') || 
           url.toLowerCase().endsWith('.webm') ||
           url.toLowerCase().endsWith('.ogg');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="lg:w-2/3">
          {/* Video Player Area / Quiz Area / Mock Exam Area */}
          <div className="rounded-2xl overflow-hidden aspect-video relative shadow-xl bg-gray-900">
            {isQuizActive && course.quiz ? (
              <div className="absolute inset-0 overflow-y-auto bg-gray-50 p-4 lg:p-8">
                <QuizPlayer 
                  quiz={course.quiz} 
                  onComplete={handleCompleteQuiz} 
                  isCompleted={enrollment?.quizCompleted || false} 
                />
              </div>
            ) : isMockExamActive && course.mockExam ? (
              <div className="absolute inset-0 overflow-y-auto bg-gray-50 p-4 lg:p-8">
                <MockExamPlayer 
                  exam={course.mockExam} 
                  onComplete={handleCompleteMockExam} 
                  isCompleted={enrollment?.mockExamCompleted || false}
                  savedScore={enrollment?.mockExamScore}
                />
              </div>
            ) : currentModule ? (
              (!currentModule.isPremium || canAccessPremium || isEnrolled) ? (
                isLocalVideo(currentModule.videoUrl) ? (
                  <video
                    src={currentModule.videoUrl}
                    title={currentModule.title}
                    className="w-full h-full object-contain"
                    controls
                    controlsList="nodownload"
                  />
                ) : (
                  <iframe
                    src={getYouTubeEmbedUrl(currentModule.videoUrl)}
                    title={currentModule.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                  <Lock className="w-16 h-16 mb-4 text-amber-500" />
                  <h3 className="text-2xl font-bold mb-2">Premium Content</h3>
                  <p className="text-gray-300 mb-6 max-w-md">This lesson is part of our premium curriculum. Upgrade your subscription to unlock full access.</p>
                  <button onClick={() => navigate('/pricing')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                    Upgrade to Premium
                  </button>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">Select a module to begin</div>
            )}
          </div>

          {/* Course Info */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {course.category}
              </span>
              {course.priceTier === 'premium' && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <Award size={14} /> Premium
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{course.description}</p>
            
            <div className="flex items-center gap-4 py-4 border-y border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="font-medium text-gray-900">{course.instructor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            {!isEnrolled ? (
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to start?</h3>
                <p className="text-gray-600 mb-6">Enroll now to track your progress and access all materials.</p>
                <button
                  onClick={handleEnroll}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
                >
                  Enroll in Course
                </button>
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Your Progress</span>
                  <span className="text-blue-600 font-bold">{enrollment.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${enrollment.progress}%` }}></div>
                </div>
              </div>
            )}

            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Course Content
            </h3>
            
            <div className="space-y-3 mb-8">
              {course.modules.map((module, index) => {
                const isCompleted = enrollment?.completedModules.includes(module.id);
                const isActive = activeModule === module.id;
                const isLocked = module.isPremium && !canAccessPremium && !isEnrolled;

                return (
                  <div
                    key={module.id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                    } ${isLocked ? 'opacity-75' : 'cursor-pointer'}`}
                    onClick={() => !isLocked && setActiveModule(module.id)}
                  >
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <PlayCircle className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className={`font-medium text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {index + 1}. {module.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                    {isEnrolled && isActive && !isCompleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteModule(module.id);
                        }}
                        className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded font-medium transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                );
              })}

              {course.quiz && (
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    activeModule === 'quiz' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                  } cursor-pointer`}
                  onClick={() => setActiveModule('quiz')}
                >
                  <div className="mt-1">
                    {enrollment?.quizCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <HelpCircle className={`w-5 h-5 ${activeModule === 'quiz' ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className={`font-bold text-sm ${activeModule === 'quiz' ? 'text-blue-900' : 'text-gray-900'}`}>
                      Final Quiz: {course.quiz.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Test your knowledge</p>
                  </div>
                </div>
              )}

              {course.mockExam && (
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    activeModule === 'mock-exam' ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'
                  } cursor-pointer`}
                  onClick={() => setActiveModule('mock-exam')}
                >
                  <div className="mt-1">
                    {enrollment?.mockExamCompleted ? (
                      <CheckCircle className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <Timer className={`w-5 h-5 ${activeModule === 'mock-exam' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className={`font-bold text-sm ${activeModule === 'mock-exam' ? 'text-indigo-900' : 'text-gray-900'}`}>
                      Full Mock Exam
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{course.mockExam.timeLimitMinutes} mins • {course.mockExam.questions.length} questions</p>
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Resources & Notes
            </h3>
            <div className="space-y-3">
              {(!course.resources || course.resources.length === 0) ? (
                <p className="text-sm text-gray-500 italic">No resources available for this course.</p>
              ) : (
                course.resources.map((resource) => (
                  <a 
                    key={resource.id}
                    href={resource.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-red-100 text-red-600 p-2 rounded-lg flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{resource.title}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 flex-shrink-0">View</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

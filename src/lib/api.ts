export type Role = 'admin' | 'student' | 'instructor';
export type SubscriptionTier = 'free' | 'monthly' | 'quarterly' | 'yearly';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  subscriptionTier: SubscriptionTier;
  enrolledCourses: string[]; // Course IDs
}

export interface CourseModule {
  id: string;
  title: string;
  videoUrl: string; // Can be YouTube embed or local blob URL
  duration: string;
  isPremium: boolean;
}

export interface CourseResource {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'other';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of options
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface MockExam extends Quiz {
  timeLimitMinutes: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  thumbnail: string;
  priceTier: 'free' | 'premium';
  modules: CourseModule[];
  resources?: CourseResource[];
  quiz?: Quiz;
  mockExam?: MockExam;
  rating: number;
  reviewsCount: number;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  progress: number; // 0 to 100
  completedModules: string[]; // Module IDs
  quizCompleted: boolean;
  mockExamCompleted: boolean;
  mockExamScore?: number;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  tier: SubscriptionTier;
  method: 'jazzcash' | 'easypaisa' | 'bank';
  receiptImage: string; // Base64 image data
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

// Initial Mock Data
const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'CSS English Essay Mastery',
    description: 'Master the art of writing high-scoring English essays for CSS exams. Covers structure, argumentation, and vocabulary.',
    category: 'English Essay',
    instructor: 'Sir Tariq',
    thumbnail: 'https://picsum.photos/seed/css-essay/800/600',
    priceTier: 'premium',
    rating: 4.8,
    reviewsCount: 124,
    modules: [
      { id: 'm1', title: 'Introduction to CSS Essay', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:00', isPremium: false },
      { id: 'm2', title: 'Structuring Your Argument', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '25:00', isPremium: true },
      { id: 'm3', title: 'Advanced Vocabulary', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20:00', isPremium: true },
    ],
    quiz: {
      id: 'q1',
      title: 'CSS Essay Final Quiz',
      questions: [
        { id: 'q1_1', question: 'What is the most important part of a CSS essay?', options: ['Vocabulary', 'Structure', 'Length', 'Handwriting'], correctAnswer: 1 },
        { id: 'q1_2', question: 'How many words should a CSS essay ideally be?', options: ['1000-1500', '2500-3000', '500-1000', '4000+'], correctAnswer: 1 }
      ]
    },
    mockExam: {
      id: 'me1',
      title: 'CSS Essay Full Mock Exam',
      timeLimitMinutes: 60,
      questions: [
        { id: 'me1_1', question: 'Which of these is a common CSS essay topic?', options: ['Quantum Physics', 'Climate Change in Pakistan', 'Cooking Recipes', 'Mobile App Development'], correctAnswer: 1 },
        { id: 'me1_2', question: 'The thesis statement should be placed in:', options: ['The conclusion', 'The introduction', 'The middle of a body paragraph', 'The bibliography'], correctAnswer: 1 },
        { id: 'me1_3', question: 'What is the purpose of a transition sentence?', options: ['To confuse the reader', 'To link ideas between paragraphs', 'To increase word count', 'To end the essay'], correctAnswer: 1 },
        { id: 'me1_4', question: 'A good CSS essay must be:', options: ['Biased', 'Objective and analytical', 'Purely emotional', 'Written in bullet points'], correctAnswer: 1 },
        { id: 'me1_5', question: 'Which of the following is NOT a part of a standard essay structure?', options: ['Introduction', 'Body Paragraphs', 'Conclusion', 'Executive Summary'], correctAnswer: 3 }
      ]
    }
  },
  {
    id: 'c2',
    title: 'IELTS Band 8+ Strategy',
    description: 'Comprehensive guide to achieving a Band 8 or higher in IELTS Academic and General Training.',
    category: 'IELTS',
    instructor: 'Madam Ayesha',
    thumbnail: 'https://picsum.photos/seed/ielts/800/600',
    priceTier: 'free',
    rating: 4.9,
    reviewsCount: 342,
    modules: [
      { id: 'm1', title: 'Listening Strategies', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:00', isPremium: false },
      { id: 'm2', title: 'Reading Comprehension', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22:00', isPremium: false },
    ]
  },
  {
    id: 'c3',
    title: 'Pakistan Affairs Comprehensive',
    description: 'In-depth analysis of Pakistan Affairs from pre-partition to current geopolitical scenarios.',
    category: 'Pakistan Affairs',
    instructor: 'Dr. Hasan',
    thumbnail: 'https://picsum.photos/seed/pak-affairs/800/600',
    priceTier: 'premium',
    rating: 4.7,
    reviewsCount: 89,
    modules: [
      { id: 'm1', title: 'Pre-Partition History', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '30:00', isPremium: false },
      { id: 'm2', title: 'Post-1947 Challenges', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '45:00', isPremium: true },
    ]
  }
];

// Mock API Functions
export const api = {
  getCourses: async (): Promise<Course[]> => {
    const stored = localStorage.getItem('profilo_courses');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('profilo_courses', JSON.stringify(MOCK_COURSES));
    return MOCK_COURSES;
  },
  
  getCourseById: async (id: string): Promise<Course | undefined> => {
    const courses = await api.getCourses();
    return courses.find(c => c.id === id);
  },

  saveCourse: async (course: Course): Promise<void> => {
    const courses = await api.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem('profilo_courses', JSON.stringify(courses));
  },

  deleteCourse: async (id: string): Promise<void> => {
    const courses = await api.getCourses();
    const filtered = courses.filter(c => c.id !== id);
    localStorage.setItem('profilo_courses', JSON.stringify(filtered));
  },

  getEnrollments: async (userId: string): Promise<Enrollment[]> => {
    const stored = localStorage.getItem('profilo_enrollments');
    const enrollments: Enrollment[] = stored ? JSON.parse(stored) : [];
    return enrollments.filter(e => e.userId === userId);
  },

  enrollInCourse: async (userId: string, courseId: string): Promise<void> => {
    const stored = localStorage.getItem('profilo_enrollments');
    const enrollments: Enrollment[] = stored ? JSON.parse(stored) : [];
    
    if (!enrollments.find(e => e.userId === userId && e.courseId === courseId)) {
      enrollments.push({ userId, courseId, progress: 0, completedModules: [], quizCompleted: false, mockExamCompleted: false });
      localStorage.setItem('profilo_enrollments', JSON.stringify(enrollments));
    }
  },

  updateProgress: async (userId: string, courseId: string, moduleId: string): Promise<void> => {
    const stored = localStorage.getItem('profilo_enrollments');
    const enrollments: Enrollment[] = stored ? JSON.parse(stored) : [];
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    
    if (enrollment && !enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
      const course = await api.getCourseById(courseId);
      if (course) {
        const totalItems = course.modules.length + (course.quiz ? 1 : 0) + (course.mockExam ? 1 : 0);
        const completedItems = enrollment.completedModules.length + (enrollment.quizCompleted ? 1 : 0) + (enrollment.mockExamCompleted ? 1 : 0);
        enrollment.progress = Math.round((completedItems / totalItems) * 100);
      }
      localStorage.setItem('profilo_enrollments', JSON.stringify(enrollments));
    }
  },

  completeQuiz: async (userId: string, courseId: string): Promise<void> => {
    const stored = localStorage.getItem('profilo_enrollments');
    const enrollments: Enrollment[] = stored ? JSON.parse(stored) : [];
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    
    if (enrollment && !enrollment.quizCompleted) {
      enrollment.quizCompleted = true;
      const course = await api.getCourseById(courseId);
      if (course) {
        const totalItems = course.modules.length + (course.quiz ? 1 : 0) + (course.mockExam ? 1 : 0);
        const completedItems = enrollment.completedModules.length + (enrollment.quizCompleted ? 1 : 0) + (enrollment.mockExamCompleted ? 1 : 0);
        enrollment.progress = Math.round((completedItems / totalItems) * 100);
      }
      localStorage.setItem('profilo_enrollments', JSON.stringify(enrollments));
    }
  },

  completeMockExam: async (userId: string, courseId: string, score: number): Promise<void> => {
    const stored = localStorage.getItem('profilo_enrollments');
    const enrollments: Enrollment[] = stored ? JSON.parse(stored) : [];
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    
    if (enrollment) {
      enrollment.mockExamCompleted = true;
      enrollment.mockExamScore = score;
      const course = await api.getCourseById(courseId);
      if (course) {
        const totalItems = course.modules.length + (course.quiz ? 1 : 0) + (course.mockExam ? 1 : 0);
        const completedItems = enrollment.completedModules.length + (enrollment.quizCompleted ? 1 : 0) + (enrollment.mockExamCompleted ? 1 : 0);
        enrollment.progress = Math.round((completedItems / totalItems) * 100);
      }
      localStorage.setItem('profilo_enrollments', JSON.stringify(enrollments));
    }
  },

  submitPayment: async (payment: Omit<Payment, 'id' | 'status' | 'date'>): Promise<void> => {
    const stored = localStorage.getItem('profilo_payments');
    const payments: Payment[] = stored ? JSON.parse(stored) : [];
    payments.push({
      ...payment,
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      date: new Date().toISOString(),
    });
    localStorage.setItem('profilo_payments', JSON.stringify(payments));
  },

  getPayments: async (): Promise<Payment[]> => {
    const stored = localStorage.getItem('profilo_payments');
    return stored ? JSON.parse(stored) : [];
  },

  updatePaymentStatus: async (paymentId: string, status: 'approved' | 'rejected'): Promise<void> => {
    const stored = localStorage.getItem('profilo_payments');
    const payments: Payment[] = stored ? JSON.parse(stored) : [];
    const index = payments.findIndex(p => p.id === paymentId);
    if (index >= 0) {
      payments[index].status = status;
      localStorage.setItem('profilo_payments', JSON.stringify(payments));
      
      // If approved, update the user's subscription tier
      if (status === 'approved') {
        const payment = payments[index];
        const storedUsers = localStorage.getItem('profilo_users');
        if (storedUsers) {
          const users: any[] = JSON.parse(storedUsers);
          const userIndex = users.findIndex(u => u.id === payment.userId);
          if (userIndex >= 0) {
            users[userIndex].subscriptionTier = payment.tier;
            localStorage.setItem('profilo_users', JSON.stringify(users));
          }
        }
      }
    }
  }
};

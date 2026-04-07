import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Users, Zap, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Master CSS, PMS & IELTS with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              PROFILO is Pakistan's premier AI-powered learning platform. Get personalized guidance, structured courses, and expert insights to ace your exams.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/courses"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Explore Courses
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                Start Learning Free <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Learn Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Structured Curriculum
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Expertly crafted courses covering English Essay, Precis, Islamiat, General Science, and more.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  AI Tutor Assistance
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Get instant answers to your queries in English or Urdu. Our AI tutor is available 24/7.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Award className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Progress Tracking
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Monitor your learning journey with detailed analytics and module completion tracking.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Expert Instructors
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Learn from top-tier educators and CSP officers who have mastered the exams.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

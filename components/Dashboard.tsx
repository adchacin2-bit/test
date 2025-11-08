'use client';

import React, { useState } from 'react';
import { Plus, BookOpen, Trophy, TrendingUp, Trash2, Upload, Moon, Sun } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/ProgressBar';
import { Loading } from './ui/Loading';
import type { Course, UserProgress } from '@/types';
import { processPDF } from '@/lib/api';
import { addCourse, deleteCourse } from '@/lib/storage';

interface DashboardProps {
  courses: Course[];
  userProgress: UserProgress;
  darkMode: boolean;
  onSelectCourse: (courseId: number) => void;
  onCoursesUpdate: (courses: Course[]) => void;
  onToggleDarkMode: () => void;
}

export function Dashboard({
  courses,
  userProgress,
  darkMode,
  onSelectCourse,
  onCoursesUpdate,
  onToggleDarkMode,
}: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleAddCourse = async () => {
    if (!courseName.trim() || !selectedFile) {
      setError('Please provide a course name and select a PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Process PDF and extract topics
      const topics = await processPDF(selectedFile, courseName);

      // Create new course
      const newCourse: Course = {
        id: Date.now(),
        name: courseName,
        topics: topics.map((topic) => ({
          ...topic,
          mastery: 0,
          questionsAttempted: 0,
          correctAnswers: 0,
          lastPracticed: null,
        })),
        addedDate: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        pdfName: selectedFile.name,
      };

      const updatedCourses = addCourse(newCourse);
      onCoursesUpdate(updatedCourses);

      // Reset form
      setCourseName('');
      setSelectedFile(null);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCourse = (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this course? This cannot be undone.')) {
      const updatedCourses = deleteCourse(courseId);
      onCoursesUpdate(updatedCourses);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent mb-2">
              LimeGuide 🍋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Your AI-powered study dashboard</p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-lime-100 dark:bg-lime-900 rounded-xl">
                <TrendingUp className="w-8 h-8 text-lime-600 dark:text-lime-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProgress.streak} {userProgress.streak === 1 ? 'day' : 'days'} 🔥
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProgress.totalQuestionsAllTime}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Topics Mastered</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProgress.topicsMastered}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProgress.totalHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Courses</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Upload a PDF to get started with AI-generated practice questions
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const avgMastery =
                course.topics.reduce((sum, topic) => sum + topic.mastery, 0) / course.topics.length || 0;
              const totalQuestions = course.topics.reduce((sum, topic) => sum + topic.questionsAttempted, 0);

              return (
                <Card
                  key={course.id}
                  hoverable
                  onClick={() => onSelectCourse(course.id)}
                  className="p-6 relative"
                >
                  <button
                    onClick={(e) => handleDeleteCourse(course.id, e)}
                    className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    aria-label="Delete course"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{course.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {course.topics.length} topics • {totalQuestions} questions
                    </p>
                  </div>

                  <ProgressBar value={avgMastery} label="Overall Mastery" className="mb-4" />

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Added {new Date(course.addedDate).toLocaleDateString()}</span>
                    {course.pdfName && (
                      <span className="truncate max-w-[150px]" title={course.pdfName}>
                        📄 {course.pdfName}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setIsAddModalOpen(false);
            setError(null);
            setCourseName('');
            setSelectedFile(null);
          }
        }}
        title="Add New Course"
      >
        {isProcessing ? (
          <Loading message="Processing PDF and extracting topics..." size="lg" />
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Biochemistry, Physics"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-lime-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload PDF
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-lime-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer text-lime-600 dark:text-lime-400 font-medium hover:underline"
                >
                  {selectedFile ? selectedFile.name : 'Click to select PDF'}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Upload your course notes or textbook
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl">
                <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleAddCourse} className="flex-1" disabled={!courseName.trim() || !selectedFile}>
                Add Course
              </Button>
              <Button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setError(null);
                  setCourseName('');
                  setSelectedFile(null);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

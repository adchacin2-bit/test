'use client';

import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { CourseDetail } from '@/components/CourseDetail';
import { StudySession } from '@/components/StudySession';
import { ResultsScreen } from '@/components/ResultsScreen';
import type { Course, UserProgress, StudySettings, QuestionAttempt, Achievement } from '@/types';
import {
  loadCourses,
  loadUserProgress,
  loadSettings,
  loadDarkMode,
  saveDarkMode,
  updateCourse,
  updateUserProgress,
  updateStreak,
  addStudyTime,
  incrementQuestionCount,
  updateTopicMastery,
} from '@/lib/storage';
import { initializeAchievements, checkAchievements } from '@/lib/achievements';

type Screen = 'welcome' | 'dashboard' | 'courseDetail' | 'studySession' | 'results';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    streak: 0,
    totalHours: 0,
    topicsMastered: 0,
    lastStudyDate: null,
    totalQuestionsAllTime: 0,
  });
  const [settings, setSettings] = useState<StudySettings>({
    questionsPerSession: 10,
    difficulty: 'adaptive',
    showTimer: true,
    enableScratchPad: true,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [sessionAttempts, setSessionAttempts] = useState<QuestionAttempt[]>([]);
  const [sessionTimeSpent, setSessionTimeSpent] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data from localStorage
  useEffect(() => {
    const loadedCourses = loadCourses();
    const loadedProgress = loadUserProgress();
    const loadedSettings = loadSettings();
    const loadedDarkMode = loadDarkMode();

    setCourses(loadedCourses);
    setUserProgress(loadedProgress);
    setSettings(loadedSettings);
    setDarkMode(loadedDarkMode);

    // Initialize achievements
    initializeAchievements();

    // Show dashboard if user has courses, otherwise show welcome
    if (loadedCourses.length > 0) {
      setCurrentScreen('dashboard');
    }

    setIsInitialized(true);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleGetStarted = () => {
    setCurrentScreen('dashboard');
  };

  const handleSelectCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentScreen('courseDetail');
  };

  const handleBackToDashboard = () => {
    setSelectedCourseId(null);
    setSelectedTopicId(null);
    setCurrentScreen('dashboard');
  };

  const handleBackToCourseDetail = () => {
    setSelectedTopicId(null);
    setCurrentScreen('courseDetail');
  };

  const handleStartStudy = (topicId: number) => {
    setSelectedTopicId(topicId);
    setCurrentScreen('studySession');
  };

  const handleSessionComplete = (attempts: QuestionAttempt[], timeSpent: number) => {
    setSessionAttempts(attempts);
    setSessionTimeSpent(timeSpent);

    // Update topic statistics
    if (selectedCourseId !== null && selectedTopicId !== null) {
      const course = courses.find((c) => c.id === selectedCourseId);
      if (course) {
        const topicIndex = course.topics.findIndex((t) => t.id === selectedTopicId);
        if (topicIndex !== -1) {
          const topic = course.topics[topicIndex];
          const correctCount = attempts.filter((a) => a.isCorrect).length;

          // Update topic stats
          const updatedTopic = {
            ...topic,
            questionsAttempted: topic.questionsAttempted + attempts.length,
            correctAnswers: topic.correctAnswers + correctCount,
            lastPracticed: new Date().toISOString(),
          };

          // Calculate new mastery (weighted average, more recent performance weighted higher)
          const oldWeight = 0.7;
          const newWeight = 0.3;
          const oldMastery = topic.mastery;
          const newMastery = (correctCount / attempts.length) * 100;
          updatedTopic.mastery = Math.round(oldMastery * oldWeight + newMastery * newWeight);

          // Update course
          const updatedTopics = [...course.topics];
          updatedTopics[topicIndex] = updatedTopic;
          const updatedCourse = { ...course, topics: updatedTopics, lastAccessed: new Date().toISOString() };

          updateCourse(course.id, updatedCourse);
          const updatedCourses = courses.map((c) => (c.id === course.id ? updatedCourse : c));
          setCourses(updatedCourses);
        }
      }
    }

    // Update user progress
    const streak = updateStreak();
    addStudyTime(timeSpent);

    attempts.forEach(() => {
      incrementQuestionCount();
    });

    const updatedMastery = updateTopicMastery();
    const updatedProgress = {
      ...userProgress,
      streak: streak.streak,
      totalHours: streak.totalHours,
      topicsMastered: updatedMastery.topicsMastered,
      lastStudyDate: streak.lastStudyDate,
      totalQuestionsAllTime: streak.totalQuestionsAllTime,
    };
    setUserProgress(updatedProgress);

    // Check for achievements
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const unlocked = checkAchievements(updatedProgress, correctCount, attempts.length);
    setNewAchievements(unlocked);

    // Show results
    setCurrentScreen('results');
  };

  const handlePracticeAgain = () => {
    setSessionAttempts([]);
    setSessionTimeSpent(0);
    setNewAchievements([]);
    setCurrentScreen('studySession');
  };

  const handleCoursesUpdate = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveDarkMode(newDarkMode);
  };

  // Don't render until initialized to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  const selectedCourse = selectedCourseId !== null ? courses.find((c) => c.id === selectedCourseId) : null;

  return (
    <>
      {currentScreen === 'welcome' && <WelcomeScreen onGetStarted={handleGetStarted} />}

      {currentScreen === 'dashboard' && (
        <Dashboard
          courses={courses}
          userProgress={userProgress}
          darkMode={darkMode}
          onSelectCourse={handleSelectCourse}
          onCoursesUpdate={handleCoursesUpdate}
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}

      {currentScreen === 'courseDetail' && selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          settings={settings}
          onBack={handleBackToDashboard}
          onStartStudy={handleStartStudy}
        />
      )}

      {currentScreen === 'studySession' && selectedCourse && selectedTopicId !== null && (
        <StudySession
          course={selectedCourse}
          topicId={selectedTopicId}
          settings={settings}
          onBack={handleBackToCourseDetail}
          onSessionComplete={handleSessionComplete}
        />
      )}

      {currentScreen === 'results' && selectedCourse && selectedTopicId !== null && (
        <ResultsScreen
          courseName={selectedCourse.name}
          topicName={selectedCourse.topics.find((t) => t.id === selectedTopicId)?.name || ''}
          attempts={sessionAttempts}
          timeSpent={sessionTimeSpent}
          newAchievements={newAchievements}
          onBackToDashboard={handleBackToDashboard}
          onPracticeAgain={handlePracticeAgain}
        />
      )}
    </>
  );
}

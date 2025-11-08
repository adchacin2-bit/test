'use client';

import React from 'react';
import { Trophy, Clock, Target, TrendingUp, Award, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import type { QuestionAttempt, Achievement } from '@/types';

interface ResultsScreenProps {
  courseName: string;
  topicName: string;
  attempts: QuestionAttempt[];
  timeSpent: number;
  newAchievements: Achievement[];
  onBackToDashboard: () => void;
  onPracticeAgain: () => void;
}

export function ResultsScreen({
  courseName,
  topicName,
  attempts,
  timeSpent,
  newAchievements,
  onBackToDashboard,
  onPracticeAgain,
}: ResultsScreenProps) {
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const totalCount = attempts.length;
  const percentage = Math.round((correctCount / totalCount) * 100);
  const avgTimePerQuestion = Math.round(timeSpent / totalCount);

  const getPerformanceMessage = () => {
    if (percentage === 100) return "Perfect! You're crushing it! 🎉";
    if (percentage >= 80) return 'Excellent work! Keep it up! 🌟';
    if (percentage >= 60) return 'Good job! You\'re making progress! 💪';
    if (percentage >= 40) return 'Nice effort! Keep practicing! 📚';
    return 'Keep going! Every question is a learning opportunity! 🌱';
  };

  const getPerformanceColor = () => {
    if (percentage >= 80) return 'from-green-600 to-lime-600';
    if (percentage >= 60) return 'from-lime-600 to-yellow-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {percentage === 100 ? '🏆' : percentage >= 80 ? '🌟' : percentage >= 60 ? '💪' : '📚'}
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Session Complete!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Score Card */}
        <Card className="p-8 mb-6 text-center">
          <div className={`text-7xl font-bold bg-gradient-to-r ${getPerformanceColor()} bg-clip-text text-transparent mb-4`}>
            {percentage}%
          </div>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-2">
            {correctCount} out of {totalCount} correct
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {courseName} • {topicName}
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{percentage}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatTime(timeSpent)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgTimePerQuestion}s</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Breakdown */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Question Breakdown</h2>
          <div className="space-y-3">
            {attempts.map((attempt, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${
                  attempt.isCorrect
                    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                    : 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{attempt.isCorrect ? '✅' : '❌'}</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        Question {index + 1}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {attempt.question.concept} • {attempt.question.difficulty}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{attempt.timeSpent}s</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        {newAchievements.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">New Achievements Unlocked!</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-yellow-200 dark:border-yellow-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{achievement.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{achievement.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={onBackToDashboard} variant="secondary" className="flex-1">
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={onPracticeAgain} className="flex-1">
            <Trophy className="w-5 h-5 mr-2" />
            Practice Again
          </Button>
        </div>

        {/* Encouragement */}
        <Card className="p-6 mt-6 text-center bg-gradient-to-r from-lime-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
          <p className="text-gray-700 dark:text-gray-300 italic">
            "Success is the sum of small efforts, repeated day in and day out."
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">— Robert Collier</p>
        </Card>
      </div>
    </div>
  );
}

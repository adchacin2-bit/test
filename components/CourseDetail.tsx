'use client';

import React, { useState } from 'react';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import type { Course, StudySettings } from '@/types';

interface CourseDetailProps {
  course: Course;
  settings: StudySettings;
  onBack: () => void;
  onStartStudy: (topicId: number) => void;
}

export function CourseDetail({ course, settings, onBack, onStartStudy }: CourseDetailProps) {
  const avgMastery = course.topics.reduce((sum, topic) => sum + topic.mastery, 0) / course.topics.length || 0;
  const totalQuestions = course.topics.reduce((sum, topic) => sum + topic.questionsAttempted, 0);

  const sortedTopics = [...course.topics].sort((a, b) => {
    // Sort by mastery (ascending) - practice weakest topics first
    if (a.mastery !== b.mastery) return a.mastery - b.mastery;
    // Then by questions attempted (ascending) - practice least practiced first
    return a.questionsAttempted - b.questionsAttempted;
  });

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-600 dark:text-green-400';
    if (mastery >= 60) return 'text-lime-600 dark:text-lime-400';
    if (mastery >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 80) return '🏆 Mastered';
    if (mastery >= 60) return '✅ Good';
    if (mastery >= 40) return '📚 Learning';
    return '🌱 New';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{course.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">
                {course.topics.length} topics • {totalQuestions} questions attempted
              </p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Overall Progress</h2>
          <ProgressBar value={avgMastery} label="Average Mastery" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{course.topics.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Topics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {course.topics.filter((t) => t.mastery >= 80).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mastered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                {course.topics.filter((t) => t.mastery >= 60 && t.mastery < 80).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {course.topics.filter((t) => t.mastery < 60).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need Practice</p>
            </div>
          </div>
        </Card>

        {/* Study Settings Info */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-lime-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Study Settings</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Questions per session</p>
              <p className="font-semibold text-gray-800 dark:text-white">{settings.questionsPerSession}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Difficulty</p>
              <p className="font-semibold text-gray-800 dark:text-white capitalize">{settings.difficulty}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Timer</p>
              <p className="font-semibold text-gray-800 dark:text-white">{settings.showTimer ? 'On' : 'Off'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Scratch Pad</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {settings.enableScratchPad ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </Card>

        {/* Topics */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Select a Topic to Practice</h2>
        <div className="grid grid-cols-1 gap-4">
          {sortedTopics.map((topic) => (
            <Card
              key={topic.id}
              hoverable
              onClick={() => onStartStudy(topic.id)}
              className="p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{topic.name}</h3>
                    <span className={`text-sm font-semibold ${getMasteryColor(topic.mastery)}`}>
                      {getMasteryLabel(topic.mastery)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>{topic.questionsAttempted} questions attempted</span>
                    {topic.questionsAttempted > 0 && (
                      <span>
                        {topic.correctAnswers} correct ({Math.round((topic.correctAnswers / topic.questionsAttempted) * 100)}%)
                      </span>
                    )}
                    {topic.lastPracticed && (
                      <span>Last practiced {new Date(topic.lastPracticed).toLocaleDateString()}</span>
                    )}
                  </div>

                  <ProgressBar value={topic.mastery} showPercentage={false} />
                </div>

                <Button size="sm" className="ml-6">
                  <Play className="w-4 h-4 mr-2" />
                  Practice
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

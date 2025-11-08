'use client';

import React from 'react';
import { BookOpen, Brain, TrendingUp, Target, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Generated Questions',
      description: 'Unlimited MCAT-style questions powered by Claude AI',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Adaptive Difficulty',
      description: 'Questions adjust based on your performance',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Progress Tracking',
      description: 'Monitor mastery levels and study streaks',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'PDF Upload',
      description: 'Upload your notes and generate custom questions',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Detailed Explanations',
      description: 'Learn from every answer with AI-powered insights',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Tablet Optimized',
      description: 'Perfect for Samsung tablets with S Pen support',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
              LimeGuide
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-lime-600 rounded-full"></div>
              <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">🍋</span>
              <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-lime-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Your AI-powered study companion for mastering biochemistry, physics, and acing the MCAT
          </p>
          <Button onClick={onGetStarted} size="lg" className="text-xl px-12 py-5">
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:scale-105 transition-transform duration-200">
              <div className="text-primary dark:text-lime-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">Upload PDFs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload your course notes or textbooks
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">AI Analyzes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Claude AI extracts key topics and concepts
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">Practice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Answer unlimited MCAT-style questions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                4
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">Master</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track progress and achieve mastery
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Powered by Anthropic Claude AI • Designed for pre-med excellence
          </p>
        </div>
      </div>
    </div>
  );
}

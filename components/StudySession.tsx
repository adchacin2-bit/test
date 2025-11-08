'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loading } from './ui/Loading';
import { ScratchPad } from './ScratchPad';
import type { Course, Question, QuestionAttempt, StudySettings } from '@/types';
import { generateQuestion, generateExplanation } from '@/lib/api';

interface StudySessionProps {
  course: Course;
  topicId: number;
  settings: StudySettings;
  onBack: () => void;
  onSessionComplete: (attempts: QuestionAttempt[], timeSpent: number) => void;
}

export function StudySession({ course, topicId, settings, onBack, onSessionComplete }: StudySessionProps) {
  const topic = course.topics.find((t) => t.id === topicId);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    if (!settings.showTimer) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, settings.showTimer]);

  // Load first question
  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    if (!topic) return;

    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuestionStartTime(Date.now());

    try {
      const question = await generateQuestion(
        topic.name,
        course.name,
        attempts,
        settings.difficulty === 'adaptive' ? undefined : settings.difficulty
      );
      setCurrentQuestion(question);
    } catch (err: any) {
      setError(err.message || 'Failed to generate question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setIsLoading(true);

    try {
      // Generate explanation
      const explanation = await generateExplanation(
        currentQuestion,
        answerIndex,
        currentQuestion.correctIndex,
        topic?.name || '',
        course.name
      );

      // Update question with explanation
      setCurrentQuestion({ ...currentQuestion, explanation });

      // Record attempt
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const attempt: QuestionAttempt = {
        question: currentQuestion,
        userAnswerIndex: answerIndex,
        isCorrect: answerIndex === currentQuestion.correctIndex,
        timeSpent,
        timestamp: new Date().toISOString(),
      };

      setAttempts([...attempts, attempt]);
      setShowExplanation(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate explanation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (questionNumber >= settings.questionsPerSession) {
      // Session complete
      const totalTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      onSessionComplete(attempts, totalTime);
    } else {
      setQuestionNumber(questionNumber + 1);
      loadNextQuestion();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600 dark:text-gray-300">Topic not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit Session
          </button>

          <div className="flex items-center gap-6">
            {settings.showTimer && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
            )}
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Question {questionNumber} / {settings.questionsPerSession}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-600 to-lime-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / settings.questionsPerSession) * 100}%` }}
            />
          </div>
        </div>

        {/* Topic */}
        <Card className="p-4 mb-6 bg-lime-50 dark:bg-gray-800 border-lime-200 dark:border-lime-700">
          <p className="text-center">
            <span className="text-gray-600 dark:text-gray-400">Topic: </span>
            <span className="font-bold text-gray-800 dark:text-white">{topic.name}</span>
          </p>
        </Card>

        {/* Question */}
        {isLoading && !currentQuestion ? (
          <Loading message="Generating your next question..." size="lg" />
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <X className="w-16 h-16 mx-auto mb-2" />
              <p className="text-xl font-semibold">Error</p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Button onClick={loadNextQuestion}>Try Again</Button>
          </Card>
        ) : currentQuestion ? (
          <>
            <Card className="p-8 mb-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-sm font-semibold">
                    {currentQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-semibold">
                    {currentQuestion.concept}
                  </span>
                </div>
                <p className="text-lg text-gray-800 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showResult = selectedAnswer !== null;

                  let bgClass = 'bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700';
                  let borderClass = 'border-gray-300 dark:border-gray-600';

                  if (showResult) {
                    if (isCorrect) {
                      bgClass = 'bg-green-100 dark:bg-green-900';
                      borderClass = 'border-green-500 dark:border-green-400';
                    } else if (isSelected) {
                      bgClass = 'bg-red-100 dark:bg-red-900';
                      borderClass = 'border-red-500 dark:border-red-400';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all ${bgClass} ${borderClass} ${
                        selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'
                      } disabled:opacity-100`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[24px]">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-gray-800 dark:text-white flex-1">{option}</span>
                        {showResult && isCorrect && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <Card className={`p-6 mb-6 ${currentQuestion.explanation.isCorrect ? 'bg-green-50 dark:bg-green-900' : 'bg-orange-50 dark:bg-orange-900'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {currentQuestion.explanation.isCorrect ? (
                    <>
                      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">Correct!</h3>
                    </>
                  ) : (
                    <>
                      <X className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">Not quite</h3>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Correct Answer:</p>
                    <p className="text-gray-800 dark:text-white">{currentQuestion.explanation.correctAnswer}</p>
                  </div>

                  {!currentQuestion.explanation.isCorrect && (
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Answer:</p>
                      <p className="text-gray-800 dark:text-white">{currentQuestion.explanation.yourAnswer}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Key Insight:</p>
                    <p className="text-gray-800 dark:text-white leading-relaxed">{currentQuestion.explanation.keyInsight}</p>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Next Steps:</p>
                    <p className="text-gray-800 dark:text-white leading-relaxed">{currentQuestion.explanation.nextSteps}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={handleNext} className="w-full" size="lg">
                    {questionNumber >= settings.questionsPerSession ? 'Finish Session' : 'Next Question'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Scratch Pad */}
            {settings.enableScratchPad && !showExplanation && (
              <ScratchPad className="mt-6" />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

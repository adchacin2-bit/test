// Core data types for LimeGuide

export interface Topic {
  id: number;
  name: string;
  mastery: number; // 0-100 percentage
  questionsAttempted: number;
  correctAnswers: number;
  lastPracticed: string | null;
}

export interface Course {
  id: number;
  name: string;
  topics: Topic[];
  addedDate: string;
  lastAccessed: string;
  pdfName?: string;
}

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  concept: string;
  topicId?: number;
  topicName?: string;
  explanation?: Explanation;
}

export interface Explanation {
  isCorrect: boolean;
  correctAnswer: string;
  yourAnswer: string;
  keyInsight: string;
  nextSteps: string;
}

export interface UserProgress {
  streak: number;
  totalHours: number;
  topicsMastered: number;
  lastStudyDate: string | null;
  totalQuestionsAllTime: number;
}

export interface StudySession {
  courseId: number;
  courseName: string;
  topicId: number;
  topicName: string;
  questions: QuestionAttempt[];
  startTime: string;
  endTime?: string;
  totalTime?: number; // in seconds
}

export interface QuestionAttempt {
  question: Question;
  userAnswerIndex: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface StudySettings {
  questionsPerSession: number;
  difficulty: 'adaptive' | 'easy' | 'medium' | 'hard';
  showTimer: boolean;
  enableScratchPad: boolean;
}

export interface AppState {
  currentScreen: 'welcome' | 'dashboard' | 'courseDetail' | 'studySession' | 'results';
  courses: Course[];
  userProgress: UserProgress;
  currentSession: StudySession | null;
  settings: StudySettings;
  darkMode: boolean;
  achievements: Achievement[];
}

// API Request/Response types
export interface ProcessPDFRequest {
  courseName: string;
  pdfData: string; // base64 encoded
}

export interface ProcessPDFResponse {
  topics: { id: number; name: string }[];
  error?: string;
  details?: string;
}

export interface GenerateQuestionRequest {
  topicName: string;
  courseName: string;
  previousAnswers?: QuestionAttempt[];
  difficulty?: string;
}

export interface GenerateQuestionResponse extends Question {
  error?: string;
  details?: string;
}

export interface GenerateExplanationRequest {
  question: Question;
  userAnswerIndex: number;
  correctIndex: number;
  topicName: string;
  courseName: string;
}

export interface GenerateExplanationResponse extends Explanation {
  error?: string;
  details?: string;
}

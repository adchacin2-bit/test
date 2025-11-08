import type {
  Course,
  UserProgress,
  StudySession,
  Achievement,
  StudySettings,
} from '@/types';

const STORAGE_KEYS = {
  COURSES: 'limeguide_courses',
  USER_PROGRESS: 'limeguide_user_progress',
  ACHIEVEMENTS: 'limeguide_achievements',
  SETTINGS: 'limeguide_settings',
  DARK_MODE: 'limeguide_dark_mode',
};

// ===== COURSES =====

export function saveCourses(courses: Course[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function loadCourses(): Course[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  return data ? JSON.parse(data) : [];
}

export function addCourse(course: Course): Course[] {
  const courses = loadCourses();
  courses.push(course);
  saveCourses(courses);
  return courses;
}

export function updateCourse(courseId: number, updates: Partial<Course>): Course[] {
  const courses = loadCourses();
  const index = courses.findIndex((c) => c.id === courseId);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates };
    saveCourses(courses);
  }
  return courses;
}

export function deleteCourse(courseId: number): Course[] {
  const courses = loadCourses();
  const filtered = courses.filter((c) => c.id !== courseId);
  saveCourses(filtered);
  return filtered;
}

export function getCourse(courseId: number): Course | undefined {
  const courses = loadCourses();
  return courses.find((c) => c.id === courseId);
}

// ===== USER PROGRESS =====

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
}

export function loadUserProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return {
      streak: 0,
      totalHours: 0,
      topicsMastered: 0,
      lastStudyDate: null,
      totalQuestionsAllTime: 0,
    };
  }
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  return data
    ? JSON.parse(data)
    : {
        streak: 0,
        totalHours: 0,
        topicsMastered: 0,
        lastStudyDate: null,
        totalQuestionsAllTime: 0,
      };
}

export function updateUserProgress(updates: Partial<UserProgress>): UserProgress {
  const progress = loadUserProgress();
  const updated = { ...progress, ...updates };
  saveUserProgress(updated);
  return updated;
}

export function incrementQuestionCount(): UserProgress {
  const progress = loadUserProgress();
  progress.totalQuestionsAllTime += 1;
  saveUserProgress(progress);
  return progress;
}

export function updateStreak(): UserProgress {
  const progress = loadUserProgress();
  const today = new Date().toISOString().split('T')[0];

  if (!progress.lastStudyDate) {
    // First study session
    progress.streak = 1;
    progress.lastStudyDate = today;
  } else {
    const lastDate = new Date(progress.lastStudyDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      progress.streak += 1;
      progress.lastStudyDate = today;
    } else {
      // Streak broken, reset
      progress.streak = 1;
      progress.lastStudyDate = today;
    }
  }

  saveUserProgress(progress);
  return progress;
}

export function addStudyTime(seconds: number): UserProgress {
  const progress = loadUserProgress();
  progress.totalHours += seconds / 3600;
  saveUserProgress(progress);
  return progress;
}

export function updateTopicMastery(): UserProgress {
  const progress = loadUserProgress();
  const courses = loadCourses();

  let masteredCount = 0;
  courses.forEach((course) => {
    course.topics.forEach((topic) => {
      if (topic.mastery >= 80) {
        masteredCount += 1;
      }
    });
  });

  progress.topicsMastered = masteredCount;
  saveUserProgress(progress);
  return progress;
}

// ===== ACHIEVEMENTS =====

export function saveAchievements(achievements: Achievement[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
}

export function loadAchievements(): Achievement[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  return data ? JSON.parse(data) : [];
}

export function unlockAchievement(achievementId: string): Achievement[] {
  const achievements = loadAchievements();
  const index = achievements.findIndex((a) => a.id === achievementId);
  if (index !== -1 && !achievements[index].unlocked) {
    achievements[index].unlocked = true;
    achievements[index].unlockedDate = new Date().toISOString();
    saveAchievements(achievements);
  }
  return achievements;
}

// ===== SETTINGS =====

export function saveSettings(settings: StudySettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadSettings(): StudySettings {
  if (typeof window === 'undefined') {
    return {
      questionsPerSession: 10,
      difficulty: 'adaptive',
      showTimer: true,
      enableScratchPad: true,
    };
  }
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data
    ? JSON.parse(data)
    : {
        questionsPerSession: 10,
        difficulty: 'adaptive',
        showTimer: true,
        enableScratchPad: true,
      };
}

export function updateSettings(updates: Partial<StudySettings>): StudySettings {
  const settings = loadSettings();
  const updated = { ...settings, ...updates };
  saveSettings(updated);
  return updated;
}

// ===== DARK MODE =====

export function saveDarkMode(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
}

export function loadDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const data = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  return data ? JSON.parse(data) : false;
}

// ===== EXPORT/IMPORT =====

export function exportAllData(): string {
  const data = {
    courses: loadCourses(),
    userProgress: loadUserProgress(),
    achievements: loadAchievements(),
    settings: loadSettings(),
    darkMode: loadDarkMode(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.courses) saveCourses(data.courses);
    if (data.userProgress) saveUserProgress(data.userProgress);
    if (data.achievements) saveAchievements(data.achievements);
    if (data.settings) saveSettings(data.settings);
    if (data.darkMode !== undefined) saveDarkMode(data.darkMode);

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

// ===== CLEAR DATA =====

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

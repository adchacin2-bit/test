import type { Achievement, UserProgress } from '@/types';
import { loadAchievements, saveAchievements, unlockAchievement } from './storage';

// Define all available achievements
export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: '🌱 First Steps',
    description: 'Answer your first question',
    icon: '🌱',
    unlocked: false,
  },
  {
    id: 'getting_started',
    title: '🔰 Getting Started',
    description: 'Answer 10 questions',
    icon: '🔰',
    unlocked: false,
  },
  {
    id: 'half_century',
    title: '💯 Half Century',
    description: 'Answer 50 questions total',
    icon: '💯',
    unlocked: false,
  },
  {
    id: 'centurion',
    title: '🏆 Centurion',
    description: 'Answer 100 questions total',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'question_master',
    title: '⭐ Question Master',
    description: 'Answer 500 questions total',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'streak_3',
    title: '🔥 Getting Consistent',
    description: 'Study for 3 days in a row',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'week_warrior',
    title: '🔥 Week Warrior',
    description: 'Study for 7 days in a row',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'streak_30',
    title: '🔥 Unstoppable',
    description: 'Study for 30 days in a row',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'ten_hours',
    title: '⏰ Ten Hours In',
    description: 'Study for 10 hours total',
    icon: '⏰',
    unlocked: false,
  },
  {
    id: 'fifty_hours',
    title: '⏰ Dedicated Student',
    description: 'Study for 50 hours total',
    icon: '⏰',
    unlocked: false,
  },
  {
    id: 'hundred_hours',
    title: '⏰ MCAT Ready',
    description: 'Study for 100 hours total',
    icon: '⏰',
    unlocked: false,
  },
  {
    id: 'multi_talented',
    title: '🎯 Multi-Talented',
    description: 'Master 5 topics (>80% accuracy)',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'topic_expert',
    title: '🎯 Topic Expert',
    description: 'Master 10 topics (>80% accuracy)',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'knowledge_guru',
    title: '🎯 Knowledge Guru',
    description: 'Master 25 topics (>80% accuracy)',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'perfect_session',
    title: '✨ Perfect Session',
    description: 'Answer all questions correctly in a session',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'night_owl',
    title: '🦉 Night Owl',
    description: 'Study after midnight',
    icon: '🦉',
    unlocked: false,
  },
  {
    id: 'early_bird',
    title: '🌅 Early Bird',
    description: 'Study before 6 AM',
    icon: '🌅',
    unlocked: false,
  },
];

/**
 * Initialize achievements in localStorage if not already present
 */
export function initializeAchievements(): Achievement[] {
  let achievements = loadAchievements();

  if (achievements.length === 0) {
    achievements = [...ALL_ACHIEVEMENTS];
    saveAchievements(achievements);
  } else {
    // Merge with new achievements if any were added
    const existingIds = new Set(achievements.map((a) => a.id));
    const newAchievements = ALL_ACHIEVEMENTS.filter((a) => !existingIds.has(a.id));

    if (newAchievements.length > 0) {
      achievements = [...achievements, ...newAchievements];
      saveAchievements(achievements);
    }
  }

  return achievements;
}

/**
 * Check and unlock achievements based on current progress
 * Returns newly unlocked achievements
 */
export function checkAchievements(
  progress: UserProgress,
  sessionQuestionsCorrect?: number,
  sessionQuestionsTotal?: number
): Achievement[] {
  const achievements = loadAchievements();
  const newlyUnlocked: Achievement[] = [];

  // Question count achievements
  if (progress.totalQuestionsAllTime >= 1 && !isUnlocked('first_steps', achievements)) {
    unlockAchievement('first_steps');
    newlyUnlocked.push(findAchievement('first_steps', achievements)!);
  }
  if (progress.totalQuestionsAllTime >= 10 && !isUnlocked('getting_started', achievements)) {
    unlockAchievement('getting_started');
    newlyUnlocked.push(findAchievement('getting_started', achievements)!);
  }
  if (progress.totalQuestionsAllTime >= 50 && !isUnlocked('half_century', achievements)) {
    unlockAchievement('half_century');
    newlyUnlocked.push(findAchievement('half_century', achievements)!);
  }
  if (progress.totalQuestionsAllTime >= 100 && !isUnlocked('centurion', achievements)) {
    unlockAchievement('centurion');
    newlyUnlocked.push(findAchievement('centurion', achievements)!);
  }
  if (progress.totalQuestionsAllTime >= 500 && !isUnlocked('question_master', achievements)) {
    unlockAchievement('question_master');
    newlyUnlocked.push(findAchievement('question_master', achievements)!);
  }

  // Streak achievements
  if (progress.streak >= 3 && !isUnlocked('streak_3', achievements)) {
    unlockAchievement('streak_3');
    newlyUnlocked.push(findAchievement('streak_3', achievements)!);
  }
  if (progress.streak >= 7 && !isUnlocked('week_warrior', achievements)) {
    unlockAchievement('week_warrior');
    newlyUnlocked.push(findAchievement('week_warrior', achievements)!);
  }
  if (progress.streak >= 30 && !isUnlocked('streak_30', achievements)) {
    unlockAchievement('streak_30');
    newlyUnlocked.push(findAchievement('streak_30', achievements)!);
  }

  // Study time achievements
  if (progress.totalHours >= 10 && !isUnlocked('ten_hours', achievements)) {
    unlockAchievement('ten_hours');
    newlyUnlocked.push(findAchievement('ten_hours', achievements)!);
  }
  if (progress.totalHours >= 50 && !isUnlocked('fifty_hours', achievements)) {
    unlockAchievement('fifty_hours');
    newlyUnlocked.push(findAchievement('fifty_hours', achievements)!);
  }
  if (progress.totalHours >= 100 && !isUnlocked('hundred_hours', achievements)) {
    unlockAchievement('hundred_hours');
    newlyUnlocked.push(findAchievement('hundred_hours', achievements)!);
  }

  // Topic mastery achievements
  if (progress.topicsMastered >= 5 && !isUnlocked('multi_talented', achievements)) {
    unlockAchievement('multi_talented');
    newlyUnlocked.push(findAchievement('multi_talented', achievements)!);
  }
  if (progress.topicsMastered >= 10 && !isUnlocked('topic_expert', achievements)) {
    unlockAchievement('topic_expert');
    newlyUnlocked.push(findAchievement('topic_expert', achievements)!);
  }
  if (progress.topicsMastered >= 25 && !isUnlocked('knowledge_guru', achievements)) {
    unlockAchievement('knowledge_guru');
    newlyUnlocked.push(findAchievement('knowledge_guru', achievements)!);
  }

  // Perfect session achievement
  if (
    sessionQuestionsCorrect !== undefined &&
    sessionQuestionsTotal !== undefined &&
    sessionQuestionsTotal > 0 &&
    sessionQuestionsCorrect === sessionQuestionsTotal &&
    !isUnlocked('perfect_session', achievements)
  ) {
    unlockAchievement('perfect_session');
    newlyUnlocked.push(findAchievement('perfect_session', achievements)!);
  }

  // Time-based achievements
  const currentHour = new Date().getHours();
  if (currentHour >= 0 && currentHour < 6 && !isUnlocked('night_owl', achievements)) {
    unlockAchievement('night_owl');
    newlyUnlocked.push(findAchievement('night_owl', achievements)!);
  }
  if (currentHour >= 4 && currentHour < 6 && !isUnlocked('early_bird', achievements)) {
    unlockAchievement('early_bird');
    newlyUnlocked.push(findAchievement('early_bird', achievements)!);
  }

  return newlyUnlocked;
}

/**
 * Helper function to check if an achievement is unlocked
 */
function isUnlocked(achievementId: string, achievements: Achievement[]): boolean {
  const achievement = achievements.find((a) => a.id === achievementId);
  return achievement?.unlocked || false;
}

/**
 * Helper function to find an achievement by ID
 */
function findAchievement(achievementId: string, achievements: Achievement[]): Achievement | undefined {
  return achievements.find((a) => a.id === achievementId);
}

/**
 * Get progress percentage for achievements
 */
export function getAchievementProgress(): number {
  const achievements = loadAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return Math.round((unlockedCount / achievements.length) * 100);
}

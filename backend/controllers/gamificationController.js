import { validationResult } from 'express-validator';
import Gamification from '../models/Gamification.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_LESSON: {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    target: 1,
    reward: { points: 50, badge: 'starter' }
  },
  LESSON_STREAK_7: {
    id: 'lesson_streak_7',
    name: 'Week Warrior',
    description: 'Complete lessons for 7 days in a row',
    target: 7,
    reward: { points: 200, badge: 'consistent' }
  },
  LESSON_STREAK_30: {
    id: 'lesson_streak_30',
    name: 'Monthly Master',
    description: 'Complete lessons for 30 days in a row',
    target: 30,
    reward: { points: 1000, badge: 'dedicated' }
  },
  VOCABULARY_MASTER: {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    description: 'Learn 100 new vocabulary words',
    target: 100,
    reward: { points: 300, badge: 'wordsmith' }
  },
  GRAMMAR_GURU: {
    id: 'grammar_guru',
    name: 'Grammar Guru',
    description: 'Complete 50 grammar exercises',
    target: 50,
    reward: { points: 250, badge: 'grammarian' }
  },
  PERFECT_PRONUNCIATION: {
    id: 'perfect_pronunciation',
    name: 'Perfect Pronunciation',
    description: 'Get 90%+ score on 20 pronunciation exercises',
    target: 20,
    reward: { points: 400, badge: 'speaker' }
  },
  SPEED_LEARNER: {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Complete 10 lessons in one day',
    target: 10,
    reward: { points: 500, badge: 'rapid' }
  },
  CULTURE_EXPLORER: {
    id: 'culture_explorer',
    name: 'Culture Explorer',
    description: 'Complete all cultural lessons',
    target: 15,
    reward: { points: 350, badge: 'explorer' }
  }
};

// Badge definitions
const BADGES = {
  starter: { name: 'Starter', icon: '🌱', rarity: 'common', description: 'Welcome to your learning journey!' },
  consistent: { name: 'Consistent Learner', icon: '📅', rarity: 'rare', description: 'Keeps learning every day!' },
  dedicated: { name: 'Dedicated Student', icon: '🎯', rarity: 'epic', description: 'Unwavering commitment to learning!' },
  wordsmith: { name: 'Wordsmith', icon: '📚', rarity: 'rare', description: 'Master of vocabulary!' },
  grammarian: { name: 'Grammar Expert', icon: '✏️', rarity: 'rare', description: 'Grammar rules are no match!' },
  speaker: { name: 'Pronunciation Pro', icon: '🗣️', rarity: 'epic', description: 'Speaks like a native!' },
  rapid: { name: 'Speed Demon', icon: '⚡', rarity: 'legendary', description: 'Lightning-fast learner!' },
  explorer: { name: 'Cultural Explorer', icon: '🌍', rarity: 'epic', description: 'Embraces different cultures!' }
};

// Point values for different activities
const POINT_VALUES = {
  LESSON_COMPLETE: 20,
  QUIZ_PERFECT: 50,
  QUIZ_GOOD: 30,
  QUIZ_PASS: 15,
  DAILY_GOAL: 25,
  WEEKLY_GOAL: 100,
  VOCABULARY_LEARNED: 5,
  GRAMMAR_EXERCISE: 10,
  PRONUNCIATION_EXERCISE: 15,
  LIVE_CLASS_ATTEND: 40,
  HOMEWORK_COMPLETE: 30
};

// Get user's gamification data
export const getUserGamification = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Check permissions
    if (userId !== requestingUserId && req.user.role !== 'admin' && req.user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get or create gamification data
    let gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      gamification = await Gamification.create({
        userId,
        totalPoints: 0,
        level: 1,
        experience: 0,
        currentStreak: 0
      });
    }

    // Calculate additional stats
    const stats = {
      nextLevelProgress: Math.round((gamification.experience / gamification.experienceToNextLevel) * 100),
      pointsToNextLevel: gamification.experienceToNextLevel - gamification.experience,
      badgeCount: gamification.badges.length,
      achievementCount: gamification.achievements.filter(a => a.isCompleted).length,
      totalAchievements: gamification.achievements.length
    };

    res.json({
      success: true,
      data: {
        gamification,
        stats
      }
    });

  } catch (error) {
    console.error('Get user gamification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Award points to user
export const updatePoints = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { points, source, multiplier = 1, reason } = req.body;

    // Check permissions (teachers and admins can award points)
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers and admins can award points.'
      });
    }

    // Get or create gamification data
    let gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      gamification = await Gamification.create({
        userId,
        totalPoints: 0,
        level: 1,
        experience: 0,
        currentStreak: 0
      });
    }

    // Calculate final points with multipliers
    const basePoints = Math.max(0, points);
    const finalPoints = Math.floor(basePoints * multiplier * gamification.multipliers.pointsMultiplier);

    // Add points and experience
    const pointsAwarded = gamification.addPoints(finalPoints, source);
    const oldLevel = gamification.level;

    await gamification.save();

    // Check for level up
    const leveledUp = gamification.level > oldLevel;
    let levelUpRewards = null;

    if (leveledUp) {
      levelUpRewards = {
        newLevel: gamification.level,
        bonusPoints: gamification.level * 50,
        newBadges: await checkLevelBadges(gamification)
      };
    }

    // Check for new achievements
    const newAchievements = await checkPointAchievements(gamification);

    res.json({
      success: true,
      message: `${pointsAwarded} points awarded successfully`,
      data: {
        pointsAwarded,
        totalPoints: gamification.totalPoints,
        availablePoints: gamification.availablePoints,
        level: gamification.level,
        experience: gamification.experience,
        leveledUp,
        levelUpRewards,
        newAchievements,
        reason
      }
    });

  } catch (error) {
    console.error('Update points error:', error);
     res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Award badge to user (route handler)
export const awardBadgeRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { badgeId, name, description, icon, category, rarity, points } = req.body;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers and admins can award badges.'
      });
    }

    // Get gamification data
    const gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      return res.status(404).json({
        success: false,
        message: 'User gamification data not found'
      });
    }

    // Award the badge
    const badgeData = {
      badgeId,
      name,
      description,
      icon,
      category: category || 'achievement',
      rarity: rarity || 'common',
      points: points || 0
    };

    const awarded = gamification.awardBadge(badgeData);

    if (!awarded) {
      return res.status(400).json({
        success: false,
        message: 'Badge already awarded to this user'
      });
    }

    await gamification.save();

    res.json({
      success: true,
      message: 'Badge awarded successfully',
      data: {
        badge: badgeData,
        totalBadges: gamification.badges.length,
        pointsAwarded: points || 0
      }
    });

  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user streak (route handler)
export const updateStreakRoute = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only the user themselves or system can update streaks
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      return res.status(404).json({
        success: false,
        message: 'User gamification data not found'
      });
    }

    // Update streak
    const newStreak = gamification.updateStreak();
    await gamification.save();

    // Check for streak achievements
    const streakAchievements = await checkStreakAchievements(gamification);

    res.json({
      success: true,
      message: 'Streak updated successfully',
      data: {
        currentStreak: newStreak,
        longestStreak: gamification.longestStreak,
        streakBonus: gamification.multipliers.streakBonus,
        newAchievements: streakAchievements
      }
    });

  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'total', limit = 10, timeframe = 'all' } = req.query;

    let leaderboard;

    switch (type) {
      case 'weekly':
        leaderboard = await Gamification.getLeaderboard('weekly', limit);
        break;
      case 'monthly':
        leaderboard = await Gamification.getLeaderboard('monthly', limit);
        break;
      case 'total':
      default:
        leaderboard = await Gamification.getLeaderboard('total', limit);
        break;
    }

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: index + 1,
      user: {
        id: entry.userId._id,
        firstName: entry.userId.firstName,
        lastName: entry.userId.lastName,
        avatar: entry.userId.avatar,
        grade: entry.userId.grade
      }
    }));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        type,
        timeframe,
        total: rankedLeaderboard.length
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user badges
export const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      return res.json({
        success: true,
        data: { badges: [] }
      });
    }

    let badges = gamification.badges;

    // Filter by category if specified
    if (category) {
      badges = badges.filter(badge => badge.category === category);
    }

    // Sort by earned date (newest first)
    badges.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

    res.json({
      success: true,
      data: {
        badges,
        badgeStats: gamification.badgeStats,
        totalBadges: gamification.badges.length
      }
    });

  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user achievements
export const getAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = 'all' } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      return res.json({
        success: true,
        data: { achievements: [] }
      });
    }

    let achievements = gamification.achievements;

    // Filter by status if specified
    if (status !== 'all') {
      const isCompleted = status === 'completed';
      achievements = achievements.filter(achievement => achievement.isCompleted === isCompleted);
    }

    // Calculate progress for incomplete achievements
    achievements = achievements.map(achievement => ({
      ...achievement.toObject(),
      progressPercentage: Math.round((achievement.progress / achievement.target) * 100)
    }));

    res.json({
      success: true,
      data: {
        achievements,
        completedCount: gamification.achievements.filter(a => a.isCompleted).length,
        totalCount: gamification.achievements.length
      }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to check level-based badges
const checkLevelBadges = async (gamification) => {
  const newBadges = [];
  const level = gamification.level;

  const levelBadges = [
    { level: 5, name: 'Rising Star', description: 'Reached level 5', icon: '⭐', category: 'level', rarity: 'common' },
    { level: 10, name: 'Dedicated Learner', description: 'Reached level 10', icon: '🌟', category: 'level', rarity: 'uncommon' },
    { level: 25, name: 'Language Explorer', description: 'Reached level 25', icon: '🗺️', category: 'level', rarity: 'rare' },
    { level: 50, name: 'Master Student', description: 'Reached level 50', icon: '🎓', category: 'level', rarity: 'epic' },
    { level: 100, name: 'Language Legend', description: 'Reached level 100', icon: '👑', category: 'level', rarity: 'legendary' }
  ];

  for (const badge of levelBadges) {
    if (level >= badge.level && !gamification.badges.find(b => b.name === badge.name)) {
      const awarded = gamification.awardBadge(badge);
      if (awarded) {
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
};

// Helper function to check point-based achievements
const checkPointAchievements = async (gamification) => {
  const newAchievements = [];
  const totalPoints = gamification.totalPoints;

  const pointAchievements = [
    { id: 'points_1000', name: 'Point Collector', description: 'Earn 1,000 points', target: 1000, icon: '💰' },
    { id: 'points_5000', name: 'Point Master', description: 'Earn 5,000 points', target: 5000, icon: '💎' },
    { id: 'points_10000', name: 'Point Legend', description: 'Earn 10,000 points', target: 10000, icon: '🏆' }
  ];

  for (const achievement of pointAchievements) {
    let userAchievement = gamification.achievements.find(a => a.achievementId === achievement.id);

    if (!userAchievement) {
      userAchievement = {
        achievementId: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        target: achievement.target,
        progress: 0,
        isCompleted: false
      };
      gamification.achievements.push(userAchievement);
    }

    if (!userAchievement.isCompleted && totalPoints >= achievement.target) {
      userAchievement.progress = achievement.target;
      userAchievement.isCompleted = true;
      userAchievement.completedAt = new Date();
      newAchievements.push(userAchievement);
    } else if (!userAchievement.isCompleted) {
      userAchievement.progress = Math.min(totalPoints, achievement.target);
    }
  }

  return newAchievements;
};

// Helper function to check streak-based achievements
const checkStreakAchievements = async (gamification) => {
  const newAchievements = [];
  const currentStreak = gamification.currentStreak;

  const streakAchievements = [
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', target: 7, icon: '🔥' },
    { id: 'streak_30', name: 'Month Master', description: 'Maintain a 30-day streak', target: 30, icon: '⚡' },
    { id: 'streak_100', name: 'Streak Legend', description: 'Maintain a 100-day streak', target: 100, icon: '🌟' }
  ];

  for (const achievement of streakAchievements) {
    let userAchievement = gamification.achievements.find(a => a.achievementId === achievement.id);

    if (!userAchievement) {
      userAchievement = {
        achievementId: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        target: achievement.target,
        progress: 0,
        isCompleted: false
      };
      gamification.achievements.push(userAchievement);
    }

    if (!userAchievement.isCompleted && currentStreak >= achievement.target) {
      userAchievement.progress = achievement.target;
      userAchievement.isCompleted = true;
      userAchievement.completedAt = new Date();
      newAchievements.push(userAchievement);
    } else if (!userAchievement.isCompleted) {
      userAchievement.progress = Math.min(currentStreak, achievement.target);
    }
  }

  return newAchievements;
};

// ============ AUTOMATIC GAMIFICATION FUNCTIONS ============

// Award points for lesson completion
export const awardLessonPoints = async (userId, lessonData) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    let pointsEarned = POINT_VALUES.LESSON_COMPLETE;
    
    // Bonus points for quiz performance
    if (lessonData.quizScore >= 90) {
      pointsEarned += POINT_VALUES.QUIZ_PERFECT;
    } else if (lessonData.quizScore >= 70) {
      pointsEarned += POINT_VALUES.QUIZ_GOOD;
    } else if (lessonData.quizScore >= 50) {
      pointsEarned += POINT_VALUES.QUIZ_PASS;
    }

    // Update points and experience
    await updateUserPoints(userId, pointsEarned, 'Lesson Completed');
    
    // Update streak
    await updateStreak(userId);
    
    // Check achievements
    await checkLessonAchievements(userId, lessonData);
    
    return { pointsEarned, message: 'Lesson completed successfully!' };
  } catch (error) {
    console.error('Award lesson points error:', error);
    throw error;
  }
};

// Award points for vocabulary learning
export const awardVocabularyPoints = async (userId, wordsLearned) => {
  try {
    const pointsEarned = wordsLearned * POINT_VALUES.VOCABULARY_LEARNED;
    await updateUserPoints(userId, pointsEarned, `Learned ${wordsLearned} vocabulary words`);
    
    // Check vocabulary achievements
    await checkVocabularyAchievements(userId, wordsLearned);
    
    return { pointsEarned, message: `Great job learning ${wordsLearned} new words!` };
  } catch (error) {
    console.error('Award vocabulary points error:', error);
    throw error;
  }
};

// Award points for grammar exercises
export const awardGrammarPoints = async (userId, exerciseData) => {
  try {
    const pointsEarned = POINT_VALUES.GRAMMAR_EXERCISE;
    await updateUserPoints(userId, pointsEarned, 'Grammar Exercise Completed');
    
    // Check grammar achievements
    await checkGrammarAchievements(userId);
    
    return { pointsEarned, message: 'Grammar exercise completed!' };
  } catch (error) {
    console.error('Award grammar points error:', error);
    throw error;
  }
};

// Award points for pronunciation exercises
export const awardPronunciationPoints = async (userId, score) => {
  try {
    let pointsEarned = POINT_VALUES.PRONUNCIATION_EXERCISE;
    
    // Bonus for excellent pronunciation
    if (score >= 90) {
      pointsEarned += 10;
    }
    
    await updateUserPoints(userId, pointsEarned, 'Pronunciation Exercise Completed');
    
    // Check pronunciation achievements
    await checkPronunciationAchievements(userId, score);
    
    return { pointsEarned, message: 'Pronunciation practice completed!' };
  } catch (error) {
    console.error('Award pronunciation points error:', error);
    throw error;
  }
};

// Award points for live class attendance
export const awardLiveClassPoints = async (userId, classData) => {
  try {
    const pointsEarned = POINT_VALUES.LIVE_CLASS_ATTEND;
    await updateUserPoints(userId, pointsEarned, 'Live Class Attended');
    
    return { pointsEarned, message: 'Thanks for attending the live class!' };
  } catch (error) {
    console.error('Award live class points error:', error);
    throw error;
  }
};

// Update user points and handle level progression
export const updateUserPoints = async (userId, points, reason) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    
    // Add points
    gamification.totalPoints += points;
    gamification.availablePoints += points;
    gamification.experience += points;
    
    // Check for level up
    while (gamification.experience >= gamification.experienceToNextLevel) {
      gamification.experience -= gamification.experienceToNextLevel;
      gamification.level += 1;
      gamification.experienceToNextLevel = calculateNextLevelXP(gamification.level);
      
      // Award level up badge
      await awardLevelUpBadge(userId, gamification.level);
    }
    
    // Add to activity log
    gamification.activityLog.push({
      type: 'points_earned',
      points: points,
      reason: reason,
      date: new Date()
    });
    
    await gamification.save();
    return gamification;
  } catch (error) {
    console.error('Update user points error:', error);
    throw error;
  }
};

// Update daily streak
export const updateStreak = async (userId) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    const today = new Date();
    const lastActivity = gamification.lastActivityDate;
    
    if (!lastActivity) {
      // First activity
      gamification.currentStreak = 1;
      gamification.longestStreak = 1;
    } else {
      const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        gamification.currentStreak += 1;
        if (gamification.currentStreak > gamification.longestStreak) {
          gamification.longestStreak = gamification.currentStreak;
        }
      } else if (diffDays > 1) {
        // Streak broken
        gamification.currentStreak = 1;
      }
      // If diffDays === 0, it's the same day, don't change streak
    }
    
    gamification.lastActivityDate = today;
    await gamification.save();
    
    // Check streak achievements
    await checkStreakAchievements(userId, gamification.currentStreak);
    
    return gamification.currentStreak;
  } catch (error) {
    console.error('Update streak error:', error);
    throw error;
  }
};

// Check and award lesson-related achievements
export const checkLessonAchievements = async (userId, lessonData) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    const newAchievements = [];
    
    // First lesson achievement
    const firstLessonAchievement = ACHIEVEMENTS.FIRST_LESSON;
    let userAchievement = gamification.achievements.find(a => a.achievementId === firstLessonAchievement.id);
    
    if (!userAchievement) {
      userAchievement = {
        achievementId: firstLessonAchievement.id,
        name: firstLessonAchievement.name,
        description: firstLessonAchievement.description,
        progress: 1,
        target: firstLessonAchievement.target,
        isCompleted: true,
        completedAt: new Date(),
        reward: firstLessonAchievement.reward
      };
      gamification.achievements.push(userAchievement);
      newAchievements.push(userAchievement);
      
      // Award badge
      await awardBadge(userId, BADGES.starter);
    }
    
    await gamification.save();
    return newAchievements;
  } catch (error) {
    console.error('Check lesson achievements error:', error);
    throw error;
  }
};

// Award a badge to user
export const awardBadge = async (userId, badgeData) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    
    // Check if user already has this badge
    const existingBadge = gamification.badges.find(b => b.badgeId === badgeData.name.toLowerCase().replace(/\s+/g, '_'));
    
    if (!existingBadge) {
      const newBadge = {
        badgeId: badgeData.name.toLowerCase().replace(/\s+/g, '_'),
        name: badgeData.name,
        description: badgeData.description,
        icon: badgeData.icon,
        rarity: badgeData.rarity,
        earnedAt: new Date(),
        points: 0
      };
      
      gamification.badges.push(newBadge);
      await gamification.save();
      
      return newBadge;
    }
    
    return null;
  } catch (error) {
    console.error('Award badge error:', error);
    throw error;
  }
};

// Award level up badge
export const awardLevelUpBadge = async (userId, level) => {
  try {
    if (level % 5 === 0) { // Award special badge every 5 levels
      const badgeData = {
        name: `Level ${level} Master`,
        description: `Reached level ${level}!`,
        icon: '🎉',
        rarity: level >= 20 ? 'legendary' : level >= 10 ? 'epic' : 'rare'
      };
      
      await awardBadge(userId, badgeData);
    }
  } catch (error) {
    console.error('Award level up badge error:', error);
    throw error;
  }
};

// Calculate experience needed for next level
export const calculateNextLevelXP = (level) => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

// Get or create gamification data for user
export const getOrCreateGamification = async (userId) => {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = await Gamification.create({
        userId,
        totalPoints: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        currentStreak: 0,
        achievements: []
      });
    }
    
    return gamification;
  } catch (error) {
    console.error('Get or create gamification error:', error);
    throw error;
  }
};

// Check vocabulary achievements
export const checkVocabularyAchievements = async (userId, wordsLearned) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    const achievement = ACHIEVEMENTS.VOCABULARY_MASTER;
    let userAchievement = gamification.achievements.find(a => a.achievementId === achievement.id);
    
    if (!userAchievement) {
      userAchievement = {
        achievementId: achievement.id,
        name: achievement.name,
        description: achievement.description,
        progress: 0,
        target: achievement.target,
        isCompleted: false,
        reward: achievement.reward
      };
      gamification.achievements.push(userAchievement);
    }
    
    if (!userAchievement.isCompleted) {
      userAchievement.progress += wordsLearned;
      
      if (userAchievement.progress >= achievement.target) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
        await awardBadge(userId, BADGES.wordsmith);
        await updateUserPoints(userId, achievement.reward.points, 'Vocabulary Master Achievement');
      }
    }
    
    await gamification.save();
  } catch (error) {
    console.error('Check vocabulary achievements error:', error);
    throw error;
  }
};

// Check grammar achievements
export const checkGrammarAchievements = async (userId) => {
  try {
    const gamification = await getOrCreateGamification(userId);
    const achievement = ACHIEVEMENTS.GRAMMAR_GURU;
    let userAchievement = gamification.achievements.find(a => a.achievementId === achievement.id);
    
    if (!userAchievement) {
      userAchievement = {
        achievementId: achievement.id,
        name: achievement.name,
        description: achievement.description,
        progress: 0,
        target: achievement.target,
        isCompleted: false,
        reward: achievement.reward
      };
      gamification.achievements.push(userAchievement);
    }
    
    if (!userAchievement.isCompleted) {
      userAchievement.progress += 1;
      
      if (userAchievement.progress >= achievement.target) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
        await awardBadge(userId, BADGES.grammarian);
        await updateUserPoints(userId, achievement.reward.points, 'Grammar Guru Achievement');
      }
    }
    
    await gamification.save();
  } catch (error) {
    console.error('Check grammar achievements error:', error);
    throw error;
  }
};

// Check pronunciation achievements
export const checkPronunciationAchievements = async (userId, score) => {
  try {
    if (score >= 90) {
      const gamification = await getOrCreateGamification(userId);
      const achievement = ACHIEVEMENTS.PERFECT_PRONUNCIATION;
      let userAchievement = gamification.achievements.find(a => a.achievementId === achievement.id);
      
      if (!userAchievement) {
        userAchievement = {
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          progress: 0,
          target: achievement.target,
          isCompleted: false,
          reward: achievement.reward
        };
        gamification.achievements.push(userAchievement);
      }
      
      if (!userAchievement.isCompleted) {
        userAchievement.progress += 1;
        
        if (userAchievement.progress >= achievement.target) {
          userAchievement.isCompleted = true;
          userAchievement.completedAt = new Date();
          await awardBadge(userId, BADGES.speaker);
          await updateUserPoints(userId, achievement.reward.points, 'Perfect Pronunciation Achievement');
        }
      }
      
      await gamification.save();
    }
  } catch (error) {
    console.error('Check pronunciation achievements error:', error);
    throw error;
  }
};

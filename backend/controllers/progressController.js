import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get comprehensive user progress
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'parent' && userId !== requestingUserId) {
      // For teachers, check if they have access to this student
      if (userRole === 'teacher') {
        const student = await User.findById(userId);
        if (!student || !student.assignedTeachers.includes(requestingUserId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get overall progress statistics
    const overallStats = await Progress.getOverallProgress(userId);

    // Get detailed progress by course
    const progressByCourse = await Progress.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $lookup: {
          from: 'lessons',
          localField: 'lessonId',
          foreignField: '_id',
          as: 'lesson'
        }
      },
      { $unwind: '$course' },
      { $unwind: '$lesson' },
      {
        $group: {
          _id: '$courseId',
          courseName: { $first: '$course.title' },
          courseLanguage: { $first: '$course.language' },
          courseLevel: { $first: '$course.level' },
          totalLessons: { $sum: 1 },
          completedLessons: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageScore: { $avg: '$bestScore' },
          totalTimeSpent: { $sum: '$timeSpent' },
          totalPoints: { $sum: '$pointsEarned' },
          lastActivity: { $max: '$lastAccessedAt' }
        }
      },
      {
        $addFields: {
          completionPercentage: {
            $multiply: [
              { $divide: ['$completedLessons', '$totalLessons'] },
              100
            ]
          }
        }
      },
      { $sort: { lastActivity: -1 } }
    ]);

    // Get recent activity
    const recentActivity = await Progress.find({ userId })
      .populate('courseId', 'title language level')
      .populate('lessonId', 'title type')
      .sort({ lastAccessedAt: -1 })
      .limit(10);

    // Get streak information
    const streakData = await Progress.findOne({ userId })
      .sort({ 'streakData.currentStreak': -1 })
      .select('streakData');

    res.json({
      success: true,
      data: {
        overallStats: overallStats[0] || {
          totalCourses: 0,
          totalLessons: 0,
          completedLessons: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          totalPoints: 0
        },
        progressByCourse,
        recentActivity,
        streakData: streakData?.streakData || {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: null
        }
      }
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get course-specific progress
export const getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== 'admin' && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get course information
    const course = await Course.findById(courseId)
      .populate('instructor', 'firstName lastName');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all lessons in the course
    const lessons = await Lesson.find({ courseId, isActive: true, isPublished: true })
      .sort({ order: 1 });

    // Get progress for each lesson
    const progressData = await Progress.getUserCourseProgress(userId, courseId);

    // Calculate course statistics
    const totalLessons = lessons.length;
    const completedLessons = progressData.filter(p => p.status === 'completed').length;
    const averageScore = progressData.length > 0
      ? progressData.reduce((sum, p) => sum + p.bestScore, 0) / progressData.length
      : 0;
    const totalTimeSpent = progressData.reduce((sum, p) => sum + p.timeSpent, 0);
    const totalPoints = progressData.reduce((sum, p) => sum + p.pointsEarned, 0);

    // Map lessons with progress
    const lessonsWithProgress = lessons.map(lesson => {
      const progress = progressData.find(p =>
        p.lessonId._id.toString() === lesson._id.toString()
      );

      return {
        lesson: lesson,
        progress: progress ? {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          bestScore: progress.bestScore,
          timeSpent: progress.timeSpent,
          attempts: progress.attempts,
          lastAccessed: progress.lastAccessedAt
        } : {
          status: 'not-started',
          completionPercentage: 0,
          bestScore: 0,
          timeSpent: 0,
          attempts: 0,
          lastAccessed: null
        }
      };
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          language: course.language,
          level: course.level,
          instructor: course.instructor
        },
        statistics: {
          totalLessons,
          completedLessons,
          completionPercentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
          averageScore: Math.round(averageScore),
          totalTimeSpent,
          totalPoints
        },
        lessons: lessonsWithProgress
      }
    });

  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get lesson-specific progress
export const getLessonProgress = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== 'admin' && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get lesson information
    const lesson = await Lesson.findById(lessonId)
      .populate('courseId', 'title language level');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Get progress for this lesson
    const progress = await Progress.findOne({
      userId,
      courseId: lesson.courseId._id,
      lessonId
    });

    if (!progress) {
      return res.json({
        success: true,
        data: {
          lesson: {
            id: lesson._id,
            title: lesson.title,
            type: lesson.type,
            course: lesson.courseId
          },
          progress: {
            status: 'not-started',
            completionPercentage: 0,
            bestScore: 0,
            currentScore: 0,
            timeSpent: 0,
            attempts: 0,
            activities: [],
            quizResults: [],
            vocabularyProgress: [],
            lastAccessed: null
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        lesson: {
          id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          course: lesson.courseId
        },
        progress: {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          bestScore: progress.bestScore,
          currentScore: progress.currentScore,
          timeSpent: progress.timeSpent,
          attempts: progress.attempts,
          activities: progress.activities,
          quizResults: progress.quizResults,
          speechProgress: progress.speechProgress,
          vocabularyProgress: progress.vocabularyProgress,
          streakData: progress.streakData,
          lastAccessed: progress.lastAccessedAt,
          masteryLevel: progress.masteryLevel
        }
      }
    });

  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update progress (used internally by lesson completion)
export const updateProgress = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const { status, score, timeSpent, activityData } = req.body;
    const requestingUserId = req.user.id;

    // Check permissions
    if (userId !== requestingUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get lesson information
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      userId,
      courseId: lesson.courseId,
      lessonId
    });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId: lesson.courseId,
        lessonId,
        status: 'in-progress'
      });
    }

    // Update progress fields
    if (status) progress.status = status;
    if (score !== undefined) {
      progress.bestScore = Math.max(progress.bestScore, score);
      progress.currentScore = score;
    }
    if (timeSpent) progress.timeSpent += timeSpent;
    if (activityData) {
      // Handle specific activity data updates
      if (activityData.type === 'vocabulary') {
        progress.vocabularyProgress = activityData.vocabularyProgress || progress.vocabularyProgress;
      }
      if (activityData.type === 'speech') {
        progress.speechProgress = activityData.speechProgress || progress.speechProgress;
      }
    }

    progress.lastAccessedAt = new Date();
    progress.updateStreak();

    await progress.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get detailed progress analytics
export const getProgressAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30d' } = req.query;
    const requestingUserId = req.user.id;

    // Check permissions
    if (userId !== requestingUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get progress data within timeframe
    const progressData = await Progress.find({
      userId,
      lastAccessedAt: { $gte: startDate, $lte: endDate }
    }).populate('courseId', 'title language level')
      .populate('lessonId', 'title type');

    // Calculate analytics
    const analytics = {
      studyTime: {
        total: progressData.reduce((sum, p) => sum + p.timeSpent, 0),
        average: progressData.length > 0
          ? progressData.reduce((sum, p) => sum + p.timeSpent, 0) / progressData.length
          : 0,
        byDay: this.calculateDailyStudyTime(progressData, startDate, endDate)
      },
      performance: {
        averageScore: progressData.length > 0
          ? progressData.reduce((sum, p) => sum + p.bestScore, 0) / progressData.length
          : 0,
        scoreDistribution: this.calculateScoreDistribution(progressData),
        improvementTrend: this.calculateImprovementTrend(progressData)
      },
      completion: {
        lessonsCompleted: progressData.filter(p => p.status === 'completed').length,
        lessonsInProgress: progressData.filter(p => p.status === 'in-progress').length,
        completionRate: progressData.length > 0
          ? (progressData.filter(p => p.status === 'completed').length / progressData.length) * 100
          : 0
      },
      streaks: {
        current: progressData[0]?.streakData?.currentStreak || 0,
        longest: Math.max(...progressData.map(p => p.streakData?.longestStreak || 0)),
        streakHistory: this.calculateStreakHistory(progressData, startDate, endDate)
      },
      languages: this.calculateLanguageProgress(progressData),
      weakAreas: this.identifyWeakAreas(progressData),
      recommendations: this.generateRecommendations(progressData)
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get weekly progress report
export const getWeeklyReport = async (req, res) => {
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

    // Calculate week range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Get progress data for the week
    const weeklyProgress = await Progress.find({
      userId,
      lastAccessedAt: { $gte: startDate, $lte: endDate }
    }).populate('courseId', 'title language level')
      .populate('lessonId', 'title type order');

    // Calculate weekly statistics
    const weeklyStats = {
      totalStudyTime: weeklyProgress.reduce((sum, p) => sum + p.timeSpent, 0),
      lessonsCompleted: weeklyProgress.filter(p => p.status === 'completed').length,
      averageScore: weeklyProgress.length > 0
        ? weeklyProgress.reduce((sum, p) => sum + p.bestScore, 0) / weeklyProgress.length
        : 0,
      coursesStudied: [...new Set(weeklyProgress.map(p => p.courseId._id.toString()))].length,
      streakDays: this.calculateWeeklyStreakDays(weeklyProgress),
      dailyBreakdown: this.calculateDailyBreakdown(weeklyProgress, startDate, endDate)
    };

    // Get goals and achievements
    const goals = await this.getWeeklyGoals(userId);
    const achievements = await this.getWeeklyAchievements(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate,
          type: 'weekly'
        },
        statistics: weeklyStats,
        goals,
        achievements,
        recommendations: this.generateWeeklyRecommendations(weeklyStats)
      }
    });

  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get monthly progress report
export const getMonthlyReport = async (req, res) => {
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

    // Calculate month range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Get progress data for the month
    const monthlyProgress = await Progress.find({
      userId,
      lastAccessedAt: { $gte: startDate, $lte: endDate }
    }).populate('courseId', 'title language level')
      .populate('lessonId', 'title type order');

    // Calculate monthly statistics
    const monthlyStats = {
      totalStudyTime: monthlyProgress.reduce((sum, p) => sum + p.timeSpent, 0),
      lessonsCompleted: monthlyProgress.filter(p => p.status === 'completed').length,
      coursesCompleted: await this.getCompletedCoursesCount(userId, startDate, endDate),
      averageScore: monthlyProgress.length > 0
        ? monthlyProgress.reduce((sum, p) => sum + p.bestScore, 0) / monthlyProgress.length
        : 0,
      improvementRate: await this.calculateImprovementRate(userId, startDate, endDate),
      consistencyScore: this.calculateConsistencyScore(monthlyProgress),
      weeklyBreakdown: this.calculateWeeklyBreakdown(monthlyProgress, startDate, endDate),
      languageProgress: this.calculateLanguageProgress(monthlyProgress)
    };

    // Get certificates earned
    const certificates = await this.getCertificatesEarned(userId, startDate, endDate);

    // Get milestones reached
    const milestones = await this.getMilestonesReached(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate,
          type: 'monthly'
        },
        statistics: monthlyStats,
        certificates,
        milestones,
        recommendations: this.generateMonthlyRecommendations(monthlyStats),
        nextMonthGoals: this.suggestNextMonthGoals(monthlyStats)
      }
    });

  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper methods (these would be implemented as class methods or separate utility functions)
// For now, adding placeholder implementations

const calculateDailyStudyTime = (progressData, startDate, endDate) => {
  // Implementation for daily study time calculation
  return [];
};

const calculateScoreDistribution = (progressData) => {
  // Implementation for score distribution
  return {};
};

const calculateImprovementTrend = (progressData) => {
  // Implementation for improvement trend
  return {};
};

const calculateStreakHistory = (progressData, startDate, endDate) => {
  // Implementation for streak history
  return [];
};

const calculateLanguageProgress = (progressData) => {
  // Implementation for language progress
  return {};
};

const identifyWeakAreas = (progressData) => {
  // Implementation for identifying weak areas
  return [];
};

const generateRecommendations = (progressData) => {
  // Implementation for generating recommendations
  return [];
};

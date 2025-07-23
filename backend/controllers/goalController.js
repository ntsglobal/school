import { validationResult } from 'express-validator';
import { Goal, Streak } from '../models/Goal.js';
import Gamification from '../models/Gamification.js';

// Get user's goals
export const getUserGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status = 'active', category } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let query = { userId };
    
    if (type) query.type = type;
    if (status !== 'all') query.status = status;
    if (category) query.category = category;

    const goals = await Goal.find(query)
      .sort({ priority: -1, createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      overdue: goals.filter(g => g.isOverdue).length,
      averageCompletion: goals.length > 0 
        ? Math.round(goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length)
        : 0
    };

    res.json({
      success: true,
      data: {
        goals,
        stats
      }
    });

  } catch (error) {
    console.error('Get user goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new goal
export const createGoal = async (req, res) => {
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

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const goalData = {
      ...req.body,
      userId,
      createdBy: req.user.role === 'admin' ? 'system' : 'user'
    };

    const goal = await Goal.create(goalData);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, goalId } = req.params;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal }
    });

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update goal progress
export const updateGoalProgress = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const { progress, notes } = req.body;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const wasCompleted = goal.updateProgress(progress, notes);
    await goal.save();

    let rewards = null;
    if (wasCompleted) {
      // Award points for goal completion
      const gamification = await Gamification.findOne({ userId });
      if (gamification && goal.rewards.points > 0) {
        gamification.addPoints(goal.rewards.points, 'goal_completion');
        await gamification.save();
      }

      rewards = {
        points: goal.rewards.points,
        badge: goal.rewards.badge,
        customReward: goal.rewards.customReward
      };
    }

    res.json({
      success: true,
      message: wasCompleted ? 'Goal completed! 🎉' : 'Progress updated',
      data: {
        goal,
        completed: wasCompleted,
        rewards
      }
    });

  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const { userId, goalId } = req.params;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's streaks
export const getUserStreaks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const streaks = await Streak.find({ userId, isActive: true })
      .sort({ currentStreak: -1 });

    // Calculate streak statistics
    const stats = {
      totalStreaks: streaks.length,
      longestCurrentStreak: Math.max(...streaks.map(s => s.currentStreak), 0),
      longestEverStreak: Math.max(...streaks.map(s => s.longestStreak), 0),
      activeStreaks: streaks.filter(s => s.currentStreak > 0).length
    };

    res.json({
      success: true,
      data: {
        streaks,
        stats
      }
    });

  } catch (error) {
    console.error('Get user streaks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update streak
export const updateStreak = async (req, res) => {
  try {
    const { userId, streakId } = req.params;
    const { value = 1, date } = req.body;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const streak = await Streak.findOne({ _id: streakId, userId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'Streak not found'
      });
    }

    const activityDate = date ? new Date(date) : new Date();
    const newStreakValue = streak.updateStreak(activityDate, value);
    await streak.save();

    // Check for milestone achievements
    const achievedMilestones = streak.milestones.filter(m => 
      m.achieved && 
      m.achievedAt && 
      m.achievedAt.toDateString() === new Date().toDateString()
    );

    res.json({
      success: true,
      message: 'Streak updated successfully',
      data: {
        streak,
        currentStreak: newStreakValue,
        achievedMilestones
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

// Create default goals for new users
export const createDefaultGoals = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const defaultGoals = [
      {
        title: 'Daily Study Goal',
        description: 'Study for at least 30 minutes every day',
        type: 'daily',
        category: 'study_time',
        target: { value: 30, unit: 'minutes' },
        timeframe: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
        },
        recurrence: {
          isRecurring: true,
          frequency: 'daily'
        },
        rewards: { points: 25 },
        createdBy: 'system'
      },
      {
        title: 'Weekly Lesson Goal',
        description: 'Complete 5 lessons this week',
        type: 'weekly',
        category: 'lessons',
        target: { value: 5, unit: 'lessons' },
        timeframe: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
        },
        rewards: { points: 100 },
        createdBy: 'system'
      }
    ];

    const goals = await Goal.insertMany(
      defaultGoals.map(goal => ({ ...goal, userId }))
    );

    // Create default streaks
    const defaultStreaks = [
      {
        userId,
        type: 'study',
        name: 'Daily Study Streak',
        description: 'Study every day to maintain your streak',
        requirements: { minimumValue: 15, unit: 'minutes' },
        milestones: [
          { days: 7, reward: { points: 50, badge: 'week_warrior' } },
          { days: 30, reward: { points: 200, badge: 'month_master' } },
          { days: 100, reward: { points: 500, badge: 'streak_legend' } }
        ]
      }
    ];

    const streaks = await Streak.insertMany(defaultStreaks);

    res.json({
      success: true,
      message: 'Default goals and streaks created successfully',
      data: {
        goals,
        streaks
      }
    });

  } catch (error) {
    console.error('Create default goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

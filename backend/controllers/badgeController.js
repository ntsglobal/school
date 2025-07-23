import { validationResult } from 'express-validator';
import { Badge, Achievement } from '../models/Badge.js';
import Gamification from '../models/Gamification.js';
import User from '../models/User.js';

// Get all available badges
export const getAllBadges = async (req, res) => {
  try {
    const { category, rarity, includeSecret = false } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    if (!includeSecret || req.user.role !== 'admin') {
      query.isSecret = false;
    }

    const badges = await Badge.find(query)
      .sort({ category: 1, rarity: 1, name: 1 });

    res.json({
      success: true,
      data: { badges }
    });

  } catch (error) {
    console.error('Get all badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get badge by ID
export const getBadgeById = async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await Badge.findById(id);
    
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if user can see secret badges
    if (badge.isSecret && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { badge }
    });

  } catch (error) {
    console.error('Get badge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new badge (Admin only)
export const createBadge = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const badgeData = {
      ...req.body,
      createdBy: req.user.id
    };

    const badge = await Badge.create(badgeData);

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: { badge }
    });

  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update badge (Admin only)
export const updateBadge = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    
    const badge = await Badge.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.json({
      success: true,
      message: 'Badge updated successfully',
      data: { badge }
    });

  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete badge (Admin only)
export const deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await Badge.findByIdAndDelete(id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.json({
      success: true,
      message: 'Badge deleted successfully'
    });

  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's achievements
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = 'all', category } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let query = { userId };
    
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'incomplete') {
      query.isCompleted = false;
    }
    
    if (category) {
      query.category = category;
    }

    const achievements = await Achievement.find(query)
      .sort({ isCompleted: 1, completedAt: -1, progress: -1 });

    const stats = {
      total: achievements.length,
      completed: achievements.filter(a => a.isCompleted).length,
      inProgress: achievements.filter(a => !a.isCompleted && a.progress > 0).length,
      notStarted: achievements.filter(a => !a.isCompleted && a.progress === 0).length
    };

    res.json({
      success: true,
      data: {
        achievements,
        stats
      }
    });

  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create achievement for user
export const createAchievement = async (req, res) => {
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
    const achievementData = {
      ...req.body,
      userId
    };

    // Check if achievement already exists for user
    const existingAchievement = await Achievement.findOne({
      userId,
      achievementId: achievementData.achievementId
    });

    if (existingAchievement) {
      return res.status(400).json({
        success: false,
        message: 'Achievement already exists for this user'
      });
    }

    const achievement = await Achievement.create(achievementData);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: { achievement }
    });

  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update achievement progress
export const updateAchievementProgress = async (req, res) => {
  try {
    const { userId, achievementId } = req.params;
    const { progress } = req.body;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const achievement = await Achievement.findOne({ userId, achievementId });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    const wasCompleted = achievement.updateProgress(progress);
    await achievement.save();

    let rewards = null;
    if (wasCompleted) {
      // Award points and badge if specified
      const gamification = await Gamification.findOne({ userId });
      if (gamification && achievement.pointsReward > 0) {
        gamification.addPoints(achievement.pointsReward, 'achievement');
        await gamification.save();
      }

      if (achievement.badgeReward) {
        const badge = await Badge.findOne({ badgeId: achievement.badgeReward });
        if (badge && gamification) {
          gamification.awardBadge({
            badgeId: badge.badgeId,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            rarity: badge.rarity,
            points: badge.rewards.points
          });
          await gamification.save();
        }
      }

      rewards = {
        points: achievement.pointsReward,
        badge: achievement.badgeReward
      };
    }

    res.json({
      success: true,
      message: wasCompleted ? 'Achievement completed!' : 'Progress updated',
      data: {
        achievement,
        completed: wasCompleted,
        rewards
      }
    });

  } catch (error) {
    console.error('Update achievement progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check and update all achievements for a user
export const checkUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user stats
    const user = await User.findById(userId);
    const gamification = await Gamification.findOne({ userId });
    
    if (!user || !gamification) {
      return res.status(404).json({
        success: false,
        message: 'User or gamification data not found'
      });
    }

    // Get all user achievements
    const achievements = await Achievement.find({ userId, isCompleted: false });
    
    const completedAchievements = [];
    const updatedAchievements = [];

    // Check each achievement
    for (const achievement of achievements) {
      let newProgress = 0;
      
      // Calculate progress based on achievement type
      switch (achievement.category) {
        case 'points':
          newProgress = gamification.totalPoints;
          break;
        case 'streak':
          newProgress = gamification.currentStreak;
          break;
        case 'lesson':
          // This would need to be calculated from progress data
          newProgress = achievement.progress; // Keep current for now
          break;
        // Add more cases as needed
      }

      if (newProgress !== achievement.progress) {
        const wasCompleted = achievement.updateProgress(newProgress);
        await achievement.save();
        
        updatedAchievements.push(achievement);
        
        if (wasCompleted) {
          completedAchievements.push(achievement);
        }
      }
    }

    res.json({
      success: true,
      message: `Checked ${achievements.length} achievements`,
      data: {
        totalChecked: achievements.length,
        updated: updatedAchievements.length,
        completed: completedAchievements.length,
        completedAchievements
      }
    });

  } catch (error) {
    console.error('Check user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

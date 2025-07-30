import mongoose from 'mongoose';

const gamificationSchema = new mongoose.Schema({
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Points System
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  spentPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Level System
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  
  // Streaks
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivityDate: Date,
  
  // Badges
  badges: [{
    badgeId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    category: {
      type: String,
      enum: ['achievement', 'milestone', 'streak', 'skill', 'special'],
      default: 'achievement'
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // Achievements
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    progress: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    reward: {
      points: Number,
      badge: String,
      title: String
    }
  }],
  
  // Leaderboard Stats
  weeklyPoints: {
    type: Number,
    default: 0
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },
  weeklyRank: Number,
  monthlyRank: Number,
  globalRank: Number,
  
  // Activity Tracking
  dailyGoal: {
    type: Number,
    default: 30 // minutes
  },
  weeklyGoal: {
    type: Number,
    default: 210 // minutes (30 * 7)
  },
  dailyProgress: {
    type: Number,
    default: 0
  },
  weeklyProgress: {
    type: Number,
    default: 0
  },
  
  // Rewards and Purchases
  rewards: [{
    rewardId: String,
    name: String,
    description: String,
    cost: Number,
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  
  // Special Titles
  titles: [{
    titleId: String,
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }],
  activeTitle: String,
  
  // Statistics
  stats: {
    lessonsCompleted: {
      type: Number,
      default: 0
    },
    coursesCompleted: {
      type: Number,
      default: 0
    },
    quizzesTaken: {
      type: Number,
      default: 0
    },
    perfectScores: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    averageScore: {
      type: Number,
      default: 0
    },
    vocabularyLearned: {
      type: Number,
      default: 0
    },
    speakingPractice: {
      type: Number,
      default: 0 // sessions
    },
    helpedOthers: {
      type: Number,
      default: 0
    }
  },
  
  // Multipliers and Bonuses
  multipliers: {
    pointsMultiplier: {
      type: Number,
      default: 1.0
    },
    experienceMultiplier: {
      type: Number,
      default: 1.0
    },
    streakBonus: {
      type: Number,
      default: 0
    },
    weekendBonus: {
      type: Boolean,
      default: false
    }
  },
  
  // Preferences
  preferences: {
    showLeaderboard: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: true
    },
    notifications: {
      streakReminder: {
        type: Boolean,
        default: true
      },
      goalReminder: {
        type: Boolean,
        default: true
      },
      badgeEarned: {
        type: Boolean,
        default: true
      },
      levelUp: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes (userId already has unique: true, so no need for manual unique index)
gamificationSchema.index({ totalPoints: -1 });
gamificationSchema.index({ level: -1 });
gamificationSchema.index({ currentStreak: -1 });
gamificationSchema.index({ weeklyPoints: -1 });
gamificationSchema.index({ monthlyPoints: -1 });

// Virtual for progress to next level
gamificationSchema.virtual('levelProgress').get(function() {
  return Math.round((this.experience / this.experienceToNextLevel) * 100);
});

// Virtual for badge count by category
gamificationSchema.virtual('badgeStats').get(function() {
  const stats = {
    total: this.badges.length,
    achievement: 0,
    milestone: 0,
    streak: 0,
    skill: 0,
    special: 0
  };
  
  this.badges.forEach(badge => {
    stats[badge.category]++;
  });
  
  return stats;
});

// Methods
gamificationSchema.methods.addPoints = function(points, source = 'general') {
  const multipliedPoints = Math.floor(points * this.multipliers.pointsMultiplier);
  this.totalPoints += multipliedPoints;
  this.availablePoints += multipliedPoints;
  
  // Add experience (1 point = 1 experience)
  this.addExperience(multipliedPoints);
  
  return multipliedPoints;
};

gamificationSchema.methods.addExperience = function(exp) {
  const multipliedExp = Math.floor(exp * this.multipliers.experienceMultiplier);
  this.experience += multipliedExp;
  
  // Check for level up
  while (this.experience >= this.experienceToNextLevel) {
    this.levelUp();
  }
  
  return multipliedExp;
};

gamificationSchema.methods.levelUp = function() {
  this.experience -= this.experienceToNextLevel;
  this.level += 1;
  
  // Increase experience requirement for next level
  this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.2);
  
  // Award level up bonus
  const levelBonus = this.level * 50;
  this.totalPoints += levelBonus;
  this.availablePoints += levelBonus;
  
  return this.level;
};

gamificationSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = this.lastActivityDate;
  
  if (!lastActivity) {
    this.currentStreak = 1;
  } else {
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else if (daysDiff > 1) {
      this.currentStreak = 1;
    }
  }
  
  this.lastActivityDate = today;
  
  // Apply streak bonus
  if (this.currentStreak >= 7) {
    this.multipliers.streakBonus = Math.min(0.5, this.currentStreak * 0.05);
  }
  
  return this.currentStreak;
};

gamificationSchema.methods.awardBadge = function(badgeData) {
  // Check if badge already exists
  const existingBadge = this.badges.find(b => b.badgeId === badgeData.badgeId);
  if (existingBadge) return false;
  
  this.badges.push({
    ...badgeData,
    earnedAt: new Date()
  });
  
  // Award points for badge
  if (badgeData.points) {
    this.addPoints(badgeData.points, 'badge');
  }
  
  return true;
};

gamificationSchema.methods.spendPoints = function(amount, item) {
  if (this.availablePoints < amount) {
    throw new Error('Insufficient points');
  }
  
  this.availablePoints -= amount;
  this.spentPoints += amount;
  
  return this.availablePoints;
};

// Static methods
gamificationSchema.statics.getLeaderboard = function(type = 'total', limit = 10, filters = {}) {
  let sortField = 'totalPoints';
  let matchStage = {};

  switch (type) {
    case 'weekly':
      sortField = 'weeklyPoints';
      break;
    case 'monthly':
      sortField = 'monthlyPoints';
      break;
    case 'level':
      sortField = 'level';
      break;
    case 'streak':
      sortField = 'currentStreak';
      break;
    default:
      sortField = 'totalPoints';
  }

  // Add filters
  if (filters.grade) {
    matchStage['userId.grade'] = filters.grade;
  }
  if (filters.school) {
    matchStage['userId.school'] = filters.school;
  }

  return this.find({})
    .populate('userId', 'firstName lastName avatar grade school')
    .match(matchStage)
    .sort({ [sortField]: -1, level: -1, experience: -1 })
    .limit(limit);
};

gamificationSchema.statics.getUserRank = async function(userId, type = 'total') {
  const user = await this.findOne({ userId });
  if (!user) return null;

  let sortField = 'totalPoints';
  let userValue = user.totalPoints;

  switch (type) {
    case 'weekly':
      sortField = 'weeklyPoints';
      userValue = user.weeklyPoints;
      break;
    case 'monthly':
      sortField = 'monthlyPoints';
      userValue = user.monthlyPoints;
      break;
    case 'level':
      sortField = 'level';
      userValue = user.level;
      break;
    case 'streak':
      sortField = 'currentStreak';
      userValue = user.currentStreak;
      break;
  }

  const rank = await this.countDocuments({
    [sortField]: { $gt: userValue }
  }) + 1;

  return rank;
};

gamificationSchema.statics.getTopPerformers = function(timeframe = 'week', limit = 5) {
  const sortField = timeframe === 'week' ? 'weeklyPoints' :
                   timeframe === 'month' ? 'monthlyPoints' : 'totalPoints';

  return this.find({})
    .populate('userId', 'firstName lastName avatar')
    .sort({ [sortField]: -1 })
    .limit(limit);
};

gamificationSchema.statics.getCourseLeaderboard = async function(courseId, limit = 10) {
  // This would require aggregating progress data for a specific course
  // For now, return general leaderboard
  return this.getLeaderboard('total', limit);
};

gamificationSchema.statics.getFriendsLeaderboard = async function(userId, friendIds, limit = 10) {
  const allUserIds = [userId, ...friendIds];

  return this.find({ userId: { $in: allUserIds } })
    .populate('userId', 'firstName lastName avatar')
    .sort({ totalPoints: -1, level: -1 })
    .limit(limit);
};

gamificationSchema.statics.updateWeeklyStats = function() {
  // Reset weekly points for all users
  return this.updateMany({}, { weeklyPoints: 0 });
};

gamificationSchema.statics.updateMonthlyStats = function() {
  // Reset monthly points for all users
  return this.updateMany({}, { monthlyPoints: 0 });
};

const Gamification = mongoose.model('Gamification', gamificationSchema);

export default Gamification;

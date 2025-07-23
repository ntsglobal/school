import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  // Basic Information
  badgeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Visual
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  imageUrl: String,
  
  // Classification
  category: {
    type: String,
    required: true,
    enum: [
      'achievement',    // General achievements
      'level',         // Level-based badges
      'streak',        // Streak-based badges
      'course',        // Course completion badges
      'skill',         // Skill-based badges
      'time',          // Time-based badges
      'social',        // Social interaction badges
      'special',       // Special event badges
      'language'       // Language-specific badges
    ]
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // Requirements
  requirements: {
    // Points requirements
    totalPoints: Number,
    weeklyPoints: Number,
    monthlyPoints: Number,
    
    // Level requirements
    level: Number,
    
    // Streak requirements
    streakDays: Number,
    
    // Course requirements
    coursesCompleted: Number,
    specificCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    
    // Lesson requirements
    lessonsCompleted: Number,
    perfectScores: Number,
    
    // Time requirements
    studyTimeMinutes: Number,
    consecutiveDays: Number,
    
    // Language requirements
    languagesStudied: Number,
    specificLanguage: String,
    
    // Social requirements
    friendsReferred: Number,
    helpedStudents: Number,
    
    // Custom requirements (for special badges)
    customRequirements: mongoose.Schema.Types.Mixed
  },
  
  // Rewards
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    experienceBonus: {
      type: Number,
      default: 0
    },
    multiplierBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 2
    },
    unlockFeatures: [String], // Features unlocked by this badge
    title: String // Special title awarded with badge
  },
  
  // Availability
  isActive: {
    type: Boolean,
    default: true
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  availableFrom: Date,
  availableUntil: Date,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Statistics
  stats: {
    totalAwarded: {
      type: Number,
      default: 0
    },
    firstAwardedAt: Date,
    lastAwardedAt: Date,
    averageTimeToEarn: Number // in days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Achievement Schema (for tracking user progress towards badges)
const achievementSchema = new mongoose.Schema({
  // User and Badge
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['points', 'streak', 'course', 'lesson', 'time', 'social', 'skill', 'special']
  },
  
  // Progress Tracking
  target: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  
  // Status
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Rewards
  pointsReward: {
    type: Number,
    default: 0
  },
  badgeReward: String, // Badge ID to award upon completion
  
  // Metadata
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ isActive: 1, isSecret: 1 });
badgeSchema.index({ 'requirements.level': 1 });
badgeSchema.index({ 'requirements.totalPoints': 1 });

achievementSchema.index({ userId: 1, isCompleted: 1 });
achievementSchema.index({ achievementId: 1 });
achievementSchema.index({ category: 1 });

// Virtual for completion percentage
achievementSchema.virtual('completionPercentage').get(function() {
  if (this.target === 0) return 100;
  return Math.min(100, Math.round((this.progress / this.target) * 100));
});

// Virtual for rarity score (for sorting)
badgeSchema.virtual('rarityScore').get(function() {
  const scores = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  };
  return scores[this.rarity] || 1;
});

// Methods for Badge
badgeSchema.methods.checkRequirements = function(userStats) {
  const req = this.requirements;
  
  // Check all requirements
  if (req.totalPoints && userStats.totalPoints < req.totalPoints) return false;
  if (req.level && userStats.level < req.level) return false;
  if (req.streakDays && userStats.currentStreak < req.streakDays) return false;
  if (req.coursesCompleted && userStats.coursesCompleted < req.coursesCompleted) return false;
  if (req.lessonsCompleted && userStats.lessonsCompleted < req.lessonsCompleted) return false;
  if (req.studyTimeMinutes && userStats.totalStudyTime < req.studyTimeMinutes) return false;
  if (req.languagesStudied && userStats.languagesStudied < req.languagesStudied) return false;
  
  return true;
};

badgeSchema.methods.isAvailable = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.availableFrom && this.availableFrom > now) return false;
  if (this.availableUntil && this.availableUntil < now) return false;
  
  return true;
};

// Methods for Achievement
achievementSchema.methods.updateProgress = function(newProgress) {
  this.progress = Math.min(this.target, Math.max(0, newProgress));
  this.lastUpdated = new Date();
  
  if (this.progress >= this.target && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    return true; // Achievement completed
  }
  
  return false;
};

// Static methods for Badge
badgeSchema.statics.getAvailableBadges = function(category = null) {
  const query = { isActive: true, isSecret: false };
  if (category) query.category = category;
  
  return this.find(query).sort({ category: 1, rarityScore: 1 });
};

badgeSchema.statics.getBadgesByRarity = function(rarity) {
  return this.find({ 
    rarity, 
    isActive: true 
  }).sort({ category: 1, name: 1 });
};

// Static methods for Achievement
achievementSchema.statics.getUserAchievements = function(userId, status = 'all') {
  const query = { userId };
  
  if (status === 'completed') {
    query.isCompleted = true;
  } else if (status === 'incomplete') {
    query.isCompleted = false;
  }
  
  return this.find(query).sort({ isCompleted: 1, completedAt: -1 });
};

achievementSchema.statics.getAchievementsByCategory = function(userId, category) {
  return this.find({ 
    userId, 
    category 
  }).sort({ isCompleted: 1, progress: -1 });
};

const Badge = mongoose.model('Badge', badgeSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);

export { Badge, Achievement };
export default Badge;

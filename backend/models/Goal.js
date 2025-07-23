import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  // User and Goal Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Goal Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Goal Type and Category
  type: {
    type: String,
    required: true,
    enum: [
      'daily',        // Daily goals (e.g., study 30 minutes)
      'weekly',       // Weekly goals (e.g., complete 5 lessons)
      'monthly',      // Monthly goals (e.g., finish a course)
      'custom',       // Custom timeframe goals
      'streak',       // Streak-based goals
      'achievement'   // Achievement-based goals
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'study_time',     // Time-based goals
      'lessons',        // Lesson completion goals
      'points',         // Points earning goals
      'streak',         // Streak maintenance goals
      'course',         // Course completion goals
      'skill',          // Skill improvement goals
      'assessment',     // Assessment performance goals
      'consistency'     // Consistency goals
    ]
  },
  
  // Target and Progress
  target: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['minutes', 'hours', 'lessons', 'points', 'days', 'courses', 'assessments', 'percentage']
    }
  },
  progress: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Timeframe
  timeframe: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Recurrence (for recurring goals)
  recurrence: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    endRecurrence: Date
  },
  
  // Status and Completion
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'paused', 'cancelled'],
    default: 'active'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Rewards and Motivation
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badge: String,
    customReward: String
  },
  
  // Reminders and Notifications
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    times: [String], // Array of time strings like "09:00", "18:00"
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    }
  },
  
  // Tracking Data
  dailyProgress: [{
    date: {
      type: Date,
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [String],
  notes: String,
  
  // System Fields
  createdBy: {
    type: String,
    enum: ['user', 'system', 'teacher'],
    default: 'user'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Streak Schema
const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Streak Information
  type: {
    type: String,
    required: true,
    enum: ['study', 'login', 'lesson', 'quiz', 'custom']
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Current Streak Data
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
  
  // Dates
  lastActivityDate: Date,
  streakStartDate: Date,
  
  // Activity Tracking
  activities: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    },
    value: Number, // Optional value (e.g., minutes studied)
    notes: String
  }],
  
  // Configuration
  requirements: {
    minimumValue: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['minutes', 'lessons', 'points', 'activities'],
      default: 'activities'
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Rewards
  milestones: [{
    days: Number,
    reward: {
      points: Number,
      badge: String,
      title: String
    },
    achieved: {
      type: Boolean,
      default: false
    },
    achievedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ type: 1, category: 1 });
goalSchema.index({ 'timeframe.startDate': 1, 'timeframe.endDate': 1 });
goalSchema.index({ isCompleted: 1, completedAt: -1 });

streakSchema.index({ userId: 1, type: 1 });
streakSchema.index({ isActive: 1 });
streakSchema.index({ currentStreak: -1 });

// Virtual for completion percentage
goalSchema.virtual('completionPercentage').get(function() {
  if (this.target.value === 0) return 100;
  return Math.min(100, Math.round((this.progress.current / this.target.value) * 100));
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.timeframe.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for is overdue
goalSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.timeframe.endDate) && !this.isCompleted;
});

// Methods for Goal
goalSchema.methods.updateProgress = function(value, notes = '') {
  this.progress.current = Math.min(this.target.value, Math.max(0, value));
  this.progress.percentage = this.completionPercentage;
  this.progress.lastUpdated = new Date();
  
  // Add daily progress entry
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingEntry = this.dailyProgress.find(entry => 
    entry.date.toDateString() === today.toDateString()
  );
  
  if (existingEntry) {
    existingEntry.value = value;
    existingEntry.notes = notes;
  } else {
    this.dailyProgress.push({
      date: today,
      value: value,
      notes: notes
    });
  }
  
  // Check if goal is completed
  if (this.progress.current >= this.target.value && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.status = 'completed';
    return true; // Goal completed
  }
  
  return false;
};

goalSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.timeframe.startDate && 
         now <= this.timeframe.endDate;
};

// Methods for Streak
streakSchema.methods.updateStreak = function(date = new Date(), value = 1) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = this.lastActivityDate ? new Date(this.lastActivityDate) : null;
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }
  
  // Check if activity already recorded for today
  const existingActivity = this.activities.find(activity => 
    activity.date.toDateString() === today.toDateString()
  );
  
  if (existingActivity) {
    existingActivity.value = value;
    existingActivity.completed = value >= this.requirements.minimumValue;
    return this.currentStreak;
  }
  
  // Add new activity
  const completed = value >= this.requirements.minimumValue;
  this.activities.push({
    date: today,
    completed: completed,
    value: value
  });
  
  if (completed) {
    if (!lastActivity) {
      // First activity
      this.currentStreak = 1;
      this.streakStartDate = today;
    } else {
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        this.currentStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken, start new
        this.currentStreak = 1;
        this.streakStartDate = today;
      }
      // If daysDiff === 0, it's the same day, don't change streak
    }
    
    this.lastActivityDate = today;
    this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
    
    // Check milestones
    this.checkMilestones();
  }
  
  return this.currentStreak;
};

streakSchema.methods.checkMilestones = function() {
  for (const milestone of this.milestones) {
    if (!milestone.achieved && this.currentStreak >= milestone.days) {
      milestone.achieved = true;
      milestone.achievedAt = new Date();
    }
  }
};

streakSchema.methods.breakStreak = function() {
  this.currentStreak = 0;
  this.streakStartDate = null;
};

// Static methods
goalSchema.statics.getUserActiveGoals = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    status: 'active',
    'timeframe.startDate': { $lte: now },
    'timeframe.endDate': { $gte: now }
  }).sort({ priority: -1, createdAt: -1 });
};

goalSchema.statics.getUserGoalsByType = function(userId, type) {
  return this.find({ userId, type }).sort({ createdAt: -1 });
};

streakSchema.statics.getUserStreaks = function(userId) {
  return this.find({ userId, isActive: true }).sort({ currentStreak: -1 });
};

const Goal = mongoose.model('Goal', goalSchema);
const Streak = mongoose.model('Streak', streakSchema);

export { Goal, Streak };
export default Goal;

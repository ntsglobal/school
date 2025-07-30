import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  // User and Course Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  
  // Progress Status
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'locked'],
    default: 'not-started'
  },
  
  // Completion Data
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  
  // Performance Metrics
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Activity Progress
  activities: [{
    activityId: String,
    type: {
      type: String,
      enum: ['video', 'quiz', 'exercise', 'speaking', 'listening', 'writing', 'pronunciation']
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    score: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    completedAt: Date,
    feedback: String
  }],
  
  // Quiz/Assessment Results
  quizResults: [{
    attemptNumber: Number,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number,
    answers: [{
      questionId: String,
      userAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number,
      timeSpent: Number
    }],
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Speaking/Pronunciation Progress
  speechProgress: {
    pronunciationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    fluencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    recordings: [{
      audioUrl: String,
      transcript: String,
      score: Number,
      feedback: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Vocabulary Progress
  vocabularyProgress: [{
    word: String,
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    attempts: Number,
    correctAttempts: Number,
    lastPracticed: Date
  }],
  
  // Streaks and Consistency
  streakData: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastStudyDate: Date
  },
  
  // Points and Rewards
  pointsEarned: {
    type: Number,
    default: 0
  },
  badgesEarned: [{
    badgeId: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Difficulty Adjustments
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  adaptiveSettings: {
    recommendedPace: String,
    strengthAreas: [String],
    improvementAreas: [String],
    nextRecommendations: [String]
  },
  
  // Notes and Bookmarks
  notes: [{
    content: String,
    timestamp: Number, // for video/audio content
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    type: String,
    reference: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics Data
  sessionData: [{
    sessionStart: Date,
    sessionEnd: Date,
    activitiesCompleted: Number,
    pointsEarned: Number,
    timeSpent: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
progressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ courseId: 1, status: 1 });
progressSchema.index({ userId: 1, completedAt: -1 });
progressSchema.index({ lastAccessedAt: -1 });

// Virtual for completion percentage
progressSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'not-started') return 0;
  
  // Calculate based on activities completed
  if (this.activities.length === 0) return 0;
  const completed = this.activities.filter(a => a.status === 'completed').length;
  return Math.round((completed / this.activities.length) * 100);
});

// Virtual for average score
progressSchema.virtual('averageScore').get(function() {
  if (this.quizResults.length === 0) return 0;
  const totalScore = this.quizResults.reduce((sum, result) => sum + result.score, 0);
  return Math.round(totalScore / this.quizResults.length);
});

// Virtual for mastery level
progressSchema.virtual('masteryLevel').get(function() {
  const score = this.bestScore;
  if (score >= 90) return 'expert';
  if (score >= 75) return 'proficient';
  if (score >= 60) return 'developing';
  return 'beginner';
});

// Methods
progressSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastStudy = this.streakData.lastStudyDate;
  
  if (!lastStudy) {
    this.streakData.currentStreak = 1;
    this.streakData.lastStudyDate = today;
  } else {
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.streakData.currentStreak += 1;
      if (this.streakData.currentStreak > this.streakData.longestStreak) {
        this.streakData.longestStreak = this.streakData.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.streakData.currentStreak = 1;
    }
    // If daysDiff === 0, same day, don't change streak
    
    this.streakData.lastStudyDate = today;
  }
};

progressSchema.methods.addPoints = function(points) {
  this.pointsEarned += points;
  return this.pointsEarned;
};

progressSchema.methods.completeActivity = function(activityId, score, timeSpent) {
  const activity = this.activities.find(a => a.activityId === activityId);
  if (activity) {
    activity.status = 'completed';
    activity.score = Math.max(activity.score, score);
    activity.timeSpent += timeSpent;
    activity.completedAt = new Date();
  }
  
  // Check if all activities are completed
  const allCompleted = this.activities.every(a => a.status === 'completed');
  if (allCompleted && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
};

// Static methods
progressSchema.statics.getUserCourseProgress = function(userId, courseId) {
  return this.find({ userId, courseId }).populate('lessonId');
};

progressSchema.statics.getOverallProgress = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$courseId',
        totalLessons: { $sum: 1 },
        completedLessons: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageScore: { $avg: '$bestScore' },
        totalTimeSpent: { $sum: '$timeSpent' },
        totalPoints: { $sum: '$pointsEarned' }
      }
    }
  ]);
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;

import mongoose from 'mongoose';

const buddySchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Language Learning Profile
  targetLanguage: {
    type: String,
    enum: ['french', 'japanese', 'german', 'spanish', 'korean', 'chinese', 'italian', 'russian'],
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true
  },
  learningGoals: [{
    type: String,
    enum: ['conversation', 'grammar', 'pronunciation', 'writing', 'reading', 'business', 'travel', 'academic']
  }],
  
  // Personal Information
  timezone: {
    type: String,
    required: true // Format: "GMT+5:30" or "UTC-8"
  },
  availableHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String, // Format: "09:00"
    endTime: String    // Format: "17:00"
  }],
  
  // Learning Preferences
  preferredLearningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
    default: 'mixed'
  },
  interests: [{
    type: String,
    enum: ['music', 'movies', 'sports', 'cooking', 'travel', 'technology', 'books', 'games', 'art', 'science']
  }],
  
  // Buddy Preferences
  ageRange: {
    min: {
      type: Number,
      min: 13,
      max: 100,
      default: 13
    },
    max: {
      type: Number,
      min: 13,
      max: 100,
      default: 25
    }
  },
  preferredGender: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  
  // Buddy History
  currentBuddies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pastBuddies: [{
    buddy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    endDate: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Activity Tracking
  totalSessions: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // Bio and Introduction
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Matching Preferences
  matchingPreferences: {
    priorityFactors: [{
      type: String,
      enum: ['level', 'timezone', 'interests', 'age', 'goals']
    }],
    autoAcceptMatches: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient matching
buddySchema.index({ targetLanguage: 1, currentLevel: 1, isActive: 1 });
buddySchema.index({ timezone: 1, isActive: 1 });
buddySchema.index({ interests: 1 });

// Instance methods
buddySchema.methods.calculateMatchScore = function(otherBuddy) {
  let score = 0;
  let maxScore = 0;
  
  // Language level compatibility (30% weight)
  maxScore += 30;
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const myLevelIndex = levelOrder.indexOf(this.currentLevel);
  const otherLevelIndex = levelOrder.indexOf(otherBuddy.currentLevel);
  const levelDifference = Math.abs(myLevelIndex - otherLevelIndex);
  
  if (levelDifference === 0) score += 30;
  else if (levelDifference === 1) score += 20;
  else if (levelDifference === 2) score += 10;
  
  // Timezone compatibility (25% weight)
  maxScore += 25;
  // Simple timezone matching for now - can be enhanced
  if (this.timezone === otherBuddy.timezone) {
    score += 25;
  } else {
    // Partial score for nearby timezones
    score += 10;
  }
  
  // Common interests (20% weight)
  maxScore += 20;
  const commonInterests = this.interests.filter(interest => 
    otherBuddy.interests.includes(interest)
  );
  score += Math.min(20, commonInterests.length * 4);
  
  // Learning goals overlap (15% weight)
  maxScore += 15;
  const commonGoals = this.learningGoals.filter(goal => 
    otherBuddy.learningGoals.includes(goal)
  );
  score += Math.min(15, commonGoals.length * 3);
  
  // Age compatibility (10% weight)
  maxScore += 10;
  // This would need user's age calculation
  score += 5; // Placeholder
  
  return Math.round((score / maxScore) * 100);
};

// Static methods for finding matches
buddySchema.statics.findPotentialMatches = async function(userId, limit = 10) {
  const userBuddy = await this.findOne({ userId, isActive: true });
  if (!userBuddy) throw new Error('User buddy profile not found');
  
  const potentialMatches = await this.find({
    userId: { $ne: userId },
    targetLanguage: userBuddy.targetLanguage,
    isActive: true,
    currentBuddies: { $nin: [userId] }
  }).populate('userId', 'firstName lastName avatar grade')
    .limit(limit * 2); // Get more to filter and sort
  
  // Calculate match scores and sort
  const matchesWithScores = potentialMatches.map(match => ({
    ...match.toObject(),
    matchScore: userBuddy.calculateMatchScore(match)
  })).sort((a, b) => b.matchScore - a.matchScore);
  
  return matchesWithScores.slice(0, limit);
};

export default mongoose.model('Buddy', buddySchema);

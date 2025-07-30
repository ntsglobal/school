import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  // Forum/Community Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Community Type and Language
  type: {
    type: String,
    required: true,
    enum: ['general', 'language_specific', 'course_specific', 'grade_specific', 'study_group', 'buddy_matching']
  },
  language: {
    code: String,
    name: String
  },
  cefrLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  
  // Access Control
  visibility: {
    type: String,
    enum: ['public', 'private', 'course_only', 'grade_only'],
    default: 'public'
  },
  membershipType: {
    type: String,
    enum: ['open', 'approval_required', 'invite_only'],
    default: 'open'
  },
  
  // Course/Grade Association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  gradeLevel: {
    type: Number,
    min: 6,
    max: 12
  },
  
  // Community Management
  moderators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'moderator'],
      default: 'moderator'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'contributor', 'expert'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['active', 'muted', 'banned'],
      default: 'active'
    },
    lastActive: Date,
    contributionScore: {
      type: Number,
      default: 0
    }
  }],
  
  // Community Statistics
  stats: {
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    totalPosts: {
      type: Number,
      default: 0
    },
    totalReplies: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    }
  },
  
  // Community Rules and Guidelines
  rules: [String],
  guidelines: [String],
  welcomeMessage: String,
  
  // Features
  features: {
    allowPosts: {
      type: Boolean,
      default: true
    },
    allowPolls: {
      type: Boolean,
      default: true
    },
    allowFiles: {
      type: Boolean,
      default: true
    },
    allowImages: {
      type: Boolean,
      default: true
    },
    allowVideos: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoModeration: {
      type: Boolean,
      default: true
    }
  },
  
  // Tags and Categories
  tags: [String],
  categories: [{
    name: String,
    description: String,
    icon: String,
    color: String
  }],
  
  // Community Settings
  settings: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    allowTranslation: {
      type: Boolean,
      default: true
    },
    moderationLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  
  // Analytics
  analytics: {
    weeklyActiveUsers: {
      type: Number,
      default: 0
    },
    monthlyActiveUsers: {
      type: Number,
      default: 0
    },
    averagePostsPerDay: {
      type: Number,
      default: 0
    },
    popularTimes: [{
      hour: Number,
      activityLevel: Number
    }],
    topContributors: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      contributions: Number
    }]
  }
}, {
  timestamps: true
});

// Community Posts Schema
const postSchema = new mongoose.Schema({
  // Basic Post Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Community Association
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  
  // Post Classification
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'poll', 'resource_share', 'study_buddy', 'help_request'],
    default: 'discussion'
  },
  category: String,
  tags: [String],
  
  // Content
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'link']
    },
    url: String,
    filename: String,
    size: Number,
    caption: String
  }],
  
  // Poll Data (if type is poll)
  poll: {
    question: String,
    options: [{
      text: String,
      votes: {
        type: Number,
        default: 0
      }
    }],
    allowMultiple: {
      type: Boolean,
      default: false
    },
    endDate: Date,
    voters: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      choice: [Number],
      votedAt: Date
    }]
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostReply'
  }],
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['published', 'pending', 'flagged', 'removed'],
    default: 'published'
  },
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: Date
  }],
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Language and Learning Context
  language: {
    code: String,
    level: String
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  
  // Pinned and Featured
  isPinned: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  engagement: {
    score: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  }
}, {
  timestamps: true
});

// Post Reply Schema
const postReplySchema = new mongoose.Schema({
  // Basic Reply Info
  content: {
    type: String,
    required: true
  },
  
  // Association
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Threading (for nested replies)
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostReply'
  },
  
  // Content
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'link']
    },
    url: String,
    filename: String,
    caption: String
  }],
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: Date
  }],
  
  // Moderation
  status: {
    type: String,
    enum: ['published', 'pending', 'flagged', 'removed'],
    default: 'published'
  },
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: Date
  }],
  
  // Special Attributes
  isAnswer: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Language Buddy Schema
const languageBuddySchema = new mongoose.Schema({
  // User requesting a buddy
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Buddy preferences
  preferences: {
    learningLanguage: String,
    currentLevel: String,
    targetLevel: String,
    preferredNative: String,
    ageRange: {
      min: Number,
      max: Number
    },
    timeZone: String,
    availableTimes: [String],
    studyGoals: [String],
    interests: [String],
    preferredGender: {
      type: String,
      enum: ['any', 'male', 'female']
    }
  },
  
  // Matching
  matches: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchScore: Number,
    status: {
      type: String,
      enum: ['suggested', 'contacted', 'accepted', 'declined', 'blocked'],
      default: 'suggested'
    },
    matchedAt: Date,
    responseAt: Date
  }],
  
  // Current Buddy
  currentBuddy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pairedAt: Date,
    status: {
      type: String,
      enum: ['active', 'paused', 'ended'],
      default: 'active'
    },
    sessionCount: {
      type: Number,
      default: 0
    },
    lastSession: Date
  },
  
  // Request Status
  status: {
    type: String,
    enum: ['active', 'matched', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
communitySchema.index({ language: 1, cefrLevel: 1 });
communitySchema.index({ type: 1, visibility: 1 });
communitySchema.index({ 'members.user': 1 });

postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, status: 1 });
postSchema.index({ tags: 1 });

postReplySchema.index({ post: 1, createdAt: 1 });
postReplySchema.index({ author: 1 });

languageBuddySchema.index({ requester: 1 });
languageBuddySchema.index({ 'preferences.learningLanguage': 1 });
languageBuddySchema.index({ status: 1 });

// Virtual methods
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Methods
communitySchema.methods.addMember = function(userId) {
  if (!this.members.find(member => member.user.equals(userId))) {
    this.members.push({ user: userId });
    this.stats.totalMembers += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => !member.user.equals(userId));
  this.stats.totalMembers = this.members.length;
  return this.save();
};

postSchema.methods.addLike = function(userId) {
  if (!this.likes.find(like => like.user.equals(userId))) {
    this.likes.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => !like.user.equals(userId));
  return this.save();
};

// Static methods
communitySchema.statics.getByLanguage = function(languageCode) {
  return this.find({
    'language.code': languageCode,
    status: 'active'
  }).populate('moderators.user', 'name avatar');
};

postSchema.statics.getFeedForUser = function(userId, communities, page = 1, limit = 20) {
  return this.find({
    community: { $in: communities },
    status: 'published'
  })
  .populate('author', 'name avatar')
  .populate('community', 'name')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

languageBuddySchema.statics.findMatches = function(requesterId, preferences) {
  // Complex matching algorithm would go here
  // For now, simple matching based on language and level
  return this.find({
    requester: { $ne: requesterId },
    'preferences.learningLanguage': preferences.learningLanguage,
    'preferences.currentLevel': preferences.currentLevel,
    status: 'active'
  }).limit(10);
};

export default mongoose.model('Community', communitySchema);

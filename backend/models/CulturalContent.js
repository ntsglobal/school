import mongoose from 'mongoose';

const culturalContentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Language and Region
  language: {
    type: String,
    required: true,
    ref: 'Language'
  },
  region: {
    type: String,
    required: true
  },
  
  // Content Classification
  category: {
    type: String,
    required: true,
    enum: ['festivals', 'food', 'etiquette', 'history', 'arts', 'lifestyle']
  },
  subcategory: {
    type: String,
    required: true
  },
  tags: [String],
  
  // Content Details
  content: {
    // Text Content
    text: {
      type: String,
      required: true
    },
    summary: String,
    keyPoints: [String],
    
    // Rich Media
    images: [{
      url: String,
      caption: String,
      alt: String,
      credit: String
    }],
    videos: [{
      url: String,
      title: String,
      duration: Number, // in seconds
      thumbnail: String,
      subtitles: [{
        language: String,
        url: String
      }]
    }],
    audio: [{
      url: String,
      title: String,
      duration: Number,
      transcript: String
    }],
    
    // Interactive Elements
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    vocabulary: [{
      word: String,
      translation: String,
      pronunciation: String,
      example: String,
      audioUrl: String
    }],
    phrases: [{
      phrase: String,
      meaning: String,
      context: String,
      audioUrl: String
    }]
  },
  
  // Learning Integration
  cefrLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true
  },
  gradeLevel: {
    type: Number,
    min: 6,
    max: 12
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedReadTime: {
    type: Number, // in minutes
    required: true
  },
  
  // Educational Objectives
  learningObjectives: [String],
  culturalInsights: [String],
  practicalApplications: [String],
  relatedTopics: [String],
  
  // Engagement
  interactiveElements: {
    hasQuiz: {
      type: Boolean,
      default: false
    },
    hasVocabulary: {
      type: Boolean,
      default: false
    },
    hasPhrases: {
      type: Boolean,
      default: false
    },
    hasAudio: {
      type: Boolean,
      default: false
    },
    hasVideo: {
      type: Boolean,
      default: false
    }
  },
  
  // Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Reviews and Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Content Management
  author: {
    name: String,
    bio: String,
    expertise: [String],
    avatar: String
  },
  editors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    editedAt: Date
  }],
  
  // Publication
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // SEO and Discovery
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },
  
  // Accessibility
  accessibility: {
    hasAltText: {
      type: Boolean,
      default: false
    },
    hasTranscripts: {
      type: Boolean,
      default: false
    },
    hasSubtitles: {
      type: Boolean,
      default: false
    },
    isScreenReaderFriendly: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
culturalContentSchema.index({ language: 1, category: 1 });
culturalContentSchema.index({ cefrLevel: 1, gradeLevel: 1 });
culturalContentSchema.index({ status: 1, publishedAt: -1 });
culturalContentSchema.index({ 'stats.views': -1 });
culturalContentSchema.index({ 'stats.averageRating': -1 });
culturalContentSchema.index({ tags: 1 });

// Virtual for engagement score
culturalContentSchema.virtual('engagementScore').get(function() {
  return (this.stats.views * 0.1) + 
         (this.stats.completions * 0.3) + 
         (this.stats.likes * 0.2) + 
         (this.stats.shares * 0.3) + 
         (this.stats.averageRating * 0.1);
});

// Methods
culturalContentSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

culturalContentSchema.methods.incrementCompletions = function() {
  this.stats.completions += 1;
  return this.save();
};

culturalContentSchema.methods.addRating = function(rating) {
  const totalScore = this.stats.averageRating * this.stats.totalRatings + rating;
  this.stats.totalRatings += 1;
  this.stats.averageRating = totalScore / this.stats.totalRatings;
  return this.save();
};

culturalContentSchema.methods.getRelatedContent = function(limit = 5) {
  return this.constructor.find({
    _id: { $ne: this._id },
    language: this.language,
    category: this.category,
    status: 'published'
  }).limit(limit).sort({ 'stats.views': -1 });
};

// Static methods
culturalContentSchema.statics.getByLanguageAndCategory = function(language, category) {
  return this.find({ 
    language, 
    category, 
    status: 'published' 
  }).sort({ 'stats.averageRating': -1, 'stats.views': -1 });
};

culturalContentSchema.statics.getPopularContent = function(language, limit = 10) {
  return this.find({ 
    language, 
    status: 'published' 
  }).sort({ 'stats.views': -1 }).limit(limit);
};

culturalContentSchema.statics.getRecommendedContent = function(language, cefrLevel, gradeLevel) {
  return this.find({
    language,
    cefrLevel,
    gradeLevel: { $lte: gradeLevel + 1, $gte: gradeLevel - 1 },
    status: 'published'
  }).sort({ 'stats.averageRating': -1 }).limit(5);
};

export default mongoose.model('CulturalContent', culturalContentSchema);

import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  // Basic Language Info
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 3
  },
  name: {
    type: String,
    required: true
  },
  nativeName: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  
  // CEFR Levels
  cefrLevels: [{
    code: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true
    },
    name: String,
    description: String,
    skills: {
      listening: String,
      reading: String,
      speaking: String,
      writing: String
    },
    vocabulary: Number,
    duration: String,
    color: String
  }],
  
  // Cultural Information
  culturalRegions: [String],
  culturalCategories: [{
    id: String,
    name: String,
    icon: String,
    description: String,
    contentCount: {
      type: Number,
      default: 0
    }
  }],
  
  // Language Statistics
  stats: {
    totalLearners: {
      type: Number,
      default: 0
    },
    activeLearners: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    averageCompletionRate: {
      type: Number,
      default: 0
    }
  },
  
  // Content Configuration
  contentConfig: {
    hasAudio: {
      type: Boolean,
      default: true
    },
    hasVideo: {
      type: Boolean,
      default: true
    },
    hasSpeechRecognition: {
      type: Boolean,
      default: true
    },
    hasTextToSpeech: {
      type: Boolean,
      default: true
    },
    supportedVoices: [String]
  },
  
  // Learning Paths
  learningPaths: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    features: [String],
    estimatedDuration: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  launchDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes
// Removing duplicate index on code as it's already defined as unique in the schema
languageSchema.index({ isActive: 1 });
languageSchema.index({ isPopular: 1 });
languageSchema.index({ 'stats.totalLearners': -1 });

// Virtual for popularity score
languageSchema.virtual('popularityScore').get(function() {
  return (this.stats.totalLearners * 0.4) + 
         (this.stats.activeLearners * 0.3) + 
         (this.stats.averageCompletionRate * 0.3);
});

// Methods
languageSchema.methods.incrementLearners = function() {
  this.stats.totalLearners += 1;
  return this.save();
};

languageSchema.methods.updateActiveLearners = function(count) {
  this.stats.activeLearners = count;
  return this.save();
};

languageSchema.methods.getCefrLevel = function(code) {
  return this.cefrLevels.find(level => level.code === code);
};

languageSchema.methods.getLearningPath = function(pathId) {
  return this.learningPaths.find(path => path.id === pathId);
};

// Static methods
languageSchema.statics.getActiveLanguages = function() {
  return this.find({ isActive: true }).sort({ 'stats.totalLearners': -1 });
};

languageSchema.statics.getPopularLanguages = function() {
  return this.find({ isActive: true, isPopular: true }).sort({ 'stats.totalLearners': -1 });
};

languageSchema.statics.getLanguageByCode = function(code) {
  return this.findOne({ code: code.toLowerCase(), isActive: true });
};

export default mongoose.model('Language', languageSchema);

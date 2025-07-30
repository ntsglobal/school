import mongoose from 'mongoose';

const voiceAssessmentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Assessment Configuration
  language: {
    type: String,
    required: true,
    enum: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'es-MX', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN', 'ru-RU', 'ar-SA', 'hi-IN']
  },
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  grade: {
    type: String,
    enum: ['6', '7', '8', '9', '10', '11', '12']
  },
  
  // Assessment Type
  type: {
    type: String,
    required: true,
    enum: [
      'pronunciation',    // Pronunciation accuracy test
      'fluency',         // Fluency and speaking rate test
      'reading_aloud',   // Reading comprehension and pronunciation
      'conversation',    // Conversational speaking test
      'presentation',    // Structured presentation
      'storytelling',    // Creative storytelling
      'description',     // Picture/scenario description
      'roleplay'         // Role-playing scenarios
    ]
  },
  
  // Assessment Content
  content: {
    // Text to be read/spoken
    text: String,
    
    // Audio prompts
    audioPrompts: [{
      url: String,
      transcript: String,
      duration: Number
    }],
    
    // Visual prompts (for description tasks)
    imagePrompts: [{
      url: String,
      description: String,
      keywords: [String]
    }],
    
    // Conversation prompts
    conversationPrompts: [{
      question: String,
      expectedResponse: String,
      followUpQuestions: [String]
    }],
    
    // Role-play scenarios
    rolePlayScenarios: [{
      scenario: String,
      role: String,
      context: String,
      objectives: [String]
    }]
  },
  
  // Scoring Criteria
  scoringCriteria: {
    pronunciation: {
      weight: {
        type: Number,
        default: 25,
        min: 0,
        max: 100
      },
      rubric: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          excellent: { min: 90, description: 'Clear, accurate pronunciation with natural rhythm' },
          good: { min: 75, description: 'Generally clear with minor pronunciation errors' },
          satisfactory: { min: 60, description: 'Understandable with some pronunciation issues' },
          needsImprovement: { min: 0, description: 'Frequent pronunciation errors affecting clarity' }
        }
      }
    },
    fluency: {
      weight: {
        type: Number,
        default: 25,
        min: 0,
        max: 100
      },
      rubric: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          excellent: { min: 90, description: 'Natural flow with appropriate pace and rhythm' },
          good: { min: 75, description: 'Generally smooth with minor hesitations' },
          satisfactory: { min: 60, description: 'Some hesitations but maintains communication' },
          needsImprovement: { min: 0, description: 'Frequent pauses and hesitations' }
        }
      }
    },
    vocabulary: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      rubric: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          excellent: { min: 90, description: 'Rich, varied vocabulary used appropriately' },
          good: { min: 75, description: 'Good vocabulary range with minor errors' },
          satisfactory: { min: 60, description: 'Adequate vocabulary for the task' },
          needsImprovement: { min: 0, description: 'Limited vocabulary affecting communication' }
        }
      }
    },
    grammar: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      rubric: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          excellent: { min: 90, description: 'Accurate grammar with complex structures' },
          good: { min: 75, description: 'Generally accurate with minor errors' },
          satisfactory: { min: 60, description: 'Basic grammar mostly correct' },
          needsImprovement: { min: 0, description: 'Frequent grammar errors' }
        }
      }
    },
    coherence: {
      weight: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
      },
      rubric: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          excellent: { min: 90, description: 'Well-organized, logical flow of ideas' },
          good: { min: 75, description: 'Generally well-organized with clear connections' },
          satisfactory: { min: 60, description: 'Basic organization with some unclear connections' },
          needsImprovement: { min: 0, description: 'Poor organization, difficult to follow' }
        }
      }
    }
  },
  
  // Assessment Settings
  settings: {
    timeLimit: {
      type: Number, // in seconds
      default: 300
    },
    preparationTime: {
      type: Number, // in seconds
      default: 60
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    recordingQuality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    autoGrading: {
      type: Boolean,
      default: true
    },
    manualReview: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Voice Assessment Attempt Schema
const voiceAssessmentAttemptSchema = new mongoose.Schema({
  // Assessment and User
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAssessment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Attempt Details
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Recording Information
  audioFile: {
    url: String,
    filename: String,
    duration: Number, // in seconds
    fileSize: Number, // in bytes
    format: String
  },
  
  // Transcription
  transcription: {
    automatic: String, // AI-generated transcription
    manual: String,    // Human-corrected transcription
    confidence: Number // Transcription confidence score
  },
  
  // Scoring
  scores: {
    pronunciation: {
      score: { type: Number, min: 0, max: 100 },
      feedback: String,
      details: {
        accuracy: Number,
        clarity: Number,
        naturalness: Number,
        wordErrors: [{
          word: String,
          expected: String,
          actual: String,
          severity: { type: String, enum: ['low', 'medium', 'high'] }
        }],
        phonemeErrors: [{
          phoneme: String,
          position: String,
          feedback: String
        }]
      }
    },
    fluency: {
      score: { type: Number, min: 0, max: 100 },
      feedback: String,
      details: {
        speakingRate: Number, // words per minute
        pauseFrequency: Number,
        hesitations: Number,
        repetitions: Number,
        fillers: Number
      }
    },
    vocabulary: {
      score: { type: Number, min: 0, max: 100 },
      feedback: String,
      details: {
        range: Number,
        accuracy: Number,
        appropriateness: Number,
        complexity: Number
      }
    },
    grammar: {
      score: { type: Number, min: 0, max: 100 },
      feedback: String,
      details: {
        accuracy: Number,
        complexity: Number,
        errors: [{
          type: String,
          description: String,
          suggestion: String
        }]
      }
    },
    coherence: {
      score: { type: Number, min: 0, max: 100 },
      feedback: String,
      details: {
        organization: Number,
        connectivity: Number,
        relevance: Number
      }
    },
    overall: {
      score: { type: Number, min: 0, max: 100 },
      grade: { type: String, enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'] },
      feedback: String
    }
  },
  
  // Analysis Results
  analysis: {
    duration: Number,
    wordCount: Number,
    uniqueWords: Number,
    averageWordLength: Number,
    sentenceCount: Number,
    averageSentenceLength: Number,
    complexityScore: Number,
    confidenceLevel: Number
  },
  
  // Improvement Suggestions
  improvements: [{
    category: { type: String, enum: ['pronunciation', 'fluency', 'vocabulary', 'grammar', 'coherence'] },
    priority: { type: String, enum: ['high', 'medium', 'low'] },
    suggestion: String,
    exercises: [String],
    resources: [String]
  }],
  
  // Status and Timing
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed', 'under_review'],
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Metadata
  deviceInfo: {
    userAgent: String,
    platform: String,
    microphone: String
  },
  networkInfo: {
    connectionType: String,
    bandwidth: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
voiceAssessmentSchema.index({ language: 1, level: 1, type: 1 });
voiceAssessmentSchema.index({ createdBy: 1, isActive: 1 });
voiceAssessmentSchema.index({ courseId: 1, lessonId: 1 });

voiceAssessmentAttemptSchema.index({ assessmentId: 1, userId: 1 });
voiceAssessmentAttemptSchema.index({ userId: 1, status: 1 });
voiceAssessmentAttemptSchema.index({ 'scores.overall.score': -1 });

// Virtual for total weight validation
voiceAssessmentSchema.virtual('totalWeight').get(function() {
  const criteria = this.scoringCriteria;
  return (criteria.pronunciation?.weight || 0) +
         (criteria.fluency?.weight || 0) +
         (criteria.vocabulary?.weight || 0) +
         (criteria.grammar?.weight || 0) +
         (criteria.coherence?.weight || 0);
});

// Methods for VoiceAssessment
voiceAssessmentSchema.methods.calculateWeightedScore = function(scores) {
  const criteria = this.scoringCriteria;
  const totalWeight = this.totalWeight;
  
  if (totalWeight === 0) return 0;
  
  const weightedScore = 
    (scores.pronunciation * (criteria.pronunciation?.weight || 0) +
     scores.fluency * (criteria.fluency?.weight || 0) +
     scores.vocabulary * (criteria.vocabulary?.weight || 0) +
     scores.grammar * (criteria.grammar?.weight || 0) +
     scores.coherence * (criteria.coherence?.weight || 0)) / totalWeight;
  
  return Math.round(weightedScore);
};

voiceAssessmentSchema.methods.getGradeFromScore = function(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
};

// Methods for VoiceAssessmentAttempt
voiceAssessmentAttemptSchema.methods.calculateOverallScore = function() {
  const assessment = this.assessmentId;
  if (!assessment) return 0;
  
  const scores = {
    pronunciation: this.scores.pronunciation?.score || 0,
    fluency: this.scores.fluency?.score || 0,
    vocabulary: this.scores.vocabulary?.score || 0,
    grammar: this.scores.grammar?.score || 0,
    coherence: this.scores.coherence?.score || 0
  };
  
  return assessment.calculateWeightedScore(scores);
};

// Static methods
voiceAssessmentSchema.statics.getByLanguageAndLevel = function(language, level) {
  return this.find({ 
    language, 
    level, 
    isActive: true, 
    isPublished: true 
  }).sort({ createdAt: -1 });
};

voiceAssessmentAttemptSchema.statics.getUserAttempts = function(userId, assessmentId = null) {
  const query = { userId };
  if (assessmentId) query.assessmentId = assessmentId;
  
  return this.find(query)
    .populate('assessmentId', 'title type language level')
    .sort({ createdAt: -1 });
};

voiceAssessmentAttemptSchema.statics.getTopScores = function(assessmentId, limit = 10) {
  return this.find({ 
    assessmentId, 
    status: 'completed' 
  })
    .populate('userId', 'firstName lastName avatar')
    .sort({ 'scores.overall.score': -1 })
    .limit(limit);
};

const VoiceAssessment = mongoose.model('VoiceAssessment', voiceAssessmentSchema);
const VoiceAssessmentAttempt = mongoose.model('VoiceAssessmentAttempt', voiceAssessmentAttemptSchema);

export { VoiceAssessment, VoiceAssessmentAttempt };
export default VoiceAssessment;

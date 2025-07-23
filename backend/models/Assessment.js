import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Association
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  
  // Assessment Type
  type: {
    type: String,
    required: true,
    enum: ['quiz', 'assignment', 'speaking', 'listening', 'writing', 'reading', 'comprehensive']
  },
  
  // Configuration
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  
  // Questions
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'matching', 'essay', 'speaking', 'listening']
    },
    question: {
      type: String,
      required: true
    },
    options: [String], // For multiple choice
    correctAnswer: mongoose.Schema.Types.Mixed,
    points: {
      type: Number,
      default: 1
    },
    explanation: String,
    hints: [String],
    
    // Media attachments
    audioUrl: String,
    imageUrl: String,
    videoUrl: String,
    
    // Speaking/Listening specific
    expectedResponse: String,
    pronunciationTargets: [String],
    
    // Difficulty and metadata
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [String],
    estimatedTime: Number // in seconds
  }],
  
  // Grading Configuration
  grading: {
    autoGrade: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showExplanations: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeOptions: {
      type: Boolean,
      default: false
    }
  },
  
  // Availability
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: Date,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Analytics
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    },
    questionAnalytics: [{
      questionId: String,
      correctAnswers: Number,
      totalAnswers: Number,
      averageTime: Number
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Assessment Attempt Schema
const assessmentAttemptSchema = new mongoose.Schema({
  // Assessment and User
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Attempt Information
  attemptNumber: {
    type: Number,
    required: true
  },
  
  // Timing
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  
  // Answers
  answers: [{
    questionId: String,
    userAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    points: Number,
    timeSpent: Number, // in seconds
    feedback: String
  }],
  
  // Results
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  earnedPoints: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded', 'expired'],
    default: 'in-progress'
  },
  
  // Feedback
  overallFeedback: String,
  teacherComments: String,
  
  // Grading
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date,
  autoGraded: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assessmentSchema.index({ courseId: 1, status: 1 });
assessmentSchema.index({ lessonId: 1 });
assessmentSchema.index({ createdBy: 1 });
assessmentSchema.index({ type: 1 });
assessmentSchema.index({ availableFrom: 1, availableUntil: 1 });

assessmentAttemptSchema.index({ assessmentId: 1, userId: 1 });
assessmentAttemptSchema.index({ userId: 1, submittedAt: -1 });
assessmentAttemptSchema.index({ status: 1 });

// Virtual for total points
assessmentSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

// Virtual for question count
assessmentSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Virtual for estimated duration
assessmentSchema.virtual('estimatedDuration').get(function() {
  const questionTime = this.questions.reduce((sum, q) => sum + (q.estimatedTime || 60), 0);
  return Math.max(questionTime / 60, this.timeLimit); // in minutes
});

// Methods for Assessment
assessmentSchema.methods.isAvailable = function() {
  const now = new Date();
  return this.status === 'published' && 
         this.isActive && 
         this.availableFrom <= now && 
         (!this.availableUntil || this.availableUntil >= now);
};

assessmentSchema.methods.canUserAttempt = async function(userId) {
  const attemptCount = await AssessmentAttempt.countDocuments({
    assessmentId: this._id,
    userId: userId
  });
  
  return attemptCount < this.maxAttempts;
};

assessmentSchema.methods.getUserBestScore = async function(userId) {
  const bestAttempt = await AssessmentAttempt.findOne({
    assessmentId: this._id,
    userId: userId,
    status: 'graded'
  }).sort({ score: -1 });
  
  return bestAttempt ? bestAttempt.score : 0;
};

// Methods for Assessment Attempt
assessmentAttemptSchema.methods.calculateScore = function() {
  const totalPoints = this.answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
  const maxPoints = this.totalPoints || 1;
  this.score = Math.round((totalPoints / maxPoints) * 100);
  this.earnedPoints = totalPoints;
  this.passed = this.score >= (this.assessmentId?.passingScore || 70);
  return this.score;
};

assessmentAttemptSchema.methods.submitAttempt = function() {
  this.submittedAt = new Date();
  this.status = this.autoGraded ? 'graded' : 'submitted';
  this.timeSpent = Math.round((this.submittedAt - this.startedAt) / 1000);
  return this.calculateScore();
};

// Static methods
assessmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ 
    courseId, 
    status: 'published', 
    isActive: true 
  }).sort({ createdAt: -1 });
};

assessmentSchema.statics.findByLesson = function(lessonId) {
  return this.find({ 
    lessonId, 
    status: 'published', 
    isActive: true 
  }).sort({ createdAt: -1 });
};

assessmentAttemptSchema.statics.getUserAttempts = function(userId, assessmentId) {
  return this.find({ userId, assessmentId })
    .sort({ attemptNumber: -1 });
};

const Assessment = mongoose.model('Assessment', assessmentSchema);
const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);

export { Assessment, AssessmentAttempt };
export default Assessment;

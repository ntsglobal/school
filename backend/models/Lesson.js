import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
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
  
  // Course Association
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Lesson Structure
  order: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'interactive', 'quiz', 'speaking', 'listening', 'reading', 'writing']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  // Content
  content: {
    // Video lessons
    videoUrl: String,
    videoThumbnail: String,
    videoDuration: Number,
    
    // Interactive content
    interactiveContent: mongoose.Schema.Types.Mixed,
    
    // Text content
    textContent: String,
    
    // Audio content
    audioUrl: String,
    audioDuration: Number,
    
    // Images
    images: [String],
    
    // Documents
    documents: [{
      title: String,
      url: String,
      type: String
    }]
  },
  
  // Learning Objectives
  objectives: [String],
  vocabulary: [{
    word: String,
    translation: String,
    pronunciation: String,
    audioUrl: String,
    example: String
  }],
  
  // Activities
  activities: [{
    type: {
      type: String,
      enum: ['quiz', 'exercise', 'speaking', 'listening', 'writing', 'pronunciation']
    },
    title: String,
    description: String,
    content: mongoose.Schema.Types.Mixed,
    points: {
      type: Number,
      default: 10
    },
    timeLimit: Number, // in minutes
    attempts: {
      type: Number,
      default: 3
    }
  }],
  
  // Quiz/Assessment
  quiz: {
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'fill-blank', 'matching', 'speaking', 'listening']
      },
      options: [String],
      correctAnswer: mongoose.Schema.Types.Mixed,
      explanation: String,
      points: {
        type: Number,
        default: 1
      },
      audioUrl: String, // for listening questions
      imageUrl: String
    }],
    passingScore: {
      type: Number,
      default: 70
    },
    timeLimit: Number, // in minutes
    attempts: {
      type: Number,
      default: 3
    }
  },
  
  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  
  // AI Features
  speechRecognition: {
    enabled: {
      type: Boolean,
      default: false
    },
    targetPhrases: [String],
    pronunciationTargets: [{
      word: String,
      phonetic: String,
      audioUrl: String
    }]
  },
  
  // Gamification
  points: {
    completion: {
      type: Number,
      default: 50
    },
    perfectScore: {
      type: Number,
      default: 100
    },
    firstAttempt: {
      type: Number,
      default: 25
    }
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    condition: String
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  totalCompletions: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ type: 1 });
lessonSchema.index({ isActive: 1, isPublished: 1 });
lessonSchema.index({ createdAt: -1 });

// Virtual for total points available
lessonSchema.virtual('totalPoints').get(function() {
  let total = this.points.completion;
  if (this.quiz && this.quiz.questions) {
    total += this.quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
  if (this.activities) {
    total += this.activities.reduce((sum, a) => sum + (a.points || 10), 0);
  }
  return total;
});

// Virtual for estimated completion time
lessonSchema.virtual('estimatedTime').get(function() {
  let time = this.duration;
  if (this.quiz && this.quiz.timeLimit) {
    time += this.quiz.timeLimit;
  }
  if (this.activities) {
    time += this.activities.reduce((sum, a) => sum + (a.timeLimit || 5), 0);
  }
  return time;
});

// Methods
lessonSchema.methods.getNextLesson = async function() {
  return await this.constructor.findOne({
    courseId: this.courseId,
    order: this.order + 1,
    isActive: true,
    isPublished: true
  });
};

lessonSchema.methods.getPreviousLesson = async function() {
  return await this.constructor.findOne({
    courseId: this.courseId,
    order: this.order - 1,
    isActive: true,
    isPublished: true
  });
};

// Static methods
lessonSchema.statics.findByCourse = function(courseId) {
  return this.find({ 
    courseId, 
    isActive: true, 
    isPublished: true 
  }).sort({ order: 1 });
};

lessonSchema.statics.findByType = function(type) {
  return this.find({ 
    type, 
    isActive: true, 
    isPublished: true 
  });
};

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;

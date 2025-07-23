import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
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
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Language & Level
  language: {
    type: String,
    required: true,
    enum: ['french', 'japanese', 'german', 'spanish', 'korean']
  },
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1'] // CEFR levels
  },
  
  // Academic Mapping
  grade: {
    type: Number,
    required: true,
    min: 6,
    max: 10
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'International', 'All'],
    default: 'All'
  },
  
  // Course Structure
  totalLessons: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number, // in hours
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  
  // Content
  thumbnail: {
    type: String,
    default: null
  },
  trailer: {
    type: String, // video URL
    default: null
  },
  syllabus: [{
    module: String,
    topics: [String],
    duration: Number // in hours
  }],
  
  // Learning Objectives
  objectives: [String],
  prerequisites: [String],
  skills: [String], // Skills students will learn
  
  // Instructor Information
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coInstructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Enrollment
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedAt: Date,
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],
  
  // Pricing
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  discountPrice: Number,
  
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
  
  // Cultural Content
  culturalModules: [{
    title: String,
    description: String,
    content: String,
    mediaUrl: String,
    type: {
      type: String,
      enum: ['festival', 'food', 'etiquette', 'history', 'tradition']
    }
  }],
  
  // Analytics
  totalEnrollments: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tags: [String],
  
  // Timestamps
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes (slug already has unique: true, so no need for manual index)
courseSchema.index({ language: 1, level: 1 });
courseSchema.index({ grade: 1 });
courseSchema.index({ status: 1, isActive: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ 'enrolledStudents.student': 1 });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.enrolledStudents.length === 0) return 0;
  const completed = this.enrolledStudents.filter(enrollment => 
    enrollment.progress === 100
  ).length;
  return (completed / this.enrolledStudents.length) * 100;
});

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Methods
courseSchema.methods.isEnrolled = function(studentId) {
  return this.enrolledStudents.some(enrollment => 
    enrollment.student.toString() === studentId.toString()
  );
};

courseSchema.methods.getStudentProgress = function(studentId) {
  const enrollment = this.enrolledStudents.find(enrollment => 
    enrollment.student.toString() === studentId.toString()
  );
  return enrollment ? enrollment.progress : 0;
};

// Static methods
courseSchema.statics.findByLanguageAndLevel = function(language, level) {
  return this.find({ language, level, status: 'published', isActive: true });
};

courseSchema.statics.findByGrade = function(grade) {
  return this.find({ grade, status: 'published', isActive: true });
};

const Course = mongoose.model('Course', courseSchema);

export default Course;

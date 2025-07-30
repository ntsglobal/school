import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Firebase Authentication
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Authentication Provider
  authProvider: {
    type: String,
    enum: ['password', 'google', 'facebook'],
    default: 'password'
  },
  
  // Previous authentication provider (for tracking changes)
  lastAuthProvider: {
    type: String,
    enum: ['password', 'google', 'facebook', null],
    default: null
  },
  
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Role-based Access
  role: {
    type: String,
    enum: ['user', 'student', 'teacher', 'parent', 'admin'],
    required: true,
    default: 'user' // Changed default to 'user' which has fewer requirements
  },
  
  // Onboarding Status
  needsOnboarding: {
    type: Boolean,
    default: true
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  
  // Academic Information (for students)
  grade: {
    type: Number,
    min: 6,
    max: 10,
    required: function() { 
      // Only required for students who have completed onboarding
      return this.role === 'student' && !this.needsOnboarding; 
    }
  },
  school: {
    type: String,
    trim: true
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'International', 'Other'],
    required: function() { 
      // Only required for students who have completed onboarding
      return this.role === 'student' && !this.needsOnboarding; 
    }
  },
  
  // Language Preferences
  nativeLanguage: {
    type: String,
    default: 'english'
  },
  preferredLanguages: [{
    type: String,
    enum: ['french', 'japanese', 'german', 'spanish', 'korean']
  }],
  
  // Relationships
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow students to register without parent initially
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignedTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  
  // Password Reset Tracking
  lastPasswordReset: {
    type: Date
  },
  lastPasswordResetRequest: {
    type: Date
  },
  
  // Linked Accounts (for cross-provider authentication)
  linkedAccounts: [{
    firebaseUid: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: ['password', 'google', 'facebook'],
      required: true
    },
    email: {
      type: String,
      required: true
    },
    linkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // For secondary accounts linked to a primary account
  isLinkedTo: {
    type: String,
    default: null
  },
  
  // Subscription & Payment
  subscriptionType: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date
  },
  
  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'english'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes (only for fields that don't have unique: true)
userSchema.index({ role: 1 });
userSchema.index({ grade: 1 });
userSchema.index({ parentId: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Methods
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.firebaseUid; // Don't expose Firebase UID in API responses
  return user;
};

userSchema.methods.isSubscriptionActive = function() {
  if (this.subscriptionType === 'free') return true;
  return this.subscriptionExpiry && this.subscriptionExpiry > new Date();
};

// Static methods
userSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid });
};

userSchema.statics.findStudentsByParent = function(parentId) {
  return this.find({ parentId, role: 'student' });
};

userSchema.statics.findTeachers = function() {
  return this.find({ role: 'teacher', isActive: true });
};

const User = mongoose.model('User', userSchema);

export default User;

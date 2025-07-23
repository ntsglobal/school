import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema({
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
  
  // Language and Level
  language: {
    type: String,
    required: true,
    enum: ['french', 'japanese', 'german', 'spanish', 'korean']
  },
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1']
  },
  
  // Instructor
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coInstructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Scheduling
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 180
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Capacity
  maxParticipants: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 10
  },
  
  // Participants
  participants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'missed', 'cancelled'],
      default: 'registered'
    },
    attendanceTime: Number, // minutes attended
    videoStatus: {
      hasJoined: {
        type: Boolean,
        default: false
      },
      joinedVideoAt: Date,
      leftVideoAt: Date,
      lastActivity: Date,
      mediaState: {
        video: {
          type: Boolean,
          default: true
        },
        audio: {
          type: Boolean,
          default: true
        },
        screenShare: {
          type: Boolean,
          default: false
        }
      }
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    }
  }],
  
  // Class Content
  topics: [String],
  objectives: [String],
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'link', 'image']
    },
    url: String,
    description: String
  }],
  
  // Video Conference
  meetingDetails: {
    platform: {
      type: String,
      enum: ['zoom', 'google-meet', 'custom'],
      default: 'zoom'
    },
    meetingId: String,
    meetingUrl: String,
    password: String,
    recordingUrl: String,
    recordingPassword: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Class Flow
  startedAt: Date,
  endedAt: Date,
  actualDuration: Number, // actual duration in minutes
  
  // Recording and Resources
  isRecorded: {
    type: Boolean,
    default: true
  },
  recordingAvailable: {
    type: Boolean,
    default: false
  },
  
  // Homework and Follow-up
  homework: {
    title: String,
    description: String,
    dueDate: Date,
    materials: [{
      title: String,
      url: String,
      type: String
    }]
  },
  
  // Analytics
  analytics: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    actualAttendees: {
      type: Number,
      default: 0
    },
    averageAttendanceTime: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    }
  },
  
  // Recurring Class Settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: Number, // every X days/weeks/months
    daysOfWeek: [Number], // 0-6 for Sunday-Saturday
    endDate: Date,
    maxOccurrences: Number
  },
  parentClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  },
  
  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Pricing (for premium classes)
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Notifications
  remindersSent: {
    oneDayBefore: {
      type: Boolean,
      default: false
    },
    oneHourBefore: {
      type: Boolean,
      default: false
    },
    fifteenMinutesBefore: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
liveClassSchema.index({ scheduledAt: 1 });
liveClassSchema.index({ instructor: 1 });
liveClassSchema.index({ language: 1, level: 1 });
liveClassSchema.index({ status: 1 });
liveClassSchema.index({ 'participants.student': 1 });
liveClassSchema.index({ createdAt: -1 });

// Virtual for available spots
liveClassSchema.virtual('availableSpots').get(function() {
  return this.maxParticipants - this.participants.length;
});

// Virtual for is full
liveClassSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.maxParticipants;
});

// Virtual for is upcoming
liveClassSchema.virtual('isUpcoming').get(function() {
  return this.scheduledAt > new Date() && this.status === 'scheduled';
});

// Virtual for is past
liveClassSchema.virtual('isPast').get(function() {
  return this.scheduledAt < new Date() || this.status === 'completed';
});

// Methods
liveClassSchema.methods.addParticipant = function(studentId) {
  if (this.isFull) {
    throw new Error('Class is full');
  }
  
  const existingParticipant = this.participants.find(p => 
    p.student.toString() === studentId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('Student already registered');
  }
  
  this.participants.push({
    student: studentId,
    joinedAt: new Date(),
    status: 'registered'
  });
  
  this.analytics.totalRegistrations = this.participants.length;
  return this.participants[this.participants.length - 1];
};

liveClassSchema.methods.removeParticipant = function(studentId) {
  const participantIndex = this.participants.findIndex(p => 
    p.student.toString() === studentId.toString()
  );
  
  if (participantIndex === -1) {
    throw new Error('Student not found in class');
  }
  
  this.participants.splice(participantIndex, 1);
  this.analytics.totalRegistrations = this.participants.length;
  return true;
};

liveClassSchema.methods.markAttendance = function(studentId, attendanceTime) {
  const participant = this.participants.find(p => 
    p.student.toString() === studentId.toString()
  );
  
  if (!participant) {
    throw new Error('Student not registered for this class');
  }
  
  participant.status = 'attended';
  participant.attendanceTime = attendanceTime;
  
  // Update analytics
  this.analytics.actualAttendees = this.participants.filter(p => 
    p.status === 'attended'
  ).length;
  
  const totalAttendanceTime = this.participants
    .filter(p => p.attendanceTime)
    .reduce((sum, p) => sum + p.attendanceTime, 0);
  
  this.analytics.averageAttendanceTime = totalAttendanceTime / this.analytics.actualAttendees;
  
  return participant;
};

// Static methods
liveClassSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    scheduledAt: { $gt: new Date() },
    status: 'scheduled'
  })
  .populate('instructor', 'firstName lastName')
  .sort({ scheduledAt: 1 })
  .limit(limit);
};

liveClassSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId })
    .populate('participants.student', 'firstName lastName')
    .sort({ scheduledAt: -1 });
};

liveClassSchema.statics.findByStudent = function(studentId) {
  return this.find({ 'participants.student': studentId })
    .populate('instructor', 'firstName lastName')
    .sort({ scheduledAt: -1 });
};

const LiveClass = mongoose.model('LiveClass', liveClassSchema);

export default LiveClass;

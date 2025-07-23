import mongoose from 'mongoose';

const buddyConnectionSchema = new mongoose.Schema({
  // Connection Details
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Connection Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked', 'ended'],
    default: 'pending'
  },
  
  // Connection Metadata
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  
  // Connection Details
  language: {
    type: String,
    enum: ['french', 'japanese', 'german', 'spanish', 'korean', 'chinese', 'italian', 'russian'],
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Communication History
  lastMessageAt: {
    type: Date
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  sessionCount: {
    type: Number,
    default: 0
  },
  
  // Ratings and Feedback
  requesterRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: 500
    },
    ratedAt: Date
  },
  receiverRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: 500
    },
    ratedAt: Date
  },
  
  // Connection Notes
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Learning Progress Together
  sharedGoals: [{
    goal: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // Activity Tracking
  activityLog: [{
    action: {
      type: String,
      enum: ['message_sent', 'session_started', 'session_ended', 'goal_set', 'goal_completed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes
buddyConnectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });
buddyConnectionSchema.index({ status: 1 });
buddyConnectionSchema.index({ language: 1 });
buddyConnectionSchema.index({ requestedAt: -1 });

// Compound indexes for efficient queries
buddyConnectionSchema.index({ requester: 1, status: 1 });
buddyConnectionSchema.index({ receiver: 1, status: 1 });

// Instance methods
buddyConnectionSchema.methods.accept = function() {
  this.status = 'accepted';
  this.respondedAt = new Date();
  return this.save();
};

buddyConnectionSchema.methods.decline = function() {
  this.status = 'declined';
  this.respondedAt = new Date();
  return this.save();
};

buddyConnectionSchema.methods.end = function(reason = '') {
  this.status = 'ended';
  this.endedAt = new Date();
  if (reason) {
    this.notes = (this.notes || '') + `\nEnded: ${reason}`;
  }
  return this.save();
};

buddyConnectionSchema.methods.addActivity = function(action, userId, details = {}) {
  this.activityLog.push({
    action,
    userId,
    details,
    timestamp: new Date()
  });
  
  // Update relevant counters
  if (action === 'message_sent') {
    this.totalMessages += 1;
    this.lastMessageAt = new Date();
  } else if (action === 'session_started') {
    this.sessionCount += 1;
  }
  
  return this.save();
};

buddyConnectionSchema.methods.rate = function(raterId, rating, feedback = '') {
  const isRequester = this.requester.toString() === raterId.toString();
  
  if (isRequester) {
    this.requesterRating = {
      rating,
      feedback,
      ratedAt: new Date()
    };
  } else {
    this.receiverRating = {
      rating,
      feedback,
      ratedAt: new Date()
    };
  }
  
  return this.save();
};

// Static methods
buddyConnectionSchema.statics.findUserConnections = function(userId, status = null) {
  const query = {
    $or: [
      { requester: userId },
      { receiver: userId }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('requester', 'firstName lastName avatar grade')
    .populate('receiver', 'firstName lastName avatar grade')
    .sort({ requestedAt: -1 });
};

buddyConnectionSchema.statics.getConnectionBetween = function(userId1, userId2) {
  return this.findOne({
    $or: [
      { requester: userId1, receiver: userId2 },
      { requester: userId2, receiver: userId1 }
    ]
  });
};

buddyConnectionSchema.statics.getUserStats = async function(userId) {
  const connections = await this.find({
    $or: [
      { requester: userId },
      { receiver: userId }
    ]
  });
  
  const stats = {
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.status === 'accepted').length,
    pendingRequests: connections.filter(c => c.status === 'pending' && c.receiver.toString() === userId.toString()).length,
    sentRequests: connections.filter(c => c.status === 'pending' && c.requester.toString() === userId.toString()).length,
    totalSessions: connections.reduce((sum, c) => sum + c.sessionCount, 0),
    totalMessages: connections.reduce((sum, c) => sum + c.totalMessages, 0),
    averageRating: 0
  };
  
  // Calculate average rating
  const ratings = [];
  connections.forEach(c => {
    if (c.requester.toString() === userId.toString() && c.receiverRating.rating) {
      ratings.push(c.receiverRating.rating);
    } else if (c.receiver.toString() === userId.toString() && c.requesterRating.rating) {
      ratings.push(c.requesterRating.rating);
    }
  });
  
  if (ratings.length > 0) {
    stats.averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }
  
  return stats;
};

export default mongoose.model('BuddyConnection', buddyConnectionSchema);

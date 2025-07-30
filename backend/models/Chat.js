import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  // Chat Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Chat Type
  type: {
    type: String,
    enum: ['direct', 'group', 'teacher-support', 'class-discussion'],
    required: true,
    default: 'direct'
  },
  
  // Chat Metadata
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Language Context
  language: {
    type: String,
    enum: ['french', 'japanese', 'german', 'spanish', 'korean', 'english'],
    default: 'english'
  },
  
  // Teacher Support Specific
  supportRequest: {
    subject: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['grammar', 'pronunciation', 'vocabulary', 'conversation', 'homework', 'technical', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed'],
      default: 'pending'
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    sessionDuration: Number, // in minutes
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  
  // Class Discussion Specific
  classContext: {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveClass'
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }
  },
  
  // Chat Status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Last Activity
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Settings
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceMessages: {
      type: Boolean,
      default: true
    },
    autoTranslate: {
      type: Boolean,
      default: false
    },
    moderationEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics
  messageCount: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0 // in minutes
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Message Schema
const messageSchema = new mongoose.Schema({
  // Chat Association
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  
  // Sender
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message Content
  content: {
    text: String,
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'file', 'system', 'translation'],
      default: 'text'
    },
    
    // File attachments
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String,
      thumbnail: String
    }],
    
    // Audio messages
    audio: {
      url: String,
      duration: Number, // in seconds
      transcript: String,
      waveform: [Number] // for audio visualization
    },
    
    // Translation
    translation: {
      originalText: String,
      translatedText: String,
      sourceLanguage: String,
      targetLanguage: String,
      confidence: Number
    }
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Read Receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reply/Thread
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadId: String,
  
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Moderation
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // System Messages
  systemMessage: {
    type: {
      type: String,
      enum: ['user-joined', 'user-left', 'chat-created', 'teacher-assigned', 'session-started', 'session-ended']
    },
    data: mongoose.Schema.Types.Mixed
  },
  
  // AI Features
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    languageDetected: String,
    grammarSuggestions: [String],
    vocabularyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Chat
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ 'supportRequest.status': 1 });
chatSchema.index({ 'supportRequest.assignedTeacher': 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ createdAt: -1 });

// Indexes for Message
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Virtual for unread count
chatSchema.virtual('unreadCount').get(function() {
  // This would be calculated based on the user context
  return 0; // Placeholder
});

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

// Methods for Chat
chatSchema.methods.addParticipant = function(userId, role) {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
  
  if (existingParticipant) {
    throw new Error('User already in chat');
  }
  
  this.participants.push({
    user: userId,
    role: role,
    joinedAt: new Date(),
    isActive: true
  });
  
  return this.participants[this.participants.length - 1];
};

chatSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
  
  if (!participant) {
    throw new Error('User not found in chat');
  }
  
  participant.isActive = false;
  participant.leftAt = new Date();
  
  return true;
};

// Methods for Message
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => 
    r.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  
  return this.readBy;
};

// Static methods for Chat
chatSchema.statics.findUserChats = function(userId) {
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    isActive: true
  })
  .populate('participants.user', 'firstName lastName avatar')
  .populate('lastMessage')
  .sort({ lastActivity: -1 });
};

chatSchema.statics.findTeacherSupportRequests = function(status = 'pending') {
  return this.find({
    type: 'teacher-support',
    'supportRequest.status': status
  })
  .populate('participants.user', 'firstName lastName')
  .sort({ 'supportRequest.requestedAt': 1 });
};

// Static methods for Message
messageSchema.statics.findChatMessages = function(chatId, limit = 50, skip = 0) {
  return this.find({ 
    chatId, 
    isDeleted: false 
  })
  .populate('sender', 'firstName lastName avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

export { Chat, Message };
export default Chat;

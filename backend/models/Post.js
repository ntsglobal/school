import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  // Post Type
  type: {
    type: String,
    enum: ['forum', 'reply', 'buddy_request'],
    required: true
  },
  
  // Basic Info
  title: {
    type: String,
    required: function() { return this.type === 'forum'; }
  },
  content: {
    type: String,
    required: true
  },
  
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Language Association
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language'
  },
  
  // Forum Post Fields
  category: {
    type: String,
    required: function() { return this.type === 'forum'; }
  },
  tags: [String],
  
  // Reply Fields
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: function() { return this.type === 'reply'; }
  },
  
  // Language Buddy Fields
  nativeLanguage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: function() { return this.type === 'buddy_request'; }
  },
  learningLanguage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: function() { return this.type === 'buddy_request'; }
  },
  bio: {
    type: String,
    required: function() { return this.type === 'buddy_request'; }
  },
  interests: [String],
  availability: {
    timezone: String,
    preferredTimes: [String],
    weekdays: [String]
  },
  
  // Engagement
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    replies: {
      type: Number,
      default: 0
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Moderation
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ type: 1, language: 1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ parentPost: 1 });
postSchema.index({ category: 1, type: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.engagement.likes.length;
});

// Methods
postSchema.methods.addLike = function(userId) {
  if (!this.engagement.likes.includes(userId)) {
    this.engagement.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

postSchema.methods.removeLike = function(userId) {
  this.engagement.likes = this.engagement.likes.filter(id => !id.equals(userId));
  return this.save();
};

export default mongoose.model('Post', postSchema);

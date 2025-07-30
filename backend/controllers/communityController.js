import Post from '../models/Post.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all forums
const getForums = async (req, res) => {
  try {
    const { language, category, page = 1, limit = 10 } = req.query;
    
    let query = { type: 'forum', isActive: true };
    
    if (language) {
      query.language = language;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const forums = await Post.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar')
      .populate('language', 'name code');
    
    const total = await Post.countDocuments(query);
    
    const response = {
      forums,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
    
    successResponse(res, response, 'Forums retrieved successfully');
  } catch (error) {
    console.error('Error fetching forums:', error);
    errorResponse(res, 'Failed to fetch forums', 500);
  }
};

// Get forum by ID with all replies
const getForumById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const forum = await Post.findById(id)
      .populate('author', 'name avatar')
      .populate('language', 'name code');
    
    if (!forum) {
      return errorResponse(res, 'Forum not found', 404);
    }
    
    // Increment view count
    forum.engagement.views += 1;
    await forum.save();
    
    // Get replies with pagination
    const skip = (page - 1) * limit;
    const replies = await Post.find({ parentPost: id, type: 'reply' })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar');
    
    const totalReplies = await Post.countDocuments({ parentPost: id, type: 'reply' });
    
    const response = {
      forum,
      replies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalReplies / limit),
        total: totalReplies
      }
    };
    
    successResponse(res, response, 'Forum retrieved successfully');
  } catch (error) {
    console.error('Error fetching forum:', error);
    errorResponse(res, 'Failed to fetch forum', 500);
  }
};

// Create new forum post
const createForumPost = async (req, res) => {
  try {
    const { title, content, language, category, tags } = req.body;
    const userId = req.user.id;
    
    const forumPost = new Post({
      type: 'forum',
      title,
      content,
      author: userId,
      language,
      category,
      tags: tags || []
    });
    
    const savedPost = await forumPost.save();
    const populatedPost = await Post.findById(savedPost._id)
      .populate('author', 'name avatar')
      .populate('language', 'name code');
    
    successResponse(res, populatedPost, 'Forum post created successfully', 201);
  } catch (error) {
    console.error('Error creating forum post:', error);
    errorResponse(res, 'Failed to create forum post', 500);
  }
};

// Reply to forum post
const replyToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if parent post exists
    const parentPost = await Post.findById(id);
    if (!parentPost) {
      return errorResponse(res, 'Parent post not found', 404);
    }
    
    const reply = new Post({
      type: 'reply',
      content,
      author: userId,
      parentPost: id,
      language: parentPost.language
    });
    
    const savedReply = await reply.save();
    
    // Update parent post replies count
    parentPost.engagement.replies += 1;
    parentPost.updatedAt = new Date();
    await parentPost.save();
    
    const populatedReply = await Post.findById(savedReply._id)
      .populate('author', 'name avatar');
    
    successResponse(res, populatedReply, 'Reply posted successfully', 201);
  } catch (error) {
    console.error('Error posting reply:', error);
    errorResponse(res, 'Failed to post reply', 500);
  }
};

// Like/Unlike post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }
    
    const likedIndex = post.engagement.likes.indexOf(userId);
    let action = '';
    
    if (likedIndex > -1) {
      // Unlike
      post.engagement.likes.splice(likedIndex, 1);
      action = 'unliked';
    } else {
      // Like
      post.engagement.likes.push(userId);
      action = 'liked';
    }
    
    await post.save();
    
    const response = {
      action,
      likesCount: post.engagement.likes.length,
      isLiked: action === 'liked'
    };
    
    successResponse(res, response, `Post ${action} successfully`);
  } catch (error) {
    console.error('Error toggling like:', error);
    errorResponse(res, 'Failed to toggle like', 500);
  }
};

// Get language buddy matches
const getLanguageBuddies = async (req, res) => {
  try {
    const { nativeLanguage, learningLanguage, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    let query = { 
      type: 'buddy_request',
      isActive: true,
      author: { $ne: userId }
    };
    
    if (nativeLanguage) {
      query.learningLanguage = nativeLanguage;
    }
    
    if (learningLanguage) {
      query.nativeLanguage = learningLanguage;
    }
    
    const skip = (page - 1) * limit;
    
    const buddies = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar')
      .populate('nativeLanguage', 'name code flag')
      .populate('learningLanguage', 'name code flag');
    
    const total = await Post.countDocuments(query);
    
    const response = {
      buddies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
    
    successResponse(res, response, 'Language buddies retrieved successfully');
  } catch (error) {
    console.error('Error fetching language buddies:', error);
    errorResponse(res, 'Failed to fetch language buddies', 500);
  }
};

// Create language buddy request
const createBuddyRequest = async (req, res) => {
  try {
    const { nativeLanguage, learningLanguage, bio, interests, availability } = req.body;
    const userId = req.user.id;
    
    // Check if user already has an active buddy request
    const existingRequest = await Post.findOne({
      type: 'buddy_request',
      author: userId,
      isActive: true
    });
    
    if (existingRequest) {
      return errorResponse(res, 'You already have an active buddy request', 400);
    }
    
    const buddyRequest = new Post({
      type: 'buddy_request',
      author: userId,
      nativeLanguage,
      learningLanguage,
      bio,
      interests: interests || [],
      availability: availability || {}
    });
    
    const savedRequest = await buddyRequest.save();
    const populatedRequest = await Post.findById(savedRequest._id)
      .populate('author', 'name avatar')
      .populate('nativeLanguage', 'name code flag')
      .populate('learningLanguage', 'name code flag');
    
    successResponse(res, populatedRequest, 'Buddy request created successfully', 201);
  } catch (error) {
    console.error('Error creating buddy request:', error);
    errorResponse(res, 'Failed to create buddy request', 500);
  }
};

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { q, language, category, type = 'forum', page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return errorResponse(res, 'Search query is required', 400);
    }
    
    let query = {
      type,
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    if (language) {
      query.language = language;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const posts = await Post.find(query)
      .sort({ 'engagement.views': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar')
      .populate('language', 'name code');
    
    const total = await Post.countDocuments(query);
    
    const response = {
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      searchQuery: q
    };
    
    successResponse(res, response, 'Search results retrieved successfully');
  } catch (error) {
    console.error('Error searching posts:', error);
    errorResponse(res, 'Failed to search posts', 500);
  }
};

// Update post (Author or Admin only)
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Unauthorized to update this post', 403);
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'name avatar')
     .populate('language', 'name code');
    
    successResponse(res, updatedPost, 'Post updated successfully');
  } catch (error) {
    console.error('Error updating post:', error);
    errorResponse(res, 'Failed to update post', 500);
  }
};

// Delete post (Author or Admin only)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Unauthorized to delete this post', 403);
    }
    
    await Post.findByIdAndUpdate(id, { isActive: false });
    
    successResponse(res, null, 'Post deleted successfully');
  } catch (error) {
    console.error('Error deleting post:', error);
    errorResponse(res, 'Failed to delete post', 500);
  }
};

export {
  getForums,
  getForumById,
  createForumPost,
  replyToPost,
  toggleLike,
  getLanguageBuddies,
  createBuddyRequest,
  searchPosts,
  updatePost,
  deletePost
};

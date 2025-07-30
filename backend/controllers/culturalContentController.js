import CulturalContent from '../models/CulturalContent.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all cultural content for a language
const getCulturalContent = async (req, res) => {
  try {
    const { language } = req.query;
    const { page = 1, limit = 10, category, difficulty } = req.query;
    
    let query = { isActive: true };
    
    if (language) {
      query.language = language;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    const skip = (page - 1) * limit;
    
    const content = await CulturalContent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('language', 'name code flag');
    
    const total = await CulturalContent.countDocuments(query);
    
    const response = {
      content,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
    
    successResponse(res, response, 'Cultural content retrieved successfully');
  } catch (error) {
    console.error('Error fetching cultural content:', error);
    errorResponse(res, 'Failed to fetch cultural content', 500);
  }
};

// Get cultural content by ID
const getCulturalContentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await CulturalContent.findById(id)
      .populate('language', 'name code flag')
      .populate('relatedContent', 'title category thumbnail');
    
    if (!content) {
      return errorResponse(res, 'Cultural content not found', 404);
    }
    
    // Increment view count
    content.engagement.views += 1;
    await content.save();
    
    successResponse(res, content, 'Cultural content retrieved successfully');
  } catch (error) {
    console.error('Error fetching cultural content:', error);
    errorResponse(res, 'Failed to fetch cultural content', 500);
  }
};

// Get cultural content by category
const getContentByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { language, page = 1, limit = 10 } = req.query;
    
    let query = { category, isActive: true };
    
    if (language) {
      query.language = language;
    }
    
    const skip = (page - 1) * limit;
    
    const content = await CulturalContent.find(query)
      .sort({ 'engagement.views': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('language', 'name code flag');
    
    const total = await CulturalContent.countDocuments(query);
    
    const response = {
      content,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
    
    successResponse(res, response, `${category} content retrieved successfully`);
  } catch (error) {
    console.error('Error fetching content by category:', error);
    errorResponse(res, 'Failed to fetch content by category', 500);
  }
};

// Get featured cultural content
const getFeaturedContent = async (req, res) => {
  try {
    const { language } = req.query;
    
    let query = { isFeatured: true, isActive: true };
    
    if (language) {
      query.language = language;
    }
    
    const content = await CulturalContent.find(query)
      .sort({ 'engagement.rating': -1, 'engagement.views': -1 })
      .limit(6)
      .populate('language', 'name code flag');
    
    successResponse(res, content, 'Featured cultural content retrieved successfully');
  } catch (error) {
    console.error('Error fetching featured content:', error);
    errorResponse(res, 'Failed to fetch featured content', 500);
  }
};

// Submit quiz answers
const submitQuizAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;
    
    const content = await CulturalContent.findById(id);
    
    if (!content || !content.quiz.questions.length) {
      return errorResponse(res, 'Quiz not found', 404);
    }
    
    let score = 0;
    const results = [];
    
    content.quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += 1;
      }
      
      results.push({
        questionIndex: index,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });
    
    const percentage = (score / content.quiz.questions.length) * 100;
    
    // Update engagement
    content.engagement.quizAttempts += 1;
    await content.save();
    
    const response = {
      score,
      totalQuestions: content.quiz.questions.length,
      percentage,
      passed: percentage >= (content.quiz.passingScore || 70),
      results
    };
    
    successResponse(res, response, 'Quiz submitted successfully');
  } catch (error) {
    console.error('Error submitting quiz:', error);
    errorResponse(res, 'Failed to submit quiz', 500);
  }
};

// Rate cultural content
const rateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;
    
    if (rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 400);
    }
    
    const content = await CulturalContent.findById(id);
    
    if (!content) {
      return errorResponse(res, 'Cultural content not found', 404);
    }
    
    // Calculate new rating
    const currentRating = content.engagement.rating || 0;
    const currentCount = content.engagement.ratingCount || 0;
    
    const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
    
    content.engagement.rating = newRating;
    content.engagement.ratingCount = currentCount + 1;
    
    await content.save();
    
    successResponse(res, { rating: newRating }, 'Content rated successfully');
  } catch (error) {
    console.error('Error rating content:', error);
    errorResponse(res, 'Failed to rate content', 500);
  }
};

// Create cultural content (Admin only)
const createCulturalContent = async (req, res) => {
  try {
    const contentData = req.body;
    const newContent = new CulturalContent(contentData);
    const savedContent = await newContent.save();
    
    const populatedContent = await CulturalContent.findById(savedContent._id)
      .populate('language', 'name code flag');
    
    successResponse(res, populatedContent, 'Cultural content created successfully', 201);
  } catch (error) {
    console.error('Error creating cultural content:', error);
    errorResponse(res, 'Failed to create cultural content', 500);
  }
};

// Update cultural content (Admin only)
const updateCulturalContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const content = await CulturalContent.findByIdAndUpdate(id, updateData, { new: true })
      .populate('language', 'name code flag');
    
    if (!content) {
      return errorResponse(res, 'Cultural content not found', 404);
    }
    
    successResponse(res, content, 'Cultural content updated successfully');
  } catch (error) {
    console.error('Error updating cultural content:', error);
    errorResponse(res, 'Failed to update cultural content', 500);
  }
};

// Delete cultural content (Admin only)
const deleteCulturalContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await CulturalContent.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!content) {
      return errorResponse(res, 'Cultural content not found', 404);
    }
    
    successResponse(res, null, 'Cultural content deleted successfully');
  } catch (error) {
    console.error('Error deleting cultural content:', error);
    errorResponse(res, 'Failed to delete cultural content', 500);
  }
};

export {
  getCulturalContent,
  getCulturalContentById,
  getContentByCategory,
  getFeaturedContent,
  submitQuizAnswers,
  rateContent,
  createCulturalContent,
  updateCulturalContent,
  deleteCulturalContent
};

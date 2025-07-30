import Language from '../models/Language.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all available languages
const getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.find({ isActive: true })
      .sort({ name: 1 });
    
    successResponse(res, languages, 'Languages retrieved successfully');
  } catch (error) {
    console.error('Error fetching languages:', error);
    errorResponse(res, 'Failed to fetch languages', 500);
  }
};

// Get language by ID with detailed information
const getLanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    const language = await Language.findById(id);
    
    if (!language) {
      return errorResponse(res, 'Language not found', 404);
    }
    
    successResponse(res, language, 'Language retrieved successfully');
  } catch (error) {
    console.error('Error fetching language:', error);
    errorResponse(res, 'Failed to fetch language', 500);
  }
};

// Get languages by CEFR level
const getLanguagesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    if (!validLevels.includes(level)) {
      return errorResponse(res, 'Invalid CEFR level', 400);
    }
    
    const languages = await Language.find({
      isActive: true,
      [`cefrLevels.${level}`]: { $exists: true }
    }).sort({ name: 1 });
    
    successResponse(res, languages, `Languages for ${level} level retrieved successfully`);
  } catch (error) {
    console.error('Error fetching languages by level:', error);
    errorResponse(res, 'Failed to fetch languages by level', 500);
  }
};

// Get languages by grade level
const getLanguagesByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    const gradeNum = parseInt(grade);
    
    if (gradeNum < 6 || gradeNum > 10) {
      return errorResponse(res, 'Invalid grade level. Must be between 6-10', 400);
    }
    
    const languages = await Language.find({
      isActive: true,
      'gradeLevels.grade': gradeNum
    }).sort({ name: 1 });
    
    successResponse(res, languages, `Languages for grade ${grade} retrieved successfully`);
  } catch (error) {
    console.error('Error fetching languages by grade:', error);
    errorResponse(res, 'Failed to fetch languages by grade', 500);
  }
};

// Update language statistics
const updateLanguageStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { enrolledStudents, completedCourses, averageRating } = req.body;
    
    const language = await Language.findByIdAndUpdate(
      id,
      {
        $set: {
          'statistics.enrolledStudents': enrolledStudents,
          'statistics.completedCourses': completedCourses,
          'statistics.averageRating': averageRating,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!language) {
      return errorResponse(res, 'Language not found', 404);
    }
    
    successResponse(res, language, 'Language statistics updated successfully');
  } catch (error) {
    console.error('Error updating language stats:', error);
    errorResponse(res, 'Failed to update language statistics', 500);
  }
};

// Create new language (Admin only)
const createLanguage = async (req, res) => {
  try {
    const languageData = req.body;
    const newLanguage = new Language(languageData);
    const savedLanguage = await newLanguage.save();
    
    successResponse(res, savedLanguage, 'Language created successfully', 201);
  } catch (error) {
    console.error('Error creating language:', error);
    errorResponse(res, 'Failed to create language', 500);
  }
};

// Update language (Admin only)
const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const language = await Language.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!language) {
      return errorResponse(res, 'Language not found', 404);
    }
    
    successResponse(res, language, 'Language updated successfully');
  } catch (error) {
    console.error('Error updating language:', error);
    errorResponse(res, 'Failed to update language', 500);
  }
};

// Delete language (Admin only)
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!language) {
      return errorResponse(res, 'Language not found', 404);
    }
    
    successResponse(res, null, 'Language deleted successfully');
  } catch (error) {
    console.error('Error deleting language:', error);
    errorResponse(res, 'Failed to delete language', 500);
  }
};

export {
  getAllLanguages,
  getLanguageById,
  getLanguagesByLevel,
  getLanguagesByGrade,
  updateLanguageStats,
  createLanguage,
  updateLanguage,
  deleteLanguage
};

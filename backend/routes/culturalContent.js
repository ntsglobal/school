import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getCulturalContent,
  getCulturalContentById,
  getContentByCategory,
  getFeaturedContent,
  submitQuizAnswers,
  rateContent,
  createCulturalContent,
  updateCulturalContent,
  deleteCulturalContent
} from '../controllers/culturalContentController.js';

const router = express.Router();

// Public routes
router.get('/', getCulturalContent);
router.get('/featured', getFeaturedContent);
router.get('/category/:category', getContentByCategory);
router.get('/:id', getCulturalContentById);

// Protected routes
router.post('/:id/quiz', verifyToken, submitQuizAnswers);
router.post('/:id/rate', verifyToken, rateContent);

// Admin only routes
router.post('/', verifyToken, createCulturalContent); // Add admin middleware later
router.put('/:id', verifyToken, updateCulturalContent); // Add admin middleware later
router.delete('/:id', verifyToken, deleteCulturalContent); // Add admin middleware later

export default router;

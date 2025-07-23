import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getAllLanguages,
  getLanguageById,
  getLanguagesByLevel,
  getLanguagesByGrade,
  updateLanguageStats,
  createLanguage,
  updateLanguage,
  deleteLanguage
} from '../controllers/languageController.js';

const router = express.Router();

// Public routes
router.get('/', getAllLanguages);
router.get('/:id', getLanguageById);
router.get('/level/:level', getLanguagesByLevel);
router.get('/grade/:grade', getLanguagesByGrade);

// Protected routes
router.put('/:id/stats', verifyToken, updateLanguageStats);

// Admin only routes
router.post('/', verifyToken, createLanguage); // Add admin middleware later
router.put('/:id', verifyToken, updateLanguage); // Add admin middleware later
router.delete('/:id', verifyToken, deleteLanguage); // Add admin middleware later

export default router;

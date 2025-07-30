import express from 'express';
import { body } from 'express-validator';
import {
  analyzePronunciation,
  processAudioFile,
  getPronunciationExercises,
  savePronunciationAssessment,
  getPronunciationProgress,
  createVoiceAssessment,
  getVoiceAssessments,
  getVoiceAssessmentById,
  submitVoiceAssessmentAttempt,
  getUserAssessmentAttempts,
  uploadAudio
} from '../controllers/speechController.js';
import {
  verifyFirebaseAuth,
  isTeacherOrAdmin
} from '../middleware/auth.js';

const router = express.Router();

// Analyze pronunciation from text comparison
router.post('/analyze-pronunciation', verifyFirebaseAuth, [
  body('originalText').trim().isLength({ min: 1 }).withMessage('Original text is required'),
  body('spokenText').trim().isLength({ min: 1 }).withMessage('Spoken text is required'),
  body('language').optional().isString().withMessage('Language must be a string')
], analyzePronunciation);

// Process audio file for pronunciation analysis
router.post('/process-audio', verifyFirebaseAuth, uploadAudio, processAudioFile);

// Get pronunciation exercises
router.get('/exercises', verifyFirebaseAuth, getPronunciationExercises);

// Save pronunciation assessment results
router.post('/user/:userId/assessment', verifyFirebaseAuth, [
  body('exerciseId').optional().isString().withMessage('Exercise ID must be a string'),
  body('originalText').trim().isLength({ min: 1 }).withMessage('Original text is required'),
  body('spokenText').trim().isLength({ min: 1 }).withMessage('Spoken text is required'),
  body('pronunciationScore').isFloat({ min: 0, max: 100 }).withMessage('Pronunciation score must be between 0 and 100'),
  body('language').isString().withMessage('Language is required'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer')
], savePronunciationAssessment);

// Get user's pronunciation progress
router.get('/user/:userId/progress', verifyFirebaseAuth, getPronunciationProgress);

// Voice Assessment Routes

// Create voice assessment (Teacher/Admin only)
router.post('/assessments', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('language').isIn(['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'es-MX', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN', 'ru-RU', 'ar-SA', 'hi-IN']).withMessage('Invalid language'),
  body('level').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).withMessage('Invalid level'),
  body('type').isIn(['pronunciation', 'fluency', 'reading_aloud', 'conversation', 'presentation', 'storytelling', 'description', 'roleplay']).withMessage('Invalid assessment type')
], createVoiceAssessment);

// Get voice assessments
router.get('/assessments', verifyFirebaseAuth, getVoiceAssessments);

// Get voice assessment by ID
router.get('/assessments/:id', verifyFirebaseAuth, getVoiceAssessmentById);

// Submit voice assessment attempt
router.post('/assessments/:assessmentId/attempt', verifyFirebaseAuth, uploadAudio, submitVoiceAssessmentAttempt);

// Get user's assessment attempts
router.get('/user/:userId/attempts', verifyFirebaseAuth, getUserAssessmentAttempts);

export default router;

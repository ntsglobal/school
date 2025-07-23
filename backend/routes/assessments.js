import express from 'express';
import { body } from 'express-validator';
import {
  getAssessmentsByCourse,
  getAssessmentById,
  createAssessment,
  startAssessmentAttempt,
  submitAssessmentAttempt,
  getAssessmentResults
} from '../controllers/assessmentController.js';
import {
  verifyFirebaseAuth,
  isTeacherOrAdmin,
  isAdmin
} from '../middleware/auth.js';

const router = express.Router();

// Get assessments by course
router.get('/course/:courseId', verifyFirebaseAuth, getAssessmentsByCourse);

// Get assessment by ID
router.get('/:id', verifyFirebaseAuth, getAssessmentById);

// Create new assessment (Teacher/Admin only)
router.post('/', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('type').isIn(['quiz', 'assignment', 'speaking', 'listening', 'writing', 'reading', 'comprehensive']).withMessage('Invalid assessment type'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('maxAttempts').optional().isInt({ min: 1 }).withMessage('Max attempts must be a positive integer'),
  body('passingScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
], createAssessment);

// Start assessment attempt
router.post('/:id/start', verifyFirebaseAuth, startAssessmentAttempt);

// Submit assessment attempt
router.post('/attempt/:attemptId/submit', verifyFirebaseAuth, [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').exists().withMessage('Question ID is required for each answer'),
  body('answers.*.answer').exists().withMessage('Answer is required for each question'),
], submitAssessmentAttempt);

// Get assessment results
router.get('/attempt/:attemptId/results', verifyFirebaseAuth, getAssessmentResults);

export default router;

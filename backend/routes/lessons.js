import express from 'express';
import { body } from 'express-validator';
import { 
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLessonActivity,
  getLessonProgress
} from '../controllers/lessonController.js';
import { 
  verifyFirebaseAuth, 
  isTeacherOrAdmin, 
  isAdmin 
} from '../middleware/auth.js';

const router = express.Router();

// Get lessons for a course
router.get('/course/:courseId', verifyFirebaseAuth, getLessonsByCourse);
router.get('/:id', verifyFirebaseAuth, getLessonById);
router.get('/:id/progress', verifyFirebaseAuth, getLessonProgress);

// Student interaction
router.post('/:id/complete-activity', verifyFirebaseAuth, [
  body('activityType').isIn(['video', 'quiz', 'exercise', 'speaking', 'listening']).withMessage('Invalid activity type'),
  body('score').optional().isFloat({ min: 0, max: 100 }),
  body('timeSpent').optional().isInt({ min: 0 }),
], completeLessonActivity);

// Admin/Teacher routes
router.post('/', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('type').isIn(['video', 'interactive', 'quiz', 'speaking', 'listening']).withMessage('Invalid lesson type'),
], createLesson);

router.put('/:id', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('order').optional().isInt({ min: 1 }),
  body('type').optional().isIn(['video', 'interactive', 'quiz', 'speaking', 'listening']),
], updateLesson);

router.delete('/:id', verifyFirebaseAuth, isAdmin, deleteLesson);

export default router;

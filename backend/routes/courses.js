import express from 'express';
import { body } from 'express-validator';
import { 
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByLanguage,
  getCoursesByLevel,
  getCoursesByGrade,
  enrollInCourse,
  unenrollFromCourse,
  getUserCourses
} from '../controllers/courseController.js';
import { 
  verifyFirebaseAuth, 
  isTeacherOrAdmin, 
  isAdmin 
} from '../middleware/auth.js';

const router = express.Router();

// Public routes (for browsing courses)
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/language/:language', getCoursesByLanguage);
router.get('/level/:level', getCoursesByLevel);
router.get('/grade/:grade', getCoursesByGrade);

// User-specific routes
router.get('/user/enrolled', verifyFirebaseAuth, getUserCourses);
router.post('/:id/enroll', verifyFirebaseAuth, enrollInCourse);
router.delete('/:id/unenroll', verifyFirebaseAuth, unenrollFromCourse);

// Admin/Teacher routes
router.post('/', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('language').isIn(['french', 'japanese', 'german', 'spanish', 'korean']).withMessage('Invalid language'),
  body('level').isIn(['A1', 'A2', 'B1']).withMessage('Invalid CEFR level'),
  body('grade').isInt({ min: 6, max: 10 }).withMessage('Grade must be between 6 and 10'),
], createCourse);

router.put('/:id', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('language').optional().isIn(['french', 'japanese', 'german', 'spanish', 'korean']),
  body('level').optional().isIn(['A1', 'A2', 'B1']),
  body('grade').optional().isInt({ min: 6, max: 10 }),
], updateCourse);

router.delete('/:id', verifyFirebaseAuth, isAdmin, deleteCourse);

export default router;

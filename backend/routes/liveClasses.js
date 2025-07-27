import express from 'express';
import { body } from 'express-validator';
import { 
  getAllLiveClasses,
  getLiveClassById,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  joinLiveClass,
  leaveLiveClass,
  getUserLiveClasses,
  getUpcomingClasses,
  joinVideoCall,
  leaveVideoCall,
  startLiveClass,
  endLiveClass
} from '../controllers/liveClassController.js';
import { 
  verifyFirebaseAuth, 
  isTeacherOrAdmin, 
  isAdmin 
} from '../middleware/auth.js';

const router = express.Router();

// Get live classes
router.get('/', verifyFirebaseAuth, getAllLiveClasses);
router.get('/upcoming', verifyFirebaseAuth, getUpcomingClasses);
router.get('/user', verifyFirebaseAuth, getUserLiveClasses);
router.get('/:id', verifyFirebaseAuth, getLiveClassById);

// Join/Leave classes
router.post('/:id/join', verifyFirebaseAuth, joinLiveClass);
router.post('/:id/leave', verifyFirebaseAuth, leaveLiveClass);

// Video call endpoints
router.post('/:id/video/join', verifyFirebaseAuth, joinVideoCall);
router.post('/:id/video/leave', verifyFirebaseAuth, leaveVideoCall);

// Class control endpoints (Teacher/Admin only)
router.post('/:id/start', verifyFirebaseAuth, isTeacherOrAdmin, startLiveClass);
router.post('/:id/end', verifyFirebaseAuth, isTeacherOrAdmin, endLiveClass);

// Teacher/Admin routes
router.post('/', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('language').isIn(['french', 'japanese', 'german', 'spanish', 'korean']).withMessage('Invalid language'),
  body('level').isIn(['A1', 'A2', 'B1']).withMessage('Invalid CEFR level'),
  body('scheduledAt').isISO8601().withMessage('Valid date is required'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('maxParticipants').isInt({ min: 1, max: 20 }).withMessage('Max participants must be between 1 and 20'),
], createLiveClass);

router.put('/:id', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('scheduledAt').optional().isISO8601(),
  body('duration').optional().isInt({ min: 15, max: 180 }),
  body('maxParticipants').optional().isInt({ min: 1, max: 20 }),
], updateLiveClass);

router.delete('/:id', verifyFirebaseAuth, isAdmin, deleteLiveClass);

export default router;

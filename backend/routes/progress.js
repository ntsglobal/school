import express from 'express';
import { 
  getUserProgress,
  getCourseProgress,
  getLessonProgress,
  updateProgress,
  getProgressAnalytics,
  getWeeklyReport,
  getMonthlyReport
} from '../controllers/progressController.js';
import { 
  verifyFirebaseAuth, 
  canAccessStudentData 
} from '../middleware/auth.js';

const router = express.Router();

// User progress routes
router.get('/user/:userId', verifyFirebaseAuth, canAccessStudentData, getUserProgress);
router.get('/user/:userId/course/:courseId', verifyFirebaseAuth, canAccessStudentData, getCourseProgress);
router.get('/user/:userId/lesson/:lessonId', verifyFirebaseAuth, canAccessStudentData, getLessonProgress);
router.put('/user/:userId/lesson/:lessonId', verifyFirebaseAuth, updateProgress);

// Analytics routes
router.get('/user/:userId/analytics', verifyFirebaseAuth, canAccessStudentData, getProgressAnalytics);
router.get('/user/:userId/report/weekly', verifyFirebaseAuth, canAccessStudentData, getWeeklyReport);
router.get('/user/:userId/report/monthly', verifyFirebaseAuth, canAccessStudentData, getMonthlyReport);

export default router;

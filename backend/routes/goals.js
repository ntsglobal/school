import express from 'express';
import { body } from 'express-validator';
import {
  getUserGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getUserStreaks,
  updateStreak,
  createDefaultGoals
} from '../controllers/goalController.js';
import {
  verifyFirebaseAuth,
  isAdmin
} from '../middleware/auth.js';

const router = express.Router();

// Get user goals
router.get('/user/:userId', verifyFirebaseAuth, getUserGoals);

// Create new goal
router.post('/user/:userId', verifyFirebaseAuth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('type').isIn(['daily', 'weekly', 'monthly', 'custom', 'streak', 'achievement']).withMessage('Invalid goal type'),
  body('category').isIn(['study_time', 'lessons', 'points', 'streak', 'course', 'skill', 'assessment', 'consistency']).withMessage('Invalid category'),
  body('target.value').isInt({ min: 1 }).withMessage('Target value must be a positive integer'),
  body('target.unit').isIn(['minutes', 'hours', 'lessons', 'points', 'days', 'courses', 'assessments', 'percentage']).withMessage('Invalid target unit'),
  body('timeframe.startDate').isISO8601().withMessage('Valid start date is required'),
  body('timeframe.endDate').isISO8601().withMessage('Valid end date is required'),
], createGoal);

// Update goal
router.put('/user/:userId/goal/:goalId', verifyFirebaseAuth, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('target.value').optional().isInt({ min: 1 }).withMessage('Target value must be a positive integer'),
], updateGoal);

// Update goal progress
router.patch('/user/:userId/goal/:goalId/progress', verifyFirebaseAuth, [
  body('progress').isNumeric().withMessage('Progress must be a number'),
  body('notes').optional().trim()
], updateGoalProgress);

// Delete goal
router.delete('/user/:userId/goal/:goalId', verifyFirebaseAuth, deleteGoal);

// Get user streaks
router.get('/user/:userId/streaks', verifyFirebaseAuth, getUserStreaks);

// Update streak
router.patch('/user/:userId/streak/:streakId', verifyFirebaseAuth, [
  body('value').optional().isNumeric().withMessage('Value must be a number'),
  body('date').optional().isISO8601().withMessage('Valid date is required')
], updateStreak);

// Create default goals for user (Admin only)
router.post('/user/:userId/defaults', verifyFirebaseAuth, isAdmin, createDefaultGoals);

export default router;

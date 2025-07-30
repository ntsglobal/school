import express from 'express';
import { body } from 'express-validator';
import {
  getAllBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  getUserAchievements,
  createAchievement,
  updateAchievementProgress,
  checkUserAchievements
} from '../controllers/badgeController.js';
import {
  verifyFirebaseAuth,
  isAdmin,
  isTeacherOrAdmin
} from '../middleware/auth.js';

const router = express.Router();

// Get all badges
router.get('/', verifyFirebaseAuth, getAllBadges);

// Get badge by ID
router.get('/:id', verifyFirebaseAuth, getBadgeById);

// Create new badge (Admin only)
router.post('/', verifyFirebaseAuth, isAdmin, [
  body('badgeId').trim().isLength({ min: 1 }).withMessage('Badge ID is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('icon').trim().isLength({ min: 1 }).withMessage('Icon is required'),
  body('category').isIn(['achievement', 'level', 'streak', 'course', 'skill', 'time', 'social', 'special', 'language']).withMessage('Invalid category'),
  body('rarity').isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity'),
], createBadge);

// Update badge (Admin only)
router.put('/:id', verifyFirebaseAuth, isAdmin, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('description').optional().trim().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('category').optional().isIn(['achievement', 'level', 'streak', 'course', 'skill', 'time', 'social', 'special', 'language']).withMessage('Invalid category'),
  body('rarity').optional().isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity'),
], updateBadge);

// Delete badge (Admin only)
router.delete('/:id', verifyFirebaseAuth, isAdmin, deleteBadge);

// Get user achievements
router.get('/user/:userId/achievements', verifyFirebaseAuth, getUserAchievements);

// Create achievement for user (Admin/Teacher only)
router.post('/user/:userId/achievements', verifyFirebaseAuth, isTeacherOrAdmin, [
  body('achievementId').trim().isLength({ min: 1 }).withMessage('Achievement ID is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('target').isInt({ min: 1 }).withMessage('Target must be a positive integer'),
  body('category').isIn(['points', 'streak', 'course', 'lesson', 'time', 'social', 'skill', 'special']).withMessage('Invalid category'),
], createAchievement);

// Update achievement progress
router.patch('/user/:userId/achievements/:achievementId', verifyFirebaseAuth, [
  body('progress').isInt({ min: 0 }).withMessage('Progress must be a non-negative integer'),
], updateAchievementProgress);

// Check and update all user achievements
router.post('/user/:userId/check', verifyFirebaseAuth, checkUserAchievements);

export default router;

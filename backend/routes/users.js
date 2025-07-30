import express from 'express';
import { body } from 'express-validator';
import { 
  getProfile, 
  updateProfile, 
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  getStudentsByParent,
  getStudentsByTeacher,
  getLinkedAccounts,
  removeLinkedAccount
} from '../controllers/userController.js';
import { 
  verifyFirebaseAuth, 
  isAdmin, 
  isParentOrAdmin, 
  isTeacherOrAdmin,
  canAccessStudentData 
} from '../middleware/auth.js';

const router = express.Router();

// Profile routes
router.get('/profile', verifyFirebaseAuth, getProfile);
router.put('/profile', verifyFirebaseAuth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601(),
], updateProfile);
router.delete('/profile', verifyFirebaseAuth, deleteAccount);

// Linked accounts routes
router.get('/me/linked-accounts', verifyFirebaseAuth, getLinkedAccounts);
router.delete('/me/linked-accounts/:linkedAccountId', verifyFirebaseAuth, removeLinkedAccount);

// Admin routes
router.get('/', verifyFirebaseAuth, isAdmin, getAllUsers);
router.get('/:id', verifyFirebaseAuth, isAdmin, getUserById);
router.put('/:id/role', verifyFirebaseAuth, isAdmin, [
  body('role').isIn(['student', 'teacher', 'parent', 'admin'])
], updateUserRole);

// Parent routes
router.get('/parent/:parentId/students', verifyFirebaseAuth, isParentOrAdmin, getStudentsByParent);

// Teacher routes
router.get('/teacher/:teacherId/students', verifyFirebaseAuth, isTeacherOrAdmin, getStudentsByTeacher);

// Student data access
router.get('/student/:studentId', verifyFirebaseAuth, canAccessStudentData, getUserById);

export default router;

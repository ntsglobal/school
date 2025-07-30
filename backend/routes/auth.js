import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  resendVerification,
  checkEmail,
  linkAccounts,
  completeOnboarding
} from '../controllers/authController.js';
import { verifyFirebaseAuth } from '../middleware/auth.js';
import { 
  validateRegistration, 
  validateLogin, 
  validatePasswordReset,
  handleValidationErrors 
} from '../middleware/validation.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Routes with enhanced validation and rate limiting
router.post('/register', 
  authLimiter,
  validateRegistration, 
  handleValidationErrors, 
  register
);

router.post('/check-email', checkEmail);

router.post('/login', 
  validateLogin, 
  handleValidationErrors, 
  login
);

router.post('/logout', verifyFirebaseAuth, logout);
router.post('/refresh-token', refreshToken);

router.post('/forgot-password', 
  passwordResetLimiter,
  validatePasswordReset, 
  handleValidationErrors, 
  forgotPassword
);

router.post('/reset-password', [
  body('token').exists().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', validatePasswordReset, resendVerification);
router.post('/link-accounts', verifyFirebaseAuth, linkAccounts);
router.post('/complete-onboarding', verifyFirebaseAuth, [
  body('role').isIn(['student', 'teacher', 'parent']).withMessage('Valid role is required'),
  body('grade').optional().isInt({min: 6, max: 10}).withMessage('Grade must be between 6 and 10'),
  body('board').optional().isIn(['CBSE', 'ICSE', 'International', 'Other']).withMessage('Valid board is required'),
], handleValidationErrors, completeOnboarding);

export default router;

import { body, validationResult } from 'express-validator';
import validator from 'validator';

const { isEmail, isStrongPassword } = validator;

// Password validation rules
const passwordRules = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

// Custom password validator
const strongPassword = (value) => {
  return isStrongPassword(value, passwordRules);
};

// Registration validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  
  body('password')
    .custom(strongPassword)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and symbol'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('role')
    .isIn(['student', 'parent', 'teacher', 'admin'])
    .withMessage('Role must be one of: student, parent, teacher, admin'),
  
  body('grade')
    .optional()
    .isInt({ min: 6, max: 10 })
    .withMessage('Grade must be between 6 and 10'),
  
  body('school')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School name must be less than 100 characters'),
  
  body('board')
    .optional()
    .isIn(['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'])
    .withMessage('Invalid board selection'),
  
  body('firebaseUid')
    .notEmpty()
    .withMessage('Firebase UID is required')
    .isLength({ min: 10, max: 128 })
    .withMessage('Invalid Firebase UID format'),
];

// Login validation
export const validateLogin = [
  body('firebaseToken')
    .notEmpty()
    .withMessage('Firebase token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid Firebase token format'),
];

// Password reset validation
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .custom(strongPassword)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and symbol'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
];

// Email validation
export const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('grade')
    .optional()
    .isInt({ min: 6, max: 10 })
    .withMessage('Grade must be between 6 and 10'),
  
  body('school')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School name must be less than 100 characters'),
];

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitize input middleware
export const sanitizeInput = (req, res, next) => {
  // Remove any potentially dangerous characters
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

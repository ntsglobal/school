import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';

// Helper function to create MongoDB store safely
const createMongoStore = (collectionName) => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, using memory store for rate limiting');
      return undefined;
    }
    
    return new MongoStore({
      uri: process.env.MONGODB_URI,
      collectionName: collectionName,
      expireTimeMs: 15 * 60 * 1000,
    });
  } catch (error) {
    console.warn('Failed to create MongoDB store for rate limiting:', error.message);
    return undefined;
  }
};

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createMongoStore('rate_limits'),
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  store: createMongoStore('auth_rate_limits'),
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again in 1 hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore('password_reset_limits'),
});

// Email verification rate limiting
export const emailVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 email verification requests per 10 minutes
  message: {
    success: false,
    message: 'Too many email verification attempts, please try again in 10 minutes.',
    retryAfter: 600
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore('email_verification_limits'),
});

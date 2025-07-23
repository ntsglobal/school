import jwt from 'jsonwebtoken';
import { verifyFirebaseTokenCached, getCachedUserData, cacheUserData, getCachedUidMapping, cacheUidMapping } from '../utils/cache.js';
import User from '../models/User.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No valid token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user data is cached
      let userData = getCachedUserData(decoded.id);
      
      if (!userData) {
        // Fetch from database if not cached
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
          return res.status(401).json({ 
            success: false, 
            message: 'User not found or inactive.' 
          });
        }
        
        userData = user.toObject();
        cacheUserData(decoded.id, userData);
      }
      
      req.user = {
        id: decoded.id,
        ...userData
      };
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    });
  }
};

// Middleware to verify Firebase token (optimized with caching)
export const verifyFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No Firebase token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      // Use cached Firebase token verification
      const decodedToken = await verifyFirebaseTokenCached(token);
      
      // Check for cached UID mapping first
      let userId = getCachedUidMapping(decodedToken.uid);
      let user;
      
      if (userId) {
        user = getCachedUserData(userId);
      }
      
      if (!user) {
        // Fetch from database if not cached
        user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found. Please register first.' 
          });
        }
        
        if (!user.isActive) {
          return res.status(403).json({ 
            success: false, 
            message: 'Account is deactivated. Please contact support.' 
          });
        }
        
        // Cache the mapping and user data
        cacheUidMapping(decodedToken.uid, user._id.toString());
        cacheUserData(user._id.toString(), user.toObject());
      }

      req.user = {
        id: user._id,
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        role: user.role,
        ...decodedToken
      };
      
      next();
    } catch (firebaseError) {
      console.error('Firebase token verification error:', firebaseError);
      
      if (firebaseError.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          success: false, 
          message: 'Firebase token expired. Please sign in again.',
          code: 'FIREBASE_TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Firebase token.' 
      });
    }
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. User not authenticated.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Check if user is student
export const isStudent = authorize('student');

// Check if user is teacher
export const isTeacher = authorize('teacher');

// Check if user is parent
export const isParent = authorize('parent');

// Check if user is admin
export const isAdmin = authorize('admin');

// Check if user is teacher or admin
export const isTeacherOrAdmin = authorize('teacher', 'admin');

// Check if user is parent or admin (for accessing student data)
export const isParentOrAdmin = authorize('parent', 'admin');

// Check if user can access student data (student themselves, their parent, teacher, or admin)
export const canAccessStudentData = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { user } = req;

    // Admin can access all data
    if (user.role === 'admin') {
      return next();
    }

    // Student can access their own data
    if (user.role === 'student' && user.id === studentId) {
      return next();
    }

    // Parent can access their child's data
    if (user.role === 'parent') {
      const student = await User.findById(studentId);
      if (student && student.parentId && student.parentId.toString() === user.id) {
        return next();
      }
    }

    // Teacher can access their students' data
    if (user.role === 'teacher') {
      // This would need to check if the teacher is assigned to the student
      // Implementation depends on how teacher-student relationships are stored
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Cannot access this student data.' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking permissions.' 
    });
  }
};

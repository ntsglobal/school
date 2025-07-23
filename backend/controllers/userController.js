import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Gamification from '../models/Gamification.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-firebaseUid')
      .populate('parentId', 'firstName lastName email')
      .populate('children', 'firstName lastName email grade')
      .populate('assignedTeachers', 'firstName lastName email')
      .populate('assignedStudents', 'firstName lastName email grade');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get gamification data for students
    let gamificationData = null;
    if (user.role === 'student') {
      gamificationData = await Gamification.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        gamification: gamificationData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's linked accounts
export const getLinkedAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('linkedAccounts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return linked accounts
    res.json({
      success: true,
      data: {
        linkedAccounts: user.linkedAccounts || []
      }
    });

  } catch (error) {
    console.error('Get linked accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Remove a linked account
export const removeLinkedAccount = async (req, res) => {
  try {
    const { linkedAccountId } = req.params;
    
    if (!linkedAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Linked account ID is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if linked account exists
    if (!user.linkedAccounts || !user.linkedAccounts.some(account => account._id.toString() === linkedAccountId)) {
      return res.status(404).json({
        success: false,
        message: 'Linked account not found'
      });
    }
    
    // Remove the linked account
    user.linkedAccounts = user.linkedAccounts.filter(
      account => account._id.toString() !== linkedAccountId
    );
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Linked account removed successfully'
    });
  } catch (error) {
    console.error('Remove linked account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 
      'gender', 'school', 'nativeLanguage', 'preferredLanguages',
      'notifications', 'timezone', 'language'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-firebaseUid');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, grade, search } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (grade) query.grade = grade;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-firebaseUid')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid')
      .populate('parentId', 'firstName lastName email')
      .populate('children', 'firstName lastName email grade')
      .populate('assignedTeachers', 'firstName lastName email')
      .populate('assignedStudents', 'firstName lastName email grade');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-firebaseUid');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get students by parent (Parent/Admin only)
export const getStudentsByParent = async (req, res) => {
  try {
    const parentId = req.params.parentId;

    // Check if requesting user is the parent or admin
    if (req.user.role !== 'admin' && req.user.id !== parentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const students = await User.findStudentsByParent(parentId);

    res.json({
      success: true,
      data: { students }
    });

  } catch (error) {
    console.error('Get students by parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get students by teacher (Teacher/Admin only)
export const getStudentsByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // Check if requesting user is the teacher or admin
    if (req.user.role !== 'admin' && req.user.id !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const teacher = await User.findById(teacherId).populate('assignedStudents');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: { students: teacher.assignedStudents }
    });

  } catch (error) {
    console.error('Get students by teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

import { validationResult } from 'express-validator';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';

// Get all courses with filtering and pagination
export const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      language,
      level,
      grade,
      board,
      search,
      status = 'published'
    } = req.query;

    // Build query
    const query = { status, isActive: true };

    if (language) query.language = language;
    if (level) query.level = level;
    if (grade) query.grade = parseInt(grade);
    if (board && board !== 'All') query.board = board;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .populate('coInstructors', 'firstName lastName avatar')
      .select('-enrolledStudents') // Exclude detailed enrollment data
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get course by ID with detailed information
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await Course.findById(id)
      .populate('instructor', 'firstName lastName avatar email')
      .populate('coInstructors', 'firstName lastName avatar email')
      .populate({
        path: 'enrolledStudents.student',
        select: 'firstName lastName avatar'
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    let userProgress = null;

    if (userId) {
      isEnrolled = course.isEnrolled(userId);

      if (isEnrolled) {
        // Get user's progress in this course
        const progressData = await Progress.find({
          userId,
          courseId: id
        }).populate('lessonId', 'title order');

        userProgress = {
          totalLessons: progressData.length,
          completedLessons: progressData.filter(p => p.status === 'completed').length,
          averageScore: progressData.reduce((sum, p) => sum + p.bestScore, 0) / progressData.length || 0,
          timeSpent: progressData.reduce((sum, p) => sum + p.timeSpent, 0),
          lastAccessed: Math.max(...progressData.map(p => new Date(p.lastAccessedAt)))
        };
      }
    }

    // Prepare response data
    const responseData = {
      ...course.toObject(),
      isEnrolled,
      userProgress,
      enrollmentCount: course.enrollmentCount,
      completionRate: course.completionRate
    };

    // Remove sensitive enrollment data for non-instructors
    if (!req.user || (req.user.role !== 'admin' && req.user.id !== course.instructor.toString())) {
      delete responseData.enrolledStudents;
    }

    res.json({
      success: true,
      data: { course: responseData }
    });

  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      shortDescription,
      language,
      level,
      grade,
      board,
      estimatedDuration,
      difficulty,
      objectives,
      prerequisites,
      skills,
      syllabus,
      price,
      currency,
      tags,
      culturalModules
    } = req.body;

    // Create course data
    const courseData = {
      title,
      description,
      shortDescription,
      language,
      level,
      grade,
      board: board || 'All',
      estimatedDuration,
      difficulty,
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      skills: skills || [],
      syllabus: syllabus || [],
      price: price || 0,
      currency: currency || 'INR',
      tags: tags || [],
      culturalModules: culturalModules || [],
      instructor: req.user.id,
      status: 'draft'
    };

    const course = await Course.create(courseData);

    // Populate instructor data
    await course.populate('instructor', 'firstName lastName avatar email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the course
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    if (userRole !== 'admin' && course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own courses.'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'language', 'level',
      'grade', 'board', 'estimatedDuration', 'difficulty', 'objectives',
      'prerequisites', 'skills', 'syllabus', 'price', 'currency', 'tags',
      'culturalModules', 'thumbnail', 'trailer', 'status'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update lastUpdated timestamp
    updates.lastUpdated = new Date();

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName avatar email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete course (Admin only)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with enrolled students. Archive it instead.'
      });
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get courses by language
export const getCoursesByLanguage = async (req, res) => {
  try {
    const { language } = req.params;
    const { page = 1, limit = 10, level, grade } = req.query;

    const query = {
      language,
      status: 'published',
      isActive: true
    };

    if (level) query.level = level;
    if (grade) query.grade = parseInt(grade);

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .select('-enrolledStudents')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses by language error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get courses by CEFR level
export const getCoursesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { page = 1, limit = 10, language, grade } = req.query;

    const query = {
      level,
      status: 'published',
      isActive: true
    };

    if (language) query.language = language;
    if (grade) query.grade = parseInt(grade);

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .select('-enrolledStudents')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses by level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get courses by grade
export const getCoursesByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    const { page = 1, limit = 10, language, level } = req.query;

    const query = {
      grade: parseInt(grade),
      status: 'published',
      isActive: true
    };

    if (language) query.language = language;
    if (level) query.level = level;

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .select('-enrolledStudents')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses by grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Enroll in course
export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    if (course.isEnrolled(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Add student to enrollment
    course.enrolledStudents.push({
      student: userId,
      enrolledAt: new Date(),
      progress: 0
    });

    course.totalEnrollments += 1;
    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        courseId: course._id,
        enrolledAt: new Date()
      }
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Unenroll from course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrolled
    if (!course.isEnrolled(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Remove student from enrollment
    course.enrolledStudents = course.enrolledStudents.filter(
      enrollment => enrollment.student.toString() !== userId
    );

    course.totalEnrollments = Math.max(0, course.totalEnrollments - 1);
    await course.save();

    // Also remove progress data
    await Progress.deleteMany({ userId, courseId: id });

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });

  } catch (error) {
    console.error('Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's enrolled courses
export const getUserCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'all' } = req.query;

    let query = {
      'enrolledStudents.student': userId,
      isActive: true
    };

    if (status !== 'all') {
      query.status = status;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .select('-enrolledStudents')
      .sort({ 'enrolledStudents.enrolledAt': -1 });

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progressData = await Progress.find({
          userId,
          courseId: course._id
        });

        const totalLessons = progressData.length;
        const completedLessons = progressData.filter(p => p.status === 'completed').length;
        const averageScore = totalLessons > 0
          ? progressData.reduce((sum, p) => sum + p.bestScore, 0) / totalLessons
          : 0;
        const timeSpent = progressData.reduce((sum, p) => sum + p.timeSpent, 0);

        return {
          ...course.toObject(),
          userProgress: {
            totalLessons,
            completedLessons,
            completionPercentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
            averageScore: Math.round(averageScore),
            timeSpent
          }
        };
      })
    );

    res.json({
      success: true,
      data: { courses: coursesWithProgress }
    });

  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

import { validationResult } from 'express-validator';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';

// Get lessons by course
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled (for students)
    if (req.user?.role === 'student' && !course.isEnrolled(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access lessons'
      });
    }

    // Get lessons
    const lessons = await Lesson.findByCourse(courseId);

    // Get user progress for each lesson (if authenticated)
    let lessonsWithProgress = lessons;
    if (userId) {
      lessonsWithProgress = await Promise.all(
        lessons.map(async (lesson) => {
          const progress = await Progress.findOne({
            userId,
            courseId,
            lessonId: lesson._id
          });

          return {
            ...lesson.toObject(),
            userProgress: progress ? {
              status: progress.status,
              completionPercentage: progress.completionPercentage,
              bestScore: progress.bestScore,
              timeSpent: progress.timeSpent,
              lastAccessed: progress.lastAccessedAt
            } : null
          };
        })
      );
    }

    res.json({
      success: true,
      data: { lessons: lessonsWithProgress }
    });

  } catch (error) {
    console.error('Get lessons by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get lesson by ID with detailed content
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const lesson = await Lesson.findById(id)
      .populate('courseId', 'title language level grade instructor enrolledStudents');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user has access to this lesson
    if (req.user?.role === 'student') {
      const course = lesson.courseId;
      if (!course.isEnrolled(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to access this lesson'
        });
      }
    }

    // Get user progress for this lesson
    let userProgress = null;
    if (userId) {
      const progress = await Progress.findOne({
        userId,
        courseId: lesson.courseId._id,
        lessonId: lesson._id
      });

      if (progress) {
        userProgress = {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          bestScore: progress.bestScore,
          currentScore: progress.currentScore,
          timeSpent: progress.timeSpent,
          attempts: progress.attempts,
          activities: progress.activities,
          quizResults: progress.quizResults,
          speechProgress: progress.speechProgress,
          vocabularyProgress: progress.vocabularyProgress,
          lastAccessed: progress.lastAccessedAt
        };
      }
    }

    // Get next and previous lessons
    const nextLesson = await lesson.getNextLesson();
    const previousLesson = await lesson.getPreviousLesson();

    const responseData = {
      ...lesson.toObject(),
      userProgress,
      navigation: {
        nextLesson: nextLesson ? {
          id: nextLesson._id,
          title: nextLesson.title,
          order: nextLesson.order
        } : null,
        previousLesson: previousLesson ? {
          id: previousLesson._id,
          title: previousLesson.title,
          order: previousLesson.order
        } : null
      }
    };

    res.json({
      success: true,
      data: { lesson: responseData }
    });

  } catch (error) {
    console.error('Get lesson by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new lesson
export const createLesson = async (req, res) => {
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
      courseId,
      order,
      type,
      duration,
      content,
      objectives,
      vocabulary,
      activities,
      quiz,
      prerequisites,
      speechRecognition,
      points,
      badges,
      tags,
      difficulty
    } = req.body;

    // Check if course exists and user has permission
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create lessons for your own courses.'
      });
    }

    // Check if lesson order already exists
    const existingLesson = await Lesson.findOne({ courseId, order });
    if (existingLesson) {
      return res.status(400).json({
        success: false,
        message: 'A lesson with this order already exists in the course'
      });
    }

    // Create lesson data
    const lessonData = {
      title,
      description,
      courseId,
      order,
      type,
      duration,
      content: content || {},
      objectives: objectives || [],
      vocabulary: vocabulary || [],
      activities: activities || [],
      quiz: quiz || { questions: [] },
      prerequisites: prerequisites || [],
      speechRecognition: speechRecognition || { enabled: false },
      points: points || { completion: 50, perfectScore: 100, firstAttempt: 25 },
      badges: badges || [],
      tags: tags || [],
      difficulty: difficulty || 'medium',
      isActive: true,
      isPublished: false
    };

    const lesson = await Lesson.create(lessonData);

    // Update course total lessons count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalLessons: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: { lesson }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update lesson
export const updateLesson = async (req, res) => {
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

    const lesson = await Lesson.findById(id).populate('courseId');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && lesson.courseId.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update lessons for your own courses.'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'order', 'type', 'duration', 'content',
      'objectives', 'vocabulary', 'activities', 'quiz', 'prerequisites',
      'speechRecognition', 'points', 'badges', 'tags', 'difficulty',
      'isActive', 'isPublished'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check if order is being changed and if it conflicts
    if (updates.order && updates.order !== lesson.order) {
      const existingLesson = await Lesson.findOne({
        courseId: lesson.courseId._id,
        order: updates.order,
        _id: { $ne: id }
      });

      if (existingLesson) {
        return res.status(400).json({
          success: false,
          message: 'A lesson with this order already exists in the course'
        });
      }
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: { lesson: updatedLesson }
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate('courseId');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check permissions (Admin only for deletion)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can delete lessons.'
      });
    }

    // Check if lesson has progress data
    const progressCount = await Progress.countDocuments({ lessonId: id });
    if (progressCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete lesson with existing student progress. Deactivate it instead.'
      });
    }

    await Lesson.findByIdAndDelete(id);

    // Update course total lessons count
    await Course.findByIdAndUpdate(lesson.courseId._id, {
      $inc: { totalLessons: -1 }
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Complete lesson activity
export const completeLessonActivity = async (req, res) => {
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
    const { activityType, score, timeSpent, answers } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(id).populate('courseId');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user is enrolled
    if (!lesson.courseId.isEnrolled(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to complete activities'
      });
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      userId,
      courseId: lesson.courseId._id,
      lessonId: lesson._id
    });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId: lesson.courseId._id,
        lessonId: lesson._id,
        status: 'in-progress',
        activities: [],
        quizResults: []
      });
    }

    // Update activity progress
    const activityId = `${activityType}-${Date.now()}`;
    progress.completeActivity(activityId, score || 0, timeSpent || 0);

    // If it's a quiz, save detailed results
    if (activityType === 'quiz' && answers) {
      const quizResult = {
        attemptNumber: progress.quizResults.length + 1,
        score: score || 0,
        totalQuestions: answers.length,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        timeSpent: timeSpent || 0,
        answers: answers,
        completedAt: new Date()
      };
      progress.quizResults.push(quizResult);
    }

    // Update best score and current score
    if (score !== undefined) {
      progress.bestScore = Math.max(progress.bestScore, score);
      progress.currentScore = score;
    }

    // Update time spent and attempts
    progress.timeSpent += timeSpent || 0;
    progress.attempts += 1;
    progress.lastAccessedAt = new Date();

    // Update streak
    progress.updateStreak();

    await progress.save();

    // Award points for completion (this will be enhanced in gamification phase)
    let pointsEarned = 0;
    if (activityType === 'quiz' && score >= 70) {
      pointsEarned = lesson.points.completion;
      if (score === 100) pointsEarned += lesson.points.perfectScore;
      if (progress.attempts === 1) pointsEarned += lesson.points.firstAttempt;
    }

    res.json({
      success: true,
      message: 'Activity completed successfully',
      data: {
        progress: {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          bestScore: progress.bestScore,
          timeSpent: progress.timeSpent
        },
        pointsEarned
      }
    });

  } catch (error) {
    console.error('Complete lesson activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get lesson progress
export const getLessonProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const progress = await Progress.findOne({
      userId,
      courseId: lesson.courseId,
      lessonId: lesson._id
    });

    if (!progress) {
      return res.json({
        success: true,
        data: {
          progress: {
            status: 'not-started',
            completionPercentage: 0,
            bestScore: 0,
            timeSpent: 0,
            activities: [],
            quizResults: []
          }
        }
      });
    }

    res.json({
      success: true,
      data: { progress }
    });

  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

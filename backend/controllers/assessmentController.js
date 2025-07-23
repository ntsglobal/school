import { validationResult } from 'express-validator';
import { Assessment, AssessmentAttempt } from '../models/Assessment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';

// Get assessments by course
export const getAssessmentsByCourse = async (req, res) => {
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
        message: 'You must be enrolled in this course to access assessments'
      });
    }

    const assessments = await Assessment.findByCourse(courseId)
      .populate('lessonId', 'title order')
      .populate('createdBy', 'firstName lastName');

    // Get user's attempts for each assessment (if authenticated)
    let assessmentsWithAttempts = assessments;
    if (userId) {
      assessmentsWithAttempts = await Promise.all(
        assessments.map(async (assessment) => {
          const attempts = await AssessmentAttempt.getUserAttempts(userId, assessment._id);
          const bestScore = await assessment.getUserBestScore(userId);
          const canAttempt = await assessment.canUserAttempt(userId);

          return {
            ...assessment.toObject(),
            userAttempts: attempts.length,
            bestScore,
            canAttempt,
            isAvailable: assessment.isAvailable()
          };
        })
      );
    }

    res.json({
      success: true,
      data: { assessments: assessmentsWithAttempts }
    });

  } catch (error) {
    console.error('Get assessments by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get assessment by ID
export const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const assessment = await Assessment.findById(id)
      .populate('courseId', 'title language level instructor enrolledStudents')
      .populate('lessonId', 'title order')
      .populate('createdBy', 'firstName lastName');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check access permissions
    if (req.user?.role === 'student') {
      const course = assessment.courseId;
      if (!course.isEnrolled(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to access this assessment'
        });
      }

      if (!assessment.isAvailable()) {
        return res.status(403).json({
          success: false,
          message: 'This assessment is not currently available'
        });
      }
    }

    // Get user's previous attempts
    let userAttempts = [];
    let canAttempt = true;
    let bestScore = 0;

    if (userId) {
      userAttempts = await AssessmentAttempt.getUserAttempts(userId, assessment._id);
      canAttempt = await assessment.canUserAttempt(userId);
      bestScore = await assessment.getUserBestScore(userId);
    }

    // Remove correct answers for students (unless they've completed it)
    let responseAssessment = assessment.toObject();
    if (req.user?.role === 'student') {
      responseAssessment.questions = assessment.questions.map(q => {
        const question = { ...q.toObject() };
        delete question.correctAnswer;
        if (!assessment.grading.showExplanations) {
          delete question.explanation;
        }
        return question;
      });
    }

    res.json({
      success: true,
      data: {
        assessment: responseAssessment,
        userAttempts: userAttempts.length,
        canAttempt,
        bestScore,
        isAvailable: assessment.isAvailable()
      }
    });

  } catch (error) {
    console.error('Get assessment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new assessment
export const createAssessment = async (req, res) => {
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
      lessonId,
      type,
      timeLimit,
      maxAttempts,
      passingScore,
      questions,
      grading,
      availableFrom,
      availableUntil
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
        message: 'Access denied. You can only create assessments for your own courses.'
      });
    }

    // Validate lesson if provided
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson || lesson.courseId.toString() !== courseId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lesson for this course'
        });
      }
    }

    // Create assessment data
    const assessmentData = {
      title,
      description,
      courseId,
      lessonId,
      type,
      timeLimit: timeLimit || 30,
      maxAttempts: maxAttempts || 3,
      passingScore: passingScore || 70,
      questions: questions || [],
      grading: grading || {},
      availableFrom: availableFrom || new Date(),
      availableUntil,
      createdBy: req.user.id,
      status: 'draft'
    };

    const assessment = await Assessment.create(assessmentData);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { assessment }
    });

  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Start assessment attempt
export const startAssessmentAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assessment = await Assessment.findById(id)
      .populate('courseId', 'enrolledStudents');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if assessment is available
    if (!assessment.isAvailable()) {
      return res.status(403).json({
        success: false,
        message: 'Assessment is not currently available'
      });
    }

    // Check if user can attempt
    const canAttempt = await assessment.canUserAttempt(userId);
    if (!canAttempt) {
      return res.status(403).json({
        success: false,
        message: 'Maximum attempts reached for this assessment'
      });
    }

    // Check if user is enrolled
    if (!assessment.courseId.isEnrolled(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to take this assessment'
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await AssessmentAttempt.findOne({
      assessmentId: id,
      userId,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: { attempt: existingAttempt }
      });
    }

    // Get attempt number
    const attemptCount = await AssessmentAttempt.countDocuments({
      assessmentId: id,
      userId
    });

    // Create new attempt
    const attempt = await AssessmentAttempt.create({
      assessmentId: id,
      userId,
      attemptNumber: attemptCount + 1,
      totalPoints: assessment.totalPoints,
      answers: assessment.questions.map(q => ({
        questionId: q.questionId,
        userAnswer: null,
        isCorrect: false,
        points: 0,
        timeSpent: 0
      }))
    });

    // Prepare questions for attempt (randomize if configured)
    let questions = assessment.questions;
    if (assessment.grading.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    if (assessment.grading.randomizeOptions) {
      questions = questions.map(q => {
        if (q.type === 'multiple-choice' && q.options) {
          const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
          return { ...q.toObject(), options: shuffledOptions };
        }
        return q;
      });
    }

    // Remove correct answers from questions
    const questionsForAttempt = questions.map(q => {
      const question = { ...q.toObject() };
      delete question.correctAnswer;
      return question;
    });

    res.json({
      success: true,
      message: 'Assessment attempt started',
      data: {
        attempt: {
          id: attempt._id,
          attemptNumber: attempt.attemptNumber,
          startedAt: attempt.startedAt,
          timeLimit: assessment.timeLimit
        },
        questions: questionsForAttempt
      }
    });

  } catch (error) {
    console.error('Start assessment attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Submit assessment attempt
export const submitAssessmentAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessmentId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Assessment attempt not found'
      });
    }

    // Check ownership
    if (attempt.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already submitted
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Assessment attempt already submitted'
      });
    }

    const assessment = attempt.assessmentId;

    // Grade the answers
    const gradedAnswers = answers.map(userAnswer => {
      const question = assessment.questions.find(q => q.questionId === userAnswer.questionId);
      if (!question) return userAnswer;

      let isCorrect = false;
      let points = 0;

      // Auto-grading logic based on question type
      switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
          isCorrect = userAnswer.answer === question.correctAnswer;
          break;
        case 'fill-blank':
          // Simple string comparison (could be enhanced with fuzzy matching)
          isCorrect = userAnswer.answer?.toLowerCase().trim() ===
                     question.correctAnswer?.toLowerCase().trim();
          break;
        case 'matching':
          // Compare arrays or objects
          isCorrect = JSON.stringify(userAnswer.answer) ===
                     JSON.stringify(question.correctAnswer);
          break;
        default:
          // For essay, speaking, etc., manual grading required
          isCorrect = false;
      }

      if (isCorrect) {
        points = question.points || 1;
      }

      return {
        questionId: userAnswer.questionId,
        userAnswer: userAnswer.answer,
        isCorrect,
        points,
        timeSpent: userAnswer.timeSpent || 0,
        feedback: isCorrect ? 'Correct!' : question.explanation || 'Incorrect'
      };
    });

    // Update attempt with graded answers
    attempt.answers = gradedAnswers;
    attempt.submitAttempt();

    // Save the attempt
    await attempt.save();

    // Update assessment analytics
    assessment.analytics.totalAttempts += 1;
    const allAttempts = await AssessmentAttempt.find({
      assessmentId: assessment._id,
      status: 'graded'
    });

    if (allAttempts.length > 0) {
      assessment.analytics.averageScore =
        allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length;
      assessment.analytics.averageTime =
        allAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / allAttempts.length;
      assessment.analytics.passRate =
        (allAttempts.filter(a => a.passed).length / allAttempts.length) * 100;
    }

    await assessment.save();

    // Update user progress if this is linked to a lesson
    if (assessment.lessonId) {
      await Progress.findOneAndUpdate(
        {
          userId,
          courseId: assessment.courseId,
          lessonId: assessment.lessonId
        },
        {
          $push: {
            quizResults: {
              attemptNumber: attempt.attemptNumber,
              score: attempt.score,
              totalQuestions: gradedAnswers.length,
              correctAnswers: gradedAnswers.filter(a => a.isCorrect).length,
              timeSpent: Math.round(attempt.timeSpent / 60), // Convert to minutes
              answers: gradedAnswers,
              completedAt: attempt.submittedAt
            }
          },
          $max: { bestScore: attempt.score },
          lastAccessedAt: new Date()
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        attempt: {
          id: attempt._id,
          score: attempt.score,
          passed: attempt.passed,
          timeSpent: attempt.timeSpent,
          submittedAt: attempt.submittedAt
        },
        showResults: assessment.grading.showCorrectAnswers,
        answers: assessment.grading.showCorrectAnswers ? gradedAnswers : undefined
      }
    });

  } catch (error) {
    console.error('Submit assessment attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get assessment results
export const getAssessmentResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessmentId', 'title grading questions')
      .populate('userId', 'firstName lastName');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Assessment attempt not found'
      });
    }

    // Check permissions
    const canView = attempt.userId.toString() === userId ||
                   req.user.role === 'admin' ||
                   req.user.role === 'teacher';

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const assessment = attempt.assessmentId;

    // Prepare detailed results
    const detailedAnswers = attempt.answers.map(answer => {
      const question = assessment.questions.find(q => q.questionId === answer.questionId);

      return {
        questionId: answer.questionId,
        question: question?.question,
        userAnswer: answer.userAnswer,
        correctAnswer: assessment.grading.showCorrectAnswers ? question?.correctAnswer : undefined,
        isCorrect: answer.isCorrect,
        points: answer.points,
        maxPoints: question?.points || 1,
        explanation: assessment.grading.showExplanations ? question?.explanation : undefined,
        feedback: answer.feedback
      };
    });

    res.json({
      success: true,
      data: {
        attempt: {
          id: attempt._id,
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          earnedPoints: attempt.earnedPoints,
          passed: attempt.passed,
          timeSpent: attempt.timeSpent,
          submittedAt: attempt.submittedAt,
          status: attempt.status
        },
        assessment: {
          title: assessment.title,
          passingScore: assessment.passingScore
        },
        answers: detailedAnswers,
        statistics: {
          correctAnswers: attempt.answers.filter(a => a.isCorrect).length,
          totalQuestions: attempt.answers.length,
          accuracy: Math.round((attempt.answers.filter(a => a.isCorrect).length / attempt.answers.length) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Get assessment results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

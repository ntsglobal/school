import apiService from './api.js';

class AssessmentService {
  // Get assessments by course
  async getAssessmentsByCourse(courseId) {
    try {
      const response = await apiService.get(`/assessments/course/${courseId}`);
      return response;
    } catch (error) {
      console.error('Get assessments by course error:', error);
      throw error;
    }
  }

  // Get assessment by ID
  async getAssessmentById(assessmentId) {
    try {
      const response = await apiService.get(`/assessments/${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Get assessment by ID error:', error);
      throw error;
    }
  }

  // Create new assessment (Teacher/Admin only)
  async createAssessment(assessmentData) {
    try {
      const response = await apiService.post('/assessments', assessmentData);
      return response;
    } catch (error) {
      console.error('Create assessment error:', error);
      throw error;
    }
  }

  // Start assessment attempt
  async startAssessmentAttempt(assessmentId) {
    try {
      const response = await apiService.post(`/assessments/${assessmentId}/start`);
      return response;
    } catch (error) {
      console.error('Start assessment attempt error:', error);
      throw error;
    }
  }

  // Submit assessment attempt
  async submitAssessmentAttempt(attemptId, answers) {
    try {
      const response = await apiService.post(`/assessments/attempt/${attemptId}/submit`, {
        answers
      });
      return response;
    } catch (error) {
      console.error('Submit assessment attempt error:', error);
      throw error;
    }
  }

  // Get assessment results
  async getAssessmentResults(attemptId) {
    try {
      const response = await apiService.get(`/assessments/attempt/${attemptId}/results`);
      return response;
    } catch (error) {
      console.error('Get assessment results error:', error);
      throw error;
    }
  }

  // Save answer during assessment (for auto-save functionality)
  async saveAnswer(attemptId, questionId, answer) {
    try {
      const response = await apiService.patch(`/assessments/attempt/${attemptId}/answer`, {
        questionId,
        answer
      });
      return response;
    } catch (error) {
      console.error('Save answer error:', error);
      throw error;
    }
  }

  // Get assessment statistics (for teachers/admins)
  async getAssessmentStatistics(assessmentId) {
    try {
      const response = await apiService.get(`/assessments/${assessmentId}/statistics`);
      return response;
    } catch (error) {
      console.error('Get assessment statistics error:', error);
      throw error;
    }
  }

  // Helper method to calculate remaining time
  calculateRemainingTime(startTime, timeLimit) {
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const totalSeconds = timeLimit * 60;
    const remaining = Math.max(0, totalSeconds - elapsed);
    
    return {
      minutes: Math.floor(remaining / 60),
      seconds: remaining % 60,
      totalSeconds: remaining,
      isExpired: remaining === 0
    };
  }

  // Format time for display
  formatTime(minutes, seconds) {
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // Get question type icon
  getQuestionTypeIcon(type) {
    const icons = {
      'multiple-choice': '🔘',
      'true-false': '✅',
      'fill-blank': '📝',
      'matching': '🔗',
      'essay': '📄',
      'speaking': '🎤',
      'listening': '👂'
    };
    return icons[type] || '❓';
  }

  // Get difficulty color
  getDifficultyColor(difficulty) {
    const colors = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red'
    };
    return colors[difficulty] || 'gray';
  }

  // Calculate score percentage
  calculateScorePercentage(earnedPoints, totalPoints) {
    if (totalPoints === 0) return 0;
    return Math.round((earnedPoints / totalPoints) * 100);
  }

  // Get grade based on score
  getGrade(score) {
    if (score >= 90) return { grade: 'A', color: 'green' };
    if (score >= 80) return { grade: 'B', color: 'blue' };
    if (score >= 70) return { grade: 'C', color: 'yellow' };
    if (score >= 60) return { grade: 'D', color: 'orange' };
    return { grade: 'F', color: 'red' };
  }

  // Validate answer before submission
  validateAnswer(question, answer) {
    if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
      return { isValid: false, message: 'Answer is required' };
    }

    switch (question.type) {
      case 'multiple-choice':
        if (!question.options.includes(answer)) {
          return { isValid: false, message: 'Invalid option selected' };
        }
        break;
      case 'true-false':
        if (!['true', 'false'].includes(answer)) {
          return { isValid: false, message: 'Please select true or false' };
        }
        break;
      case 'fill-blank':
        if (typeof answer !== 'string' || answer.trim().length === 0) {
          return { isValid: false, message: 'Please provide an answer' };
        }
        break;
      case 'matching':
        if (!Array.isArray(answer) || answer.length === 0) {
          return { isValid: false, message: 'Please complete all matches' };
        }
        break;
      case 'essay':
        if (typeof answer !== 'string' || answer.trim().length < 10) {
          return { isValid: false, message: 'Essay must be at least 10 characters long' };
        }
        break;
    }

    return { isValid: true };
  }

  // Auto-save functionality
  setupAutoSave(attemptId, onSave) {
    const autoSaveInterval = 30000; // 30 seconds
    
    return setInterval(async () => {
      try {
        if (onSave) {
          await onSave();
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveInterval);
  }

  // Format assessment for display
  formatAssessmentForDisplay(assessment) {
    return {
      ...assessment,
      formattedTimeLimit: this.formatTime(assessment.timeLimit, 0),
      difficultyColor: this.getDifficultyColor(assessment.difficulty),
      typeIcon: this.getQuestionTypeIcon(assessment.type),
      estimatedDuration: `${assessment.estimatedDuration || assessment.timeLimit} min`
    };
  }

  // Generate assessment summary
  generateAssessmentSummary(assessment, userAttempts) {
    const summary = {
      title: assessment.title,
      type: assessment.type,
      questionCount: assessment.questionCount,
      timeLimit: assessment.timeLimit,
      passingScore: assessment.passingScore,
      maxAttempts: assessment.maxAttempts,
      userAttempts: userAttempts || 0,
      remainingAttempts: Math.max(0, assessment.maxAttempts - (userAttempts || 0)),
      canAttempt: (userAttempts || 0) < assessment.maxAttempts,
      isAvailable: assessment.isAvailable
    };

    return summary;
  }

  // Process assessment results for display
  processResultsForDisplay(results) {
    const { attempt, answers, statistics } = results;
    
    return {
      score: attempt.score,
      grade: this.getGrade(attempt.score),
      passed: attempt.passed,
      timeSpent: this.formatTime(Math.floor(attempt.timeSpent / 60), attempt.timeSpent % 60),
      accuracy: statistics.accuracy,
      correctAnswers: statistics.correctAnswers,
      totalQuestions: statistics.totalQuestions,
      answers: answers.map(answer => ({
        ...answer,
        typeIcon: this.getQuestionTypeIcon(answer.type),
        isCorrectIcon: answer.isCorrect ? '✅' : '❌'
      }))
    };
  }

  // Export assessment data
  async exportAssessmentData(assessmentId, format = 'json') {
    try {
      const response = await apiService.get(`/assessments/${assessmentId}/export?format=${format}`);
      return response;
    } catch (error) {
      console.error('Export assessment data error:', error);
      throw error;
    }
  }

  // Bulk operations for teachers
  async bulkCreateQuestions(assessmentId, questions) {
    try {
      const response = await apiService.post(`/assessments/${assessmentId}/questions/bulk`, {
        questions
      });
      return response;
    } catch (error) {
      console.error('Bulk create questions error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const assessmentService = new AssessmentService();
export default assessmentService;

import apiService from './api.js';

class LessonService {
  // Get lessons by course
  async getLessonsByCourse(courseId) {
    try {
      const response = await apiService.get(`/lessons/course/${courseId}`);
      return response;
    } catch (error) {
      console.error('Get lessons by course error:', error);
      throw error;
    }
  }

  // Get lesson by ID
  async getLessonById(lessonId) {
    try {
      const response = await apiService.get(`/lessons/${lessonId}`);
      return response;
    } catch (error) {
      console.error('Get lesson by ID error:', error);
      throw error;
    }
  }

  // Create new lesson (Teacher/Admin only)
  async createLesson(lessonData) {
    try {
      const response = await apiService.post('/lessons', lessonData);
      return response;
    } catch (error) {
      console.error('Create lesson error:', error);
      throw error;
    }
  }

  // Update lesson (Teacher/Admin only)
  async updateLesson(lessonId, lessonData) {
    try {
      const response = await apiService.put(`/lessons/${lessonId}`, lessonData);
      return response;
    } catch (error) {
      console.error('Update lesson error:', error);
      throw error;
    }
  }

  // Delete lesson (Admin only)
  async deleteLesson(lessonId) {
    try {
      const response = await apiService.delete(`/lessons/${lessonId}`);
      return response;
    } catch (error) {
      console.error('Delete lesson error:', error);
      throw error;
    }
  }

  // Complete lesson activity
  async completeLessonActivity(lessonId, activityData) {
    try {
      const response = await apiService.post(`/lessons/${lessonId}/complete-activity`, activityData);
      return response;
    } catch (error) {
      console.error('Complete lesson activity error:', error);
      throw error;
    }
  }

  // Get lesson progress
  async getLessonProgress(lessonId) {
    try {
      const response = await apiService.get(`/lessons/${lessonId}/progress`);
      return response;
    } catch (error) {
      console.error('Get lesson progress error:', error);
      throw error;
    }
  }

  // Submit quiz answers
  async submitQuiz(lessonId, answers, timeSpent) {
    try {
      const activityData = {
        activityType: 'quiz',
        answers: answers,
        timeSpent: timeSpent,
        score: this.calculateQuizScore(answers)
      };
      
      const response = await this.completeLessonActivity(lessonId, activityData);
      return response;
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw error;
    }
  }

  // Submit speaking exercise
  async submitSpeakingExercise(lessonId, audioData, transcript, pronunciationScore) {
    try {
      const activityData = {
        activityType: 'speaking',
        audioData: audioData,
        transcript: transcript,
        score: pronunciationScore,
        timeSpent: audioData.duration || 0
      };
      
      const response = await this.completeLessonActivity(lessonId, activityData);
      return response;
    } catch (error) {
      console.error('Submit speaking exercise error:', error);
      throw error;
    }
  }

  // Mark video as watched
  async markVideoWatched(lessonId, watchTime, totalDuration) {
    try {
      const completionPercentage = (watchTime / totalDuration) * 100;
      const activityData = {
        activityType: 'video',
        timeSpent: Math.round(watchTime / 60), // Convert to minutes
        score: completionPercentage >= 80 ? 100 : Math.round(completionPercentage)
      };
      
      const response = await this.completeLessonActivity(lessonId, activityData);
      return response;
    } catch (error) {
      console.error('Mark video watched error:', error);
      throw error;
    }
  }

  // Submit exercise answers
  async submitExercise(lessonId, exerciseAnswers, timeSpent) {
    try {
      const activityData = {
        activityType: 'exercise',
        answers: exerciseAnswers,
        timeSpent: timeSpent,
        score: this.calculateExerciseScore(exerciseAnswers)
      };
      
      const response = await this.completeLessonActivity(lessonId, activityData);
      return response;
    } catch (error) {
      console.error('Submit exercise error:', error);
      throw error;
    }
  }

  // Get lesson vocabulary
  async getLessonVocabulary(lessonId) {
    try {
      const lesson = await this.getLessonById(lessonId);
      return {
        success: true,
        data: { vocabulary: lesson.data.lesson.vocabulary || [] }
      };
    } catch (error) {
      console.error('Get lesson vocabulary error:', error);
      throw error;
    }
  }

  // Practice vocabulary
  async practiceVocabulary(lessonId, vocabularyResults) {
    try {
      const activityData = {
        activityType: 'vocabulary',
        answers: vocabularyResults,
        timeSpent: vocabularyResults.reduce((total, result) => total + (result.timeSpent || 0), 0),
        score: this.calculateVocabularyScore(vocabularyResults)
      };
      
      const response = await this.completeLessonActivity(lessonId, activityData);
      return response;
    } catch (error) {
      console.error('Practice vocabulary error:', error);
      throw error;
    }
  }

  // Helper method to calculate quiz score
  calculateQuizScore(answers) {
    if (!answers || answers.length === 0) return 0;
    
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  }

  // Helper method to calculate exercise score
  calculateExerciseScore(exerciseAnswers) {
    if (!exerciseAnswers || exerciseAnswers.length === 0) return 0;
    
    const correctAnswers = exerciseAnswers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / exerciseAnswers.length) * 100);
  }

  // Helper method to calculate vocabulary score
  calculateVocabularyScore(vocabularyResults) {
    if (!vocabularyResults || vocabularyResults.length === 0) return 0;
    
    const correctAnswers = vocabularyResults.filter(result => result.isCorrect).length;
    return Math.round((correctAnswers / vocabularyResults.length) * 100);
  }

  // Helper method to format lesson duration
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  // Helper method to get lesson type icon
  getLessonTypeIcon(type) {
    const icons = {
      video: '🎥',
      interactive: '🎮',
      quiz: '📝',
      speaking: '🎤',
      listening: '👂',
      reading: '📖',
      writing: '✍️'
    };
    return icons[type] || '📚';
  }

  // Helper method to get difficulty color
  getDifficultyColor(difficulty) {
    const colors = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red'
    };
    return colors[difficulty] || 'gray';
  }

  // Helper method to format lesson for display
  formatLessonForDisplay(lesson) {
    return {
      ...lesson,
      formattedDuration: this.formatDuration(lesson.duration),
      typeIcon: this.getLessonTypeIcon(lesson.type),
      difficultyColor: this.getDifficultyColor(lesson.difficulty),
      estimatedTime: this.formatDuration(lesson.estimatedTime || lesson.duration)
    };
  }

  // Bulk operations for course management
  async reorderLessons(courseId, lessonOrders) {
    try {
      const response = await apiService.patch(`/lessons/course/${courseId}/reorder`, {
        lessonOrders
      });
      return response;
    } catch (error) {
      console.error('Reorder lessons error:', error);
      throw error;
    }
  }

  // Publish lesson
  async publishLesson(lessonId) {
    try {
      const response = await apiService.patch(`/lessons/${lessonId}`, {
        isPublished: true
      });
      return response;
    } catch (error) {
      console.error('Publish lesson error:', error);
      throw error;
    }
  }

  // Unpublish lesson
  async unpublishLesson(lessonId) {
    try {
      const response = await apiService.patch(`/lessons/${lessonId}`, {
        isPublished: false
      });
      return response;
    } catch (error) {
      console.error('Unpublish lesson error:', error);
      throw error;
    }
  }

  // Get recorded lessons (video lessons only)
  async getRecordedLessons(filters = {}) {
    try {
      const params = {
        type: 'video',
        isPublished: true,
        ...filters
      };
      const response = await apiService.get('/lessons/recorded', { params });
      return response;
    } catch (error) {
      console.error('Get recorded lessons error:', error);
      throw error;
    }
  }

  // Get lessons by language
  async getLessonsByLanguage(language, level = null) {
    try {
      const params = { language };
      if (level) params.level = level;
      
      const response = await apiService.get('/lessons/by-language', { params });
      return response;
    } catch (error) {
      console.error('Get lessons by language error:', error);
      throw error;
    }
  }

  // Get user's lesson progress
  async getUserLessonProgress(userId = null) {
    try {
      const endpoint = userId ? `/lessons/progress/${userId}` : '/lessons/progress';
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get user lesson progress error:', error);
      throw error;
    }
  }

  // Mark lesson as watched
  async markLessonAsWatched(lessonId, watchTime = 0) {
    try {
      const response = await apiService.post(`/lessons/${lessonId}/watch`, {
        watchTime,
        completedAt: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('Mark lesson as watched error:', error);
      throw error;
    }
  }

  // Get lesson recommendations
  async getLessonRecommendations(userId = null) {
    try {
      const endpoint = userId ? `/lessons/recommendations/${userId}` : '/lessons/recommendations';
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get lesson recommendations error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const lessonService = new LessonService();
export default lessonService;

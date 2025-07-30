import apiService from './api.js';

class CourseService {
  // Get all courses with filtering
  async getAllCourses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/courses?${queryString}` : '/courses';
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get all courses error:', error);
      throw error;
    }
  }

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const response = await apiService.get(`/courses/${courseId}`);
      return response;
    } catch (error) {
      console.error('Get course by ID error:', error);
      throw error;
    }
  }

  // Create new course (Teacher/Admin only)
  async createCourse(courseData) {
    try {
      const response = await apiService.post('/courses', courseData);
      return response;
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  }

  // Update course (Teacher/Admin only)
  async updateCourse(courseId, courseData) {
    try {
      const response = await apiService.put(`/courses/${courseId}`, courseData);
      return response;
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  }

  // Delete course (Admin only)
  async deleteCourse(courseId) {
    try {
      const response = await apiService.delete(`/courses/${courseId}`);
      return response;
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  }

  // Get courses by language
  async getCoursesByLanguage(language, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `/courses/language/${language}?${queryString}` 
        : `/courses/language/${language}`;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get courses by language error:', error);
      throw error;
    }
  }

  // Get courses by CEFR level
  async getCoursesByLevel(level, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `/courses/level/${level}?${queryString}` 
        : `/courses/level/${level}`;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get courses by level error:', error);
      throw error;
    }
  }

  // Get courses by grade
  async getCoursesByGrade(grade, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `/courses/grade/${grade}?${queryString}` 
        : `/courses/grade/${grade}`;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get courses by grade error:', error);
      throw error;
    }
  }

  // Enroll in course
  async enrollInCourse(courseId) {
    try {
      const response = await apiService.post(`/courses/${courseId}/enroll`);
      return response;
    } catch (error) {
      console.error('Enroll in course error:', error);
      throw error;
    }
  }

  // Unenroll from course
  async unenrollFromCourse(courseId) {
    try {
      const response = await apiService.delete(`/courses/${courseId}/unenroll`);
      return response;
    } catch (error) {
      console.error('Unenroll from course error:', error);
      throw error;
    }
  }

  // Get user's enrolled courses
  async getUserCourses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/courses/user/enrolled?${queryString}` : '/courses/user/enrolled';
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get user courses error:', error);
      throw error;
    }
  }

  // Search courses
  async searchCourses(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await this.getAllCourses(params);
      return response;
    } catch (error) {
      console.error('Search courses error:', error);
      throw error;
    }
  }

  // Get featured courses
  async getFeaturedCourses(limit = 6) {
    try {
      const params = {
        limit,
        sort: 'featured'
      };
      const response = await this.getAllCourses(params);
      return response;
    } catch (error) {
      console.error('Get featured courses error:', error);
      throw error;
    }
  }

  // Get popular courses
  async getPopularCourses(limit = 6) {
    try {
      const params = {
        limit,
        sort: 'popular'
      };
      const response = await this.getAllCourses(params);
      return response;
    } catch (error) {
      console.error('Get popular courses error:', error);
      throw error;
    }
  }

  // Get course statistics (for instructors/admins)
  async getCourseStatistics(courseId) {
    try {
      const response = await apiService.get(`/courses/${courseId}/statistics`);
      return response;
    } catch (error) {
      console.error('Get course statistics error:', error);
      throw error;
    }
  }

  // Publish course (Teacher/Admin only)
  async publishCourse(courseId) {
    try {
      const response = await apiService.patch(`/courses/${courseId}`, { status: 'published' });
      return response;
    } catch (error) {
      console.error('Publish course error:', error);
      throw error;
    }
  }

  // Archive course (Teacher/Admin only)
  async archiveCourse(courseId) {
    try {
      const response = await apiService.patch(`/courses/${courseId}`, { status: 'archived' });
      return response;
    } catch (error) {
      console.error('Archive course error:', error);
      throw error;
    }
  }

  // Get course reviews
  async getCourseReviews(courseId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `/courses/${courseId}/reviews?${queryString}` 
        : `/courses/${courseId}/reviews`;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get course reviews error:', error);
      throw error;
    }
  }

  // Add course review
  async addCourseReview(courseId, reviewData) {
    try {
      const response = await apiService.post(`/courses/${courseId}/reviews`, reviewData);
      return response;
    } catch (error) {
      console.error('Add course review error:', error);
      throw error;
    }
  }

  // Get course categories/filters
  async getCourseFilters() {
    try {
      const response = await apiService.get('/courses/filters');
      return response;
    } catch (error) {
      console.error('Get course filters error:', error);
      throw error;
    }
  }

  // Helper method to format course data for display
  formatCourseForDisplay(course) {
    return {
      ...course,
      formattedPrice: course.price === 0 ? 'Free' : `${course.currency} ${course.price}`,
      formattedDuration: `${course.estimatedDuration} hours`,
      difficultyColor: this.getDifficultyColor(course.difficulty),
      levelColor: this.getLevelColor(course.level),
      languageFlag: this.getLanguageFlag(course.language)
    };
  }

  // Helper method to get difficulty color
  getDifficultyColor(difficulty) {
    const colors = {
      beginner: 'green',
      intermediate: 'yellow',
      advanced: 'red'
    };
    return colors[difficulty] || 'gray';
  }

  // Helper method to get CEFR level color
  getLevelColor(level) {
    const colors = {
      A1: 'blue',
      A2: 'indigo',
      B1: 'purple'
    };
    return colors[level] || 'gray';
  }

  // Helper method to get language flag
  getLanguageFlag(language) {
    const flags = {
      french: '🇫🇷',
      japanese: '🇯🇵',
      german: '🇩🇪',
      spanish: '🇪🇸',
      korean: '🇰🇷'
    };
    return flags[language] || '🌍';
  }
}

// Create and export a singleton instance
const courseService = new CourseService();
export default courseService;

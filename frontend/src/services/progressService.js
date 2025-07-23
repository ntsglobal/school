import apiService from './api.js';

class ProgressService {
  // Get comprehensive user progress
  async getUserProgress(userId) {
    try {
      const response = await apiService.get(`/progress/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }

  // Get course-specific progress
  async getCourseProgress(userId, courseId) {
    try {
      const response = await apiService.get(`/progress/user/${userId}/course/${courseId}`);
      return response;
    } catch (error) {
      console.error('Get course progress error:', error);
      throw error;
    }
  }

  // Get lesson-specific progress
  async getLessonProgress(userId, lessonId) {
    try {
      const response = await apiService.get(`/progress/user/${userId}/lesson/${lessonId}`);
      return response;
    } catch (error) {
      console.error('Get lesson progress error:', error);
      throw error;
    }
  }

  // Update progress
  async updateProgress(userId, lessonId, progressData) {
    try {
      const response = await apiService.put(`/progress/user/${userId}/lesson/${lessonId}`, progressData);
      return response;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  // Get progress analytics
  async getProgressAnalytics(userId, timeframe = '30d') {
    try {
      const response = await apiService.get(`/progress/user/${userId}/analytics?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      console.error('Get progress analytics error:', error);
      throw error;
    }
  }

  // Get weekly report
  async getWeeklyReport(userId) {
    try {
      const response = await apiService.get(`/progress/user/${userId}/report/weekly`);
      return response;
    } catch (error) {
      console.error('Get weekly report error:', error);
      throw error;
    }
  }

  // Get monthly report
  async getMonthlyReport(userId) {
    try {
      const response = await apiService.get(`/progress/user/${userId}/report/monthly`);
      return response;
    } catch (error) {
      console.error('Get monthly report error:', error);
      throw error;
    }
  }

  // Get current user's progress (convenience method)
  async getCurrentUserProgress() {
    try {
      // This would get the current user ID from auth context
      const response = await apiService.get('/progress/user/me');
      return response;
    } catch (error) {
      console.error('Get current user progress error:', error);
      throw error;
    }
  }

  // Calculate completion percentage
  calculateCompletionPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  // Format study time
  formatStudyTime(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  }

  // Get progress color based on percentage
  getProgressColor(percentage) {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'blue';
    if (percentage >= 40) return 'yellow';
    if (percentage >= 20) return 'orange';
    return 'red';
  }

  // Get mastery level color
  getMasteryColor(level) {
    const colors = {
      expert: 'purple',
      proficient: 'green',
      developing: 'blue',
      beginner: 'gray'
    };
    return colors[level] || 'gray';
  }

  // Format score for display
  formatScore(score) {
    return `${Math.round(score)}%`;
  }

  // Get streak emoji
  getStreakEmoji(streakDays) {
    if (streakDays >= 30) return '🔥';
    if (streakDays >= 14) return '⚡';
    if (streakDays >= 7) return '✨';
    if (streakDays >= 3) return '💪';
    return '📚';
  }

  // Calculate study consistency
  calculateConsistency(studyDays, totalDays) {
    if (totalDays === 0) return 0;
    return Math.round((studyDays / totalDays) * 100);
  }

  // Get performance trend
  getPerformanceTrend(currentScore, previousScore) {
    if (currentScore > previousScore) return 'improving';
    if (currentScore < previousScore) return 'declining';
    return 'stable';
  }

  // Format progress data for charts
  formatProgressForChart(progressData) {
    return progressData.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      score: item.score,
      timeSpent: item.timeSpent,
      lessonsCompleted: item.lessonsCompleted
    }));
  }

  // Get next milestone
  getNextMilestone(currentProgress) {
    const milestones = [
      { threshold: 10, title: 'Getting Started', description: 'Complete 10 lessons' },
      { threshold: 25, title: 'Making Progress', description: 'Complete 25 lessons' },
      { threshold: 50, title: 'Halfway There', description: 'Complete 50 lessons' },
      { threshold: 100, title: 'Century Club', description: 'Complete 100 lessons' },
      { threshold: 200, title: 'Dedicated Learner', description: 'Complete 200 lessons' },
      { threshold: 500, title: 'Language Master', description: 'Complete 500 lessons' }
    ];

    return milestones.find(milestone => 
      currentProgress.lessonsCompleted < milestone.threshold
    ) || milestones[milestones.length - 1];
  }

  // Calculate time to goal
  calculateTimeToGoal(currentProgress, targetLessons, averageLessonsPerWeek) {
    const remainingLessons = targetLessons - currentProgress.lessonsCompleted;
    if (remainingLessons <= 0) return 'Goal achieved!';
    if (averageLessonsPerWeek === 0) return 'Unable to estimate';

    const weeksToGoal = Math.ceil(remainingLessons / averageLessonsPerWeek);
    
    if (weeksToGoal === 1) return '1 week';
    if (weeksToGoal < 4) return `${weeksToGoal} weeks`;
    if (weeksToGoal < 52) return `${Math.ceil(weeksToGoal / 4)} months`;
    return `${Math.ceil(weeksToGoal / 52)} years`;
  }

  // Get study recommendations
  getStudyRecommendations(analytics) {
    const recommendations = [];

    if (analytics.studyTime.average < 30) {
      recommendations.push({
        type: 'time',
        title: 'Increase Study Time',
        description: 'Try to study for at least 30 minutes per session for better retention.',
        priority: 'high'
      });
    }

    if (analytics.performance.averageScore < 70) {
      recommendations.push({
        type: 'performance',
        title: 'Review Previous Lessons',
        description: 'Consider reviewing lessons where you scored below 70% to strengthen your understanding.',
        priority: 'high'
      });
    }

    if (analytics.streaks.current === 0) {
      recommendations.push({
        type: 'consistency',
        title: 'Build a Study Streak',
        description: 'Try to study every day to build momentum and improve retention.',
        priority: 'medium'
      });
    }

    if (analytics.completion.completionRate < 50) {
      recommendations.push({
        type: 'completion',
        title: 'Focus on Completion',
        description: 'Try to complete lessons fully before moving to new ones.',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Export progress data
  async exportProgressData(userId, format = 'json') {
    try {
      const response = await apiService.get(`/progress/user/${userId}/export?format=${format}`);
      return response;
    } catch (error) {
      console.error('Export progress data error:', error);
      throw error;
    }
  }

  // Compare progress with peers (if available)
  async compareWithPeers(userId, courseId) {
    try {
      const response = await apiService.get(`/progress/user/${userId}/compare?courseId=${courseId}`);
      return response;
    } catch (error) {
      console.error('Compare with peers error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const progressService = new ProgressService();
export default progressService;

import apiService from './api.js';

class GamificationService {
  // Get user's gamification data
  async getUserGamification(userId) {
    try {
      const response = await apiService.get(`/gamification/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Get user gamification error:', error);
      throw error;
    }
  }

  // Get current user's gamification data (convenience method)
  async getCurrentUserGamification() {
    try {
      const response = await apiService.get('/gamification/user/me');
      return response;
    } catch (error) {
      console.error('Get current user gamification error:', error);
      throw error;
    }
  }

  // ============ AUTOMATIC POINT AWARDING ============

  // Award points for lesson completion
  async awardLessonPoints(userId, lessonData) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/lesson-complete`, lessonData);
      return response;
    } catch (error) {
      console.error('Award lesson points error:', error);
      throw error;
    }
  }

  // Award points for vocabulary learning
  async awardVocabularyPoints(userId, wordsLearned) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/vocabulary-learned`, { 
        wordsLearned 
      });
      return response;
    } catch (error) {
      console.error('Award vocabulary points error:', error);
      throw error;
    }
  }

  // Award points for grammar exercises
  async awardGrammarPoints(userId, exerciseData) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/grammar-exercise`, exerciseData);
      return response;
    } catch (error) {
      console.error('Award grammar points error:', error);
      throw error;
    }
  }

  // Award points for pronunciation exercises
  async awardPronunciationPoints(userId, score) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/pronunciation-exercise`, { 
        score 
      });
      return response;
    } catch (error) {
      console.error('Award pronunciation points error:', error);
      throw error;
    }
  }

  // Award points for live class attendance
  async awardLiveClassPoints(userId, classData) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/live-class-attended`, classData);
      return response;
    } catch (error) {
      console.error('Award live class points error:', error);
      throw error;
    }
  }

  // ============ MANUAL POINT AWARDING (Teacher/Admin) ============

  // Award points to user (Teacher/Admin only)
  async awardPoints(userId, pointsData) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/points`, pointsData);
      return response;
    } catch (error) {
      console.error('Award points error:', error);
      throw error;
    }
  }

  // Award badge to user (Teacher/Admin only)
  async awardBadge(userId, badgeData) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/badge`, badgeData);
      return response;
    } catch (error) {
      console.error('Award badge error:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(type = 'total', limit = 10) {
    try {
      const response = await apiService.get(`/gamification/leaderboard?type=${type}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  // Get global leaderboard
  async getGlobalLeaderboard(limit = 10) {
    try {
      const response = await this.getLeaderboard('total', limit);
      return response;
    } catch (error) {
      console.error('Get global leaderboard error:', error);
      throw error;
    }
  }

  // Get weekly leaderboard
  async getWeeklyLeaderboard(limit = 10) {
    try {
      const response = await this.getLeaderboard('weekly', limit);
      return response;
    } catch (error) {
      console.error('Get weekly leaderboard error:', error);
      throw error;
    }
  }

  // Get monthly leaderboard
  async getMonthlyLeaderboard(limit = 10) {
    try {
      const response = await this.getLeaderboard('monthly', limit);
      return response;
    } catch (error) {
      console.error('Get monthly leaderboard error:', error);
      throw error;
    }
  }

  // Get user badges
  async getUserBadges(userId, category = null) {
    try {
      const params = category ? `?category=${category}` : '';
      const response = await apiService.get(`/gamification/user/${userId}/badges${params}`);
      return response;
    } catch (error) {
      console.error('Get user badges error:', error);
      throw error;
    }
  }

  // Update user streak
  async updateStreak(userId) {
    try {
      const response = await apiService.post(`/gamification/user/${userId}/streak`);
      return response;
    } catch (error) {
      console.error('Update streak error:', error);
      throw error;
    }
  }

  // Get user achievements
  async getAchievements(userId, status = 'all') {
    try {
      const response = await apiService.get(`/gamification/user/${userId}/achievements?status=${status}`);
      return response;
    } catch (error) {
      console.error('Get achievements error:', error);
      throw error;
    }
  }

  // Helper method to calculate level from experience
  calculateLevel(experience) {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  // Helper method to calculate experience needed for next level
  calculateExperienceToNextLevel(currentLevel) {
    // Experience needed for level n: (n-1)^2 * 100
    return Math.pow(currentLevel, 2) * 100;
  }

  // Helper method to get level color
  getLevelColor(level) {
    if (level >= 50) return 'text-purple-600';
    if (level >= 25) return 'text-red-600';
    if (level >= 10) return 'text-orange-600';
    if (level >= 5) return 'text-blue-600';
    return 'text-green-600';
  }

  // Helper method to get badge rarity color
  getBadgeRarityColor(rarity) {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      uncommon: 'bg-green-100 text-green-800 border-green-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity] || colors.common;
  }

  // Helper method to get streak emoji
  getStreakEmoji(streakDays) {
    if (streakDays >= 100) return '🌟';
    if (streakDays >= 30) return '🔥';
    if (streakDays >= 14) return '⚡';
    if (streakDays >= 7) return '✨';
    if (streakDays >= 3) return '💪';
    return '📚';
  }

  // Helper method to format points
  formatPoints(points) {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  }

  // Helper method to get achievement progress color
  getProgressColor(percentage) {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Helper method to calculate rank suffix
  getRankSuffix(rank) {
    if (rank % 100 >= 11 && rank % 100 <= 13) {
      return 'th';
    }
    switch (rank % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  // Helper method to format rank
  formatRank(rank) {
    return `${rank}${this.getRankSuffix(rank)}`;
  }

  // Helper method to get level title
  getLevelTitle(level) {
    if (level >= 100) return 'Language Legend';
    if (level >= 50) return 'Master Student';
    if (level >= 25) return 'Language Explorer';
    if (level >= 10) return 'Dedicated Learner';
    if (level >= 5) return 'Rising Star';
    return 'Beginner';
  }

  // Helper method to simulate point earning (for demo purposes)
  simulatePointEarning(action) {
    const pointValues = {
      'lesson_complete': 50,
      'quiz_perfect': 100,
      'quiz_good': 75,
      'quiz_pass': 50,
      'daily_goal': 25,
      'streak_bonus': 10,
      'first_attempt': 25,
      'vocabulary_master': 30,
      'speaking_practice': 40
    };
    
    return pointValues[action] || 10;
  }

  // Helper method to check if user can earn specific badge
  canEarnBadge(userStats, badgeRequirements) {
    for (const [requirement, value] of Object.entries(badgeRequirements)) {
      if (userStats[requirement] < value) {
        return false;
      }
    }
    return true;
  }

  // Helper method to get next milestone
  getNextMilestone(currentPoints) {
    const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
    return milestones.find(milestone => milestone > currentPoints) || null;
  }

  // Helper method to calculate progress to next milestone
  getProgressToNextMilestone(currentPoints) {
    const nextMilestone = this.getNextMilestone(currentPoints);
    if (!nextMilestone) return 100;
    
    const previousMilestone = currentPoints < 100 ? 0 : 
      [...[100, 500, 1000, 2500, 5000, 10000, 25000, 50000]].reverse()
        .find(milestone => milestone <= currentPoints) || 0;
    
    const progress = ((currentPoints - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  // Helper method to get motivational message based on progress
  getMotivationalMessage(gamificationData) {
    const { level, currentStreak, totalPoints } = gamificationData;
    
    if (currentStreak >= 30) {
      return "🔥 You're on fire! Amazing consistency!";
    }
    if (currentStreak >= 7) {
      return "⚡ Great streak! Keep it going!";
    }
    if (level >= 25) {
      return "🌟 You're becoming a language master!";
    }
    if (level >= 10) {
      return "🎓 Excellent progress! You're doing great!";
    }
    if (totalPoints >= 1000) {
      return "💎 You're collecting points like a pro!";
    }
    
    return "📚 Keep learning and growing!";
  }
}

// Create and export a singleton instance
const gamificationService = new GamificationService();
export default gamificationService;

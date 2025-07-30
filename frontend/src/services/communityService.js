import api from './api';
import authService from './authService';

/**
 * CommunityService for handling community operations
 * This service provides methods to interact with the community backend API
 */
class CommunityService {
  /**
   * Get community statistics
   * @returns {Promise} - Response with community stats
   */
  async getCommunityStats() {
    try {
      const token = await authService.getToken();
      const response = await api.get('/community/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching community stats:', error);
      throw error;
    }
  }

  /**
   * Get language forums
   * @returns {Promise} - Response with forums data
   */
  async getLanguageForums() {
    try {
      const token = await authService.getToken();
      const response = await api.get('/community/forums', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching language forums:', error);
      throw error;
    }
  }

  /**
   * Join a language forum
   * @param {string} forumId - The forum ID to join
   * @returns {Promise} - Response with join status
   */
  async joinForum(forumId) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/community/forums/${forumId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error joining forum ${forumId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a language forum
   * @param {string} forumId - The forum ID to leave
   * @returns {Promise} - Response with leave status
   */
  async leaveForum(forumId) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/community/forums/${forumId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error leaving forum ${forumId}:`, error);
      throw error;
    }
  }

  /**
   * Get active discussions
   * @param {Object} filters - Optional filters (language, category, etc.)
   * @returns {Promise} - Response with discussions data
   */
  async getActiveDiscussions(filters = {}) {
    try {
      const token = await authService.getToken();
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await api.get(`/community/discussions?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching active discussions:', error);
      throw error;
    }
  }

  /**
   * Create a new discussion
   * @param {Object} discussionData - The discussion data
   * @returns {Promise} - Response with created discussion
   */
  async createDiscussion(discussionData) {
    try {
      const token = await authService.getToken();
      const response = await api.post('/community/discussions', discussionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  /**
   * Reply to a discussion
   * @param {string} discussionId - The discussion ID
   * @param {Object} replyData - The reply data
   * @returns {Promise} - Response with created reply
   */
  async replyToDiscussion(discussionId, replyData) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/community/discussions/${discussionId}/replies`, replyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error replying to discussion ${discussionId}:`, error);
      throw error;
    }
  }

  /**
   * Get practice groups
   * @param {string} language - Optional language filter
   * @returns {Promise} - Response with practice groups data
   */
  async getPracticeGroups(language = null) {
    try {
      const token = await authService.getToken();
      const endpoint = language ? `/community/practice-groups?language=${language}` : '/community/practice-groups';
      
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching practice groups:', error);
      throw error;
    }
  }

  /**
   * Join a practice group
   * @param {string} groupId - The group ID to join
   * @returns {Promise} - Response with join status
   */
  async joinPracticeGroup(groupId) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/community/practice-groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error joining practice group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a practice group
   * @param {string} groupId - The group ID to leave
   * @returns {Promise} - Response with leave status
   */
  async leavePracticeGroup(groupId) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/community/practice-groups/${groupId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error leaving practice group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get community champions
   * @returns {Promise} - Response with champions data
   */
  async getCommunityChampions() {
    try {
      const token = await authService.getToken();
      const response = await api.get('/community/champions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching community champions:', error);
      throw error;
    }
  }

  /**
   * Get community guidelines
   * @returns {Promise} - Response with guidelines data
   */
  async getCommunityGuidelines() {
    try {
      const response = await api.get('/community/guidelines');
      return response.data;
    } catch (error) {
      console.error('Error fetching community guidelines:', error);
      throw error;
    }
  }

  /**
   * Report a post or discussion
   * @param {string} contentId - The content ID to report
   * @param {string} contentType - The type of content (discussion, reply, etc.)
   * @param {string} reason - The reason for reporting
   * @returns {Promise} - Response with report status
   */
  async reportContent(contentId, contentType, reason) {
    try {
      const token = await authService.getToken();
      const response = await api.post('/community/reports', {
        contentId,
        contentType,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  /**
   * Like/unlike a discussion or reply
   * @param {string} contentId - The content ID
   * @param {string} contentType - The type of content
   * @returns {Promise} - Response with like status
   */
  async toggleLike(contentId, contentType) {
    try {
      const token = await authService.getToken();
      const response = await api.post('/community/likes', {
        contentId,
        contentType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Get user's community activity
   * @returns {Promise} - Response with user activity data
   */
  async getUserActivity() {
    try {
      const token = await authService.getToken();
      const response = await api.get('/community/user/activity', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  /**
   * Search community content
   * @param {string} query - The search query
   * @param {Object} filters - Optional filters
   * @returns {Promise} - Response with search results
   */
  async searchCommunity(query, filters = {}) {
    try {
      const token = await authService.getToken();
      const queryParams = new URLSearchParams({ query });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await api.get(`/community/search?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching community:', error);
      throw error;
    }
  }
}

export default new CommunityService();

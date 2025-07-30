import api from './api';

const languageService = {
  // Get all available languages
  getAllLanguages: async () => {
    try {
      const response = await api.get('/languages');
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  },

  // Get language by ID
  getLanguageById: async (id) => {
    try {
      const response = await api.get(`/languages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching language:', error);
      throw error;
    }
  },

  // Get languages by CEFR level
  getLanguagesByLevel: async (level) => {
    try {
      const response = await api.get(`/languages/level/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching languages by level:', error);
      throw error;
    }
  },

  // Get languages by grade
  getLanguagesByGrade: async (grade) => {
    try {
      const response = await api.get(`/languages/grade/${grade}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching languages by grade:', error);
      throw error;
    }
  },

  // Update language statistics
  updateLanguageStats: async (id, stats) => {
    try {
      const response = await api.put(`/languages/${id}/stats`, stats);
      return response.data;
    } catch (error) {
      console.error('Error updating language stats:', error);
      throw error;
    }
  },

  // Cultural Content API calls
  getCulturalContent: async (params = {}) => {
    try {
      const response = await api.get('/cultural-content', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cultural content:', error);
      throw error;
    }
  },

  getCulturalContentById: async (id) => {
    try {
      const response = await api.get(`/cultural-content/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cultural content:', error);
      throw error;
    }
  },

  getFeaturedContent: async (language = null) => {
    try {
      const params = language ? { language } : {};
      const response = await api.get('/cultural-content/featured', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured content:', error);
      throw error;
    }
  },

  getContentByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/cultural-content/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching content by category:', error);
      throw error;
    }
  },

  submitQuizAnswers: async (contentId, answers) => {
    try {
      const response = await api.post(`/cultural-content/${contentId}/quiz`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  rateContent: async (contentId, rating) => {
    try {
      const response = await api.post(`/cultural-content/${contentId}/rate`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error rating content:', error);
      throw error;
    }
  },

  // Community API calls
  getForums: async (params = {}) => {
    try {
      const response = await api.get('/community/forums', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching forums:', error);
      throw error;
    }
  },

  getForumById: async (id, params = {}) => {
    try {
      const response = await api.get(`/community/forums/${id}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching forum:', error);
      throw error;
    }
  },

  createForumPost: async (postData) => {
    try {
      const response = await api.post('/community/forums', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }
  },

  replyToPost: async (postId, content) => {
    try {
      const response = await api.post(`/community/forums/${postId}/reply`, { content });
      return response.data;
    } catch (error) {
      console.error('Error replying to post:', error);
      throw error;
    }
  },

  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  getLanguageBuddies: async (params = {}) => {
    try {
      const response = await api.get('/community/buddies', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching language buddies:', error);
      throw error;
    }
  },

  createBuddyRequest: async (requestData) => {
    try {
      const response = await api.post('/community/buddies', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating buddy request:', error);
      throw error;
    }
  },

  searchPosts: async (params = {}) => {
    try {
      const response = await api.get('/community/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  // Certification API calls
  getUserCertifications: async () => {
    try {
      const response = await api.get('/certifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching user certifications:', error);
      throw error;
    }
  },

  getCertificationById: async (id) => {
    try {
      const response = await api.get(`/certifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certification:', error);
      throw error;
    }
  },

  verifyCertification: async (verificationCode) => {
    try {
      const response = await api.get(`/certifications/verify/${verificationCode}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying certification:', error);
      throw error;
    }
  },

  generateDigitalBadge: async (certificationId) => {
    try {
      const response = await api.get(`/certifications/${certificationId}/badge`);
      return response.data;
    } catch (error) {
      console.error('Error generating digital badge:', error);
      throw error;
    }
  },

  shareCertification: async (certificationId, platform) => {
    try {
      const response = await api.post(`/certifications/${certificationId}/share`, { platform });
      return response.data;
    } catch (error) {
      console.error('Error sharing certification:', error);
      throw error;
    }
  },

  getCertificationsByLanguage: async (languageId, params = {}) => {
    try {
      const response = await api.get(`/certifications/language/${languageId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching certifications by language:', error);
      throw error;
    }
  }
};

export default languageService;

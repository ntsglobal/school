import api from './api';
import authService from './authService';

/**
 * LiveClassService for handling live class operations
 * This service provides methods to interact with the live class backend API
 */
class LiveClassService {
  /**
   * Get all live classes with optional filtering
   * @param {Object} filters - Optional filters (language, level, instructor, status)
   * @returns {Promise} - Response with live classes data
   */
  async getAllLiveClasses(filters = {}) {
    try {
      const token = await authService.getToken();
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await api.get(`/liveClasses?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching live classes:', error);
      throw error;
    }
  }

  /**
   * Get a live class by ID
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with the live class data
   */
  async getLiveClassById(id) {
    try {
      const token = await authService.getToken();
      const response = await api.get(`/liveClasses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching live class with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new live class (teacher/admin only)
   * @param {Object} liveClassData - The live class data
   * @returns {Promise} - Response with the created live class
   */
  async createLiveClass(liveClassData) {
    try {
      const token = await authService.getToken();
      const response = await api.post('/liveClasses', liveClassData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating live class:', error);
      throw error;
    }
  }

  /**
   * Update an existing live class (teacher/admin only)
   * @param {string} id - The live class ID
   * @param {Object} updates - The data to update
   * @returns {Promise} - Response with the updated live class
   */
  async updateLiveClass(id, updates) {
    try {
      const token = await authService.getToken();
      const response = await api.put(`/liveClasses/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating live class with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a live class (admin only)
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with deletion status
   */
  async deleteLiveClass(id) {
    try {
      const token = await authService.getToken();
      const response = await api.delete(`/liveClasses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting live class with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Join a live class
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with join status
   */
  async joinLiveClass(id) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/liveClasses/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error joining live class with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Leave a live class
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with leave status
   */
  async leaveLiveClass(id) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/liveClasses/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error leaving live class with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get upcoming live classes
   * @returns {Promise} - Response with upcoming classes
   */
  async getUpcomingClasses() {
    try {
      const token = await authService.getToken();
      const response = await api.get('/liveClasses/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming classes:', error);
      throw error;
    }
  }

  /**
   * Get live classes for the current user
   * @returns {Promise} - Response with user's live classes
   */
  async getUserLiveClasses() {
    try {
      const token = await authService.getToken();
      const response = await api.get('/liveClasses/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user live classes:', error);
      throw error;
    }
  }
  
  /**
   * Join a video call for a live class
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with video room details
   */
  async joinVideoCall(id) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/liveClasses/${id}/video/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error joining video call for live class ${id}:`, error);
      throw error;
    }
  }

  /**
   * Leave a video call for a live class
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with leave status
   */
  async leaveVideoCall(id) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/liveClasses/${id}/video/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error leaving video call for live class ${id}:`, error);
      throw error;
    }
  }

  /**
   * Start a live class (teacher only)
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with started class details
   */
  async startLiveClass(id) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/liveClasses/${id}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error starting live class ${id}:`, error);
      throw error;
    }
  }

  /**
   * End a live class (teacher only)
   * @param {string} id - The live class ID
   * @returns {Promise} - Response with ended class details
   */
  async endLiveClass(id) {
    try {
      const token = await authService.getToken();
      const response = await api.post(`/liveClasses/${id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error ending live class ${id}:`, error);
      throw error;
    }
  }
}

export default new LiveClassService();

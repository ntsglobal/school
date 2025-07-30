import apiService from './api.js';

class UserService {
  // Get user profile
  async getProfile() {
    try {
      const response = await apiService.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/users/profile', profileData);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      const response = await apiService.delete('/users/profile');
      return response;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Get all users (Admin only)
  async getAllUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await apiService.get(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  // Update user role (Admin only)
  async updateUserRole(userId, role) {
    try {
      const response = await apiService.put(`/users/${userId}/role`, { role });
      return response;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  // Get students by parent
  async getStudentsByParent(parentId) {
    try {
      const response = await apiService.get(`/users/parent/${parentId}/students`);
      return response;
    } catch (error) {
      console.error('Get students by parent error:', error);
      throw error;
    }
  }

  // Get students by teacher
  async getStudentsByTeacher(teacherId) {
    try {
      const response = await apiService.get(`/users/teacher/${teacherId}/students`);
      return response;
    } catch (error) {
      console.error('Get students by teacher error:', error);
      throw error;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiService.uploadFile('/users/profile/avatar', formData);
      return response;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiService.patch('/users/profile/preferences', preferences);
      return response;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const response = await apiService.get(`/users/${userId}/stats`);
      return response;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const userService = new UserService();
export default userService;

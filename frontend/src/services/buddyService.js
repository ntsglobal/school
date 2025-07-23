import api from './api.js';

export const buddyService = {
  // Profile Management
  createBuddyProfile: async (profileData) => {
    const response = await api.post('/buddies/profile', profileData);
    return response.data;
  },

  getBuddyProfile: async () => {
    const response = await api.get('/buddies/profile');
    return response.data;
  },

  // Buddy Finding
  findBuddies: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item));
        } else {
          params.append(key, value);
        }
      }
    });

    const response = await api.get(`/buddies/find?${params.toString()}`);
    return response.data;
  },

  // Connection Management
  sendBuddyRequest: async (receiverId, message = '') => {
    const response = await api.post('/buddies/connect', {
      receiverId,
      message
    });
    return response.data;
  },

  respondToBuddyRequest: async (connectionId, action, message = '') => {
    const response = await api.put(`/buddies/connections/${connectionId}/respond`, {
      action, // 'accept' or 'decline'
      message
    });
    return response.data;
  },

  getBuddyConnections: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/buddies/connections${params}`);
    return response.data;
  },

  endBuddyConnection: async (connectionId, reason = '', rating = null, feedback = '') => {
    const response = await api.delete(`/buddies/connections/${connectionId}`, {
      data: { reason, rating, feedback }
    });
    return response.data;
  },

  // Statistics and Activity
  getBuddyStats: async () => {
    const response = await api.get('/buddies/stats');
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/buddies/activity?limit=${limit}`);
    return response.data;
  },

  // Utility Methods
  getLanguages: () => [
    'french',
    'japanese', 
    'german',
    'spanish',
    'korean',
    'chinese',
    'italian',
    'russian'
  ],

  getLevels: () => [
    { id: 'A1', name: 'A1 - Beginner' },
    { id: 'A2', name: 'A2 - Elementary' },
    { id: 'B1', name: 'B1 - Intermediate' },
    { id: 'B2', name: 'B2 - Upper Intermediate' },
    { id: 'C1', name: 'C1 - Advanced' },
    { id: 'C2', name: 'C2 - Proficient' }
  ],

  getTimezones: () => [
    'GMT-12:00',
    'GMT-11:00', 
    'GMT-10:00',
    'GMT-9:00',
    'GMT-8:00',
    'GMT-7:00',
    'GMT-6:00',
    'GMT-5:00',
    'GMT-4:00',
    'GMT-3:00',
    'GMT-2:00',
    'GMT-1:00',
    'GMT+0:00',
    'GMT+1:00',
    'GMT+2:00',
    'GMT+3:00',
    'GMT+4:00',
    'GMT+5:00',
    'GMT+5:30',
    'GMT+6:00',
    'GMT+7:00',
    'GMT+8:00',
    'GMT+9:00',
    'GMT+10:00',
    'GMT+11:00',
    'GMT+12:00'
  ],

  getInterests: () => [
    'music',
    'movies', 
    'sports',
    'cooking',
    'travel',
    'technology',
    'books',
    'games',
    'art',
    'science'
  ],

  getLearningGoals: () => [
    'conversation',
    'grammar',
    'pronunciation', 
    'writing',
    'reading',
    'business',
    'travel',
    'academic'
  ]
};

export default buddyService;

import apiService from './api.js';

// Simulate getting upcoming classes from the API
export const getUpcomingClasses = async () => {
  try {
    const response = await apiService.get('/liveClasses/upcoming');
    return response.data; // Backend returns { success: true, data: { liveClasses: [...] } }
  } catch (error) {
    console.error('Error fetching upcoming classes:', error);
    
    // Fallback to mock data if API fails
    return [
      {
        id: '1',
        title: 'Japanese Conversation Basics',
        instructor: 'Tanaka-sensei',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 60,
        participants: 12,
        maxParticipants: 15
      },
      {
        id: '2',
        title: 'Kanji Writing Practice',
        instructor: 'Yamada-sensei',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        duration: 45,
        participants: 8,
        maxParticipants: 10
      }
    ];
  }
};

// Get a specific live class by ID
export const getLiveClassById = async (id) => {
  try {
    const response = await apiService.get(`/liveClasses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live class:', error);
    throw error;
  }
};

// Create a new live class
export const createLiveClass = async (liveClassData) => {
  try {
    const response = await apiService.post('/liveClasses', liveClassData);
    return response.data;
  } catch (error) {
    console.error('Error creating live class:', error);
    throw error;
  }
};

// Update an existing live class
export const updateLiveClass = async (id, updates) => {
  try {
    const response = await apiService.put(`/liveClasses/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating live class:', error);
    throw error;
  }
};

// Delete a live class
export const deleteLiveClass = async (id) => {
  try {
    const response = await apiService.delete(`/liveClasses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting live class:', error);
    throw error;
  }
};

// Join a live class
export const joinLiveClass = async (id) => {
  try {
    const response = await apiService.post(`/liveClasses/${id}/join`, {});
    return response.data;
  } catch (error) {
    console.error('Error joining live class:', error);
    throw error;
  }
};

// Leave a live class
export const leaveLiveClass = async (id) => {
  try {
    const response = await apiService.post(`/liveClasses/${id}/leave`, {});
    return response.data;
  } catch (error) {
    console.error('Error leaving live class:', error);
    throw error;
  }
};

// Get all live classes
export const getAllLiveClasses = async () => {
  try {
    const response = await apiService.get('/liveClasses');
    return response.data;
  } catch (error) {
    console.error('Error fetching all live classes:', error);
    
    // Fallback to mock data if API fails
    return [
      {
        id: '1',
        title: 'Morning Japanese Conversation',
        instructor: 'Tanaka-sensei',
        scheduledTime: new Date().toISOString(),
        duration: 60,
        participants: 5,
        maxParticipants: 15,
        status: 'active'
      },
      {
        id: '2',
        title: 'Evening Grammar Review',
        instructor: 'Yamada-sensei',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        participants: 3,
        maxParticipants: 10,
        status: 'scheduled'
      }
    ];
  }
};

// Get user's enrolled live classes
export const getUserLiveClasses = async () => {
  try {
    const response = await apiService.get('/liveClasses/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user live classes:', error);
    
    // Fallback to mock data if API fails
    return [
      {
        id: '1',
        title: 'Morning Japanese Conversation',
        instructor: 'Tanaka-sensei',
        scheduledTime: new Date().toISOString(),
        duration: 60,
        participants: 5,
        maxParticipants: 15,
        status: 'active',
        enrolled: true
      }
    ];
  }
};

// Get live class participants
export const getLiveClassParticipants = async (id) => {
  try {
    const response = await apiService.get(`/liveClasses/${id}/participants`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live class participants:', error);
    throw error;
  }
};

// Start a live class session
export const startLiveClass = async (id) => {
  try {
    const response = await apiService.post(`/liveClasses/${id}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting live class:', error);
    throw error;
  }
};

// End a live class session
export const endLiveClass = async (id) => {
  try {
    const response = await apiService.post(`/liveClasses/${id}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending live class:', error);
    throw error;
  }
};

// Get live class recording
export const getLiveClassRecording = async (id) => {
  try {
    const response = await apiService.get(`/liveClasses/${id}/recording`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live class recording:', error);
    throw error;
  }
};

export default {
  getUpcomingClasses,
  getLiveClassById,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  joinLiveClass,
  leaveLiveClass,
  getAllLiveClasses,
  getUserLiveClasses,
  getLiveClassParticipants,
  startLiveClass,
  endLiveClass,
  getLiveClassRecording
};
import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    this.timeout = 30000; // 30 seconds
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now()
        };
        
        // Add authorization header if token exists
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor will be added by auth service
    this.responseInterceptors = [];
  }

  // Get stored token from localStorage
  getStoredToken() {
    return localStorage.getItem('firebaseToken') || localStorage.getItem('authToken');
  }

  // Set authorization token
  setToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Add response interceptor (used by auth service)
  addResponseInterceptor(onFulfilled, onRejected) {
    const interceptor = this.api.interceptors.response.use(onFulfilled, onRejected);
    this.responseInterceptors.push(interceptor);
    return interceptor;
  }

  // Enhanced error handling
  handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad request. Please check your input.');
        case 401:
          throw new Error(data.message || 'Authentication required. Please sign in.');
        case 403:
          throw new Error(data.message || 'Access denied. You don\'t have permission.');
        case 404:
          throw new Error(data.message || 'Resource not found.');
        case 409:
          throw new Error(data.message || 'Conflict. Resource already exists.');
        case 422:
          throw new Error(data.message || 'Validation failed. Please check your input.');
        case 429:
          throw new Error(data.message || 'Too many requests. Please try again later.');
        case 500:
          throw new Error('Internal server error. Please try again later.');
        case 502:
          throw new Error('Service temporarily unavailable. Please try again later.');
        case 503:
          throw new Error('Service maintenance in progress. Please try again later.');
        default:
          throw new Error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error('Unable to connect to server. Please try again later.');
      }
    } else {
      // Request setup error
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Generic request method with retry logic
  async request(config, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.api(config);
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except for 429 (rate limit)
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
          break;
        }
        
        // Don't retry on authentication errors
        if (error.response && error.response.status === 401) {
          break;
        }
        
        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    this.handleApiError(lastError);
  }

  // GET request
  async get(url, params = {}, config = {}) {
    return this.request({
      method: 'GET',
      url,
      params,
      ...config
    });
  }

  // POST request
  async post(url, data = {}, config = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...config
    });
  }

  // PUT request
  async put(url, data = {}, config = {}) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }

  // PATCH request
  async patch(url, data = {}, config = {}) {
    return this.request({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }

  // DELETE request
  async delete(url, config = {}) {
    return this.request({
      method: 'DELETE',
      url,
      ...config
    });
  }

  // Upload file with progress tracking
  async upload(url, formData, onProgress = null) {
    return this.request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  }

  // Download file
  async download(url, filename = null) {
    try {
      const response = await this.api({
        method: 'GET',
        url,
        responseType: 'blob',
      });

      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Get API status
  getStatus() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      hasToken: !!this.getStoredToken()
    };
  }
}

export default new ApiService();

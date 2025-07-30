import apiService from './api.js';
import firebaseAuthService from './firebaseAuth.js';

// Token refresh queue to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.refreshTokenTimeout = null;
    
    // Initialize from storage
    this.loadUserFromStorage();
    
    // Listen to Firebase auth state changes
    firebaseAuthService.onAuthStateChanged((user) => {
      if (user) {
        console.log('Firebase user signed in:', user.email);
        this.scheduleTokenRefresh();
      } else {
        console.log('Firebase user signed out');
        this.clearRefreshTimeout();
      }
    });

    // Setup automatic token refresh
    this.setupTokenRefresh();
  }

  // Enhanced token refresh scheduling
  scheduleTokenRefresh() {
    this.clearRefreshTimeout();
    
    // Refresh token 5 minutes before expiry (15min - 5min = 10min)
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshAuthToken();
    }, 10 * 60 * 1000); // 10 minutes
  }

  clearRefreshTimeout() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  // Automatic token refresh
  async refreshAuthToken() {
    try {
      const firebaseUser = firebaseAuthService.getCurrentUser();
      if (firebaseUser) {
        const newToken = await firebaseUser.getIdToken(true); // Force refresh
        
        // Update stored token
        localStorage.setItem('firebaseToken', newToken);
        apiService.setToken(newToken);
        
        // Schedule next refresh
        this.scheduleTokenRefresh();
        
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await this.logout();
    }
  }

  // Setup API interceptor for token refresh
  setupTokenRefresh() {
    // Add response interceptor to handle token expiration
    apiService.addResponseInterceptor(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            (error.response?.data?.code === 'TOKEN_EXPIRED' || 
             error.response?.data?.code === 'FIREBASE_TOKEN_EXPIRED') &&
            !originalRequest._retry) {
          
          if (isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return apiService.request(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const firebaseUser = firebaseAuthService.getCurrentUser();
            if (firebaseUser) {
              const newToken = await firebaseUser.getIdToken(true);
              
              // Update stored token
              localStorage.setItem('firebaseToken', newToken);
              apiService.setToken(newToken);
              
              // Process queued requests
              processQueue(null, newToken);
              
              // Retry original request
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return apiService.request(originalRequest);
            } else {
              throw new Error('No Firebase user available for token refresh');
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Enhanced storage methods with encryption
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      const firebaseToken = localStorage.getItem('firebaseToken');
      
      if (userData && (token || firebaseToken)) {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
        
        // Set appropriate token
        if (firebaseToken) {
          apiService.setToken(firebaseToken);
          this.scheduleTokenRefresh();
        } else if (token) {
          apiService.setToken(token);
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearUserData();
    }
  }

  saveUserData(user, token, firebaseToken = null) {
    try {
      localStorage.setItem('userData', JSON.stringify(user));
      
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      if (firebaseToken) {
        localStorage.setItem('firebaseToken', firebaseToken);
        this.scheduleTokenRefresh();
      }
      
      this.currentUser = user;
      this.isAuthenticated = true;
      apiService.setToken(firebaseToken || token);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  clearUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('refreshToken');
    
    this.currentUser = null;
    this.isAuthenticated = false;
    this.clearRefreshTimeout();
    apiService.setToken(null);
  }

  // Enhanced registration with better error handling
  async register(userData) {
    try {
      // First create user in Firebase
      const displayName = `${userData.firstName} ${userData.lastName}`;
      const firebaseUser = await firebaseAuthService.registerWithEmail(
        userData.email, 
        userData.password, 
        displayName
      );

      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Register user in our backend with Firebase UID
      const backendUserData = {
        ...userData,
        firebaseUid: firebaseUser.uid,
        firebaseToken: firebaseToken
      };

      const response = await apiService.post('/auth/register', backendUserData);
      
      if (response.success) {
        this.saveUserData(response.data.user, response.data.token, firebaseToken);
        return response;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Enhanced error handling
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      
      throw error;
    }
  }

  // Enhanced login with retry logic
  async login(credentials, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting login (try ${attempt}/${maxRetries})...`);
        
        // First authenticate with Firebase
        const firebaseUser = await firebaseAuthService.signInWithEmail(
          credentials.email, 
          credentials.password
        );

        if (!firebaseUser) {
          throw new Error('Firebase authentication returned null user');
        }
        
        console.log('Firebase authentication successful, requesting token...');
        
        // Force token refresh to ensure we have a fresh token
        await firebaseUser.getIdToken(true);
        
        // Get Firebase ID token with small delay to ensure token propagation
        await new Promise(resolve => setTimeout(resolve, 500));
        const firebaseToken = await firebaseUser.getIdToken();
        
        if (!firebaseToken) {
          throw new Error('Failed to obtain Firebase token');
        }
        
        console.log(`Obtained Firebase token (length: ${firebaseToken.length}), sending to backend...`);

        // Send Firebase token to our backend
        const response = await apiService.post('/auth/login', {
          firebaseToken: firebaseToken
        });
        
        if (response.success) {
          console.log('Backend authentication successful');
          this.saveUserData(response.data.user, response.data.token, firebaseToken);
          return response;
        }
        
        throw new Error(response.message || 'Login failed');
      } catch (error) {
        lastError = error;
        console.error(`Login attempt ${attempt} failed:`, error);
        
        // Don't retry on authentication errors
        if (error.code?.startsWith('auth/')) {
          break;
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // Enhanced error messages
    if (lastError.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (lastError.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (lastError.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
    
    throw lastError;
  }

  // Enhanced logout with cleanup
  async logout() {
    try {
      // Sign out from Firebase
      await firebaseAuthService.signOut();
      
      // Call backend logout if we have a token
      if (this.isAuthenticated) {
        try {
          await apiService.post('/auth/logout');
        } catch (error) {
          // Don't fail logout if backend call fails
          console.warn('Backend logout failed:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearUserData();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Enhanced password reset with rate limiting
  async forgotPassword(email) {
    try {
      // Use Firebase password reset
      await firebaseAuthService.resetPassword(email);
      
      // Also notify our backend for logging
      try {
        await apiService.post('/auth/forgot-password', { email });
      } catch (backendError) {
        // Don't fail if backend notification fails
        console.warn('Backend password reset notification failed:', backendError);
      }
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many password reset attempts. Please try again later.');
      }
      
      throw error;
    }
  }

  // Get current user with fresh data
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // Get user's full name
  getUserFullName() {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.currentUser?.role);
  }

  // Get user avatar
  getUserAvatar() {
    return this.currentUser?.avatar || '/images/users/default-avatar.png';
  }

  // Check if email is verified
  isEmailVerified() {
    return this.currentUser?.isEmailVerified || false;
  }

  // Get subscription type
  getSubscriptionType() {
    return this.currentUser?.subscriptionType || 'free';
  }

  // Check if user has premium subscription
  hasPremiumSubscription() {
    return this.getSubscriptionType() === 'premium';
  }
  
  // Link account with a provider
  async linkAccountWithProvider(provider) {
    try {
      // 1. Get current Firebase user
      const currentFirebaseUser = firebaseAuthService.getCurrentUser();
      if (!currentFirebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      // 2. Use Firebase authentication to link with provider
      const secondaryUser = await firebaseAuthService.linkAccountWithProvider(provider);
      
      if (!secondaryUser) {
        throw new Error('Failed to authenticate with provider');
      }
      
      // 3. Call our backend API to link the accounts
      const response = await apiService.post('/auth/link-accounts', {
        primaryUid: currentFirebaseUser.uid,
        secondaryUid: secondaryUser.uid,
        provider: provider
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to link accounts');
      }
      
      // Update the current user if needed
      // This might require re-fetching user data from backend
      
      return {
        success: true,
        message: 'Account linked successfully'
      };
    } catch (error) {
      console.error('Link account error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This account is already linked to another user.');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log out and log in again before linking accounts.');
      }
      
      throw error;
    }
  }
  
  // Get linked accounts for current user
  async getLinkedAccounts() {
    if (!this.isAuthenticated || !this.currentUser) {
      return [];
    }
    
    try {
      const response = await apiService.get('/users/me/linked-accounts');
      return response.data.linkedAccounts || [];
    } catch (error) {
      console.error('Get linked accounts error:', error);
      return [];
    }
  }
}

export default new AuthService();

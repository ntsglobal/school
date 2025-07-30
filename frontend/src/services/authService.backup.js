import apiService from './api.js';
import firebaseAuthService from './firebaseAuth.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.loadUserFromStorage();
    
    // Listen to Firebase auth state changes
    firebaseAuthService.onAuthStateChanged((user) => {
      if (user) {
        console.log('Firebase user signed in:', user.email);
      } else {
        console.log('Firebase user signed out');
      }
    });
  }

  // Load user data from localStorage
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
        apiService.setToken(token);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearUserData();
    }
  }

  // Save user data to localStorage
  saveUserData(user, token) {
    try {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      this.currentUser = user;
      this.isAuthenticated = true;
      apiService.setToken(token);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Clear user data from localStorage
  clearUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    this.currentUser = null;
    this.isAuthenticated = false;
    apiService.setToken(null);
  }

  // Register new user
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
        this.saveUserData(response.data.user, response.data.token);
        return response;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      // First authenticate with Firebase
      const firebaseUser = await firebaseAuthService.signInWithEmail(
        credentials.email, 
        credentials.password
      );

      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Send Firebase token to our backend
      const response = await apiService.post('/auth/login', {
        firebaseToken: firebaseToken
      });
      
      if (response.success) {
        this.saveUserData(response.data.user, response.data.token);
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      // Sign out from Firebase
      await firebaseAuthService.signOut();
      
      // Call backend logout
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearUserData();
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await apiService.post('/auth/reset-password', { token, password });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiService.post('/auth/verify-email', { token });
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email
  async resendVerification(email) {
    try {
      const response = await apiService.post('/auth/resend-verification', { email });
      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post('/auth/refresh-token', { refreshToken });
      
      if (response.success) {
        apiService.setToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
        return response;
      }
      
      throw new Error(response.message || 'Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearUserData();
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser && apiService.getToken();
  }

  // Check user role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return this.currentUser && roles.includes(this.currentUser.role);
  }

  // Get user's full name
  getUserFullName() {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  // Get user's avatar URL
  getUserAvatar() {
    return this.currentUser?.avatar || '/default-avatar.png';
  }

  // Check if user's email is verified
  isEmailVerified() {
    return this.currentUser?.isEmailVerified || false;
  }

  // Get user's subscription type
  getSubscriptionType() {
    return this.currentUser?.subscriptionType || 'free';
  }

  // Check if user has premium subscription
  hasPremiumSubscription() {
    const subscriptionType = this.getSubscriptionType();
    return subscriptionType === 'basic' || subscriptionType === 'premium';
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

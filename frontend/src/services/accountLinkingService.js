import apiService from './api.js';
import authService from './authService.js';
import firebaseAuthService from './firebaseAuth.js';

/**
 * Account Linking Service
 * 
 * This service provides functionality for linking different authentication providers
 * to a user's account (e.g., linking Google login with email login).
 */
class AccountLinkingService {
  /**
   * Check if an email exists and what authentication providers it uses
   * @param {string} email - The email to check
   * @returns {Promise<Object>} - Result with provider information
   */
  async checkEmail(email) {
    try {
      const response = await apiService.post('/auth/check-email', { email });
      return response;
    } catch (error) {
      console.error('Check email error:', error);
      throw error;
    }
  }
  
  /**
   * Link current account with a new provider
   * @param {string} provider - The provider to link with ('google', 'facebook', etc.)
   * @returns {Promise<Object>} - Result of the linking process
   */
  async linkWithProvider(provider) {
    try {
      // 1. First check if the user is authenticated
      if (!authService.isAuthenticated) {
        throw new Error('User must be logged in to link accounts');
      }
      
      // 2. Use Firebase authentication to link with provider
      const secondaryUser = await firebaseAuthService.linkAccountWithProvider(provider);
      
      if (!secondaryUser) {
        throw new Error('Failed to authenticate with provider');
      }
      
      // 3. Get current Firebase user
      const currentFirebaseUser = firebaseAuthService.getCurrentUser();
      
      // 4. Link the accounts in the backend
      const response = await apiService.post('/auth/link-accounts', {
        primaryUid: currentFirebaseUser.uid,
        secondaryUid: secondaryUser.uid,
        provider: provider
      });
      
      return response;
    } catch (error) {
      console.error('Link with provider error:', error);
      throw error;
    }
  }
  
  /**
   * Get all linked accounts for current user
   * @returns {Promise<Array>} - Array of linked accounts
   */
  async getLinkedAccounts() {
    try {
      const response = await apiService.get('/users/me/linked-accounts');
      return response.data.linkedAccounts || [];
    } catch (error) {
      console.error('Get linked accounts error:', error);
      return [];
    }
  }
  
  /**
   * Remove a linked account
   * @param {string} linkedAccountId - The ID of the linked account to remove
   * @returns {Promise<Object>} - Result of the removal
   */
  async removeLinkedAccount(linkedAccountId) {
    try {
      const response = await apiService.delete(`/users/me/linked-accounts/${linkedAccountId}`);
      return response;
    } catch (error) {
      console.error('Remove linked account error:', error);
      throw error;
    }
  }
}

export default new AccountLinkingService();
